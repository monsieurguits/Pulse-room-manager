'use client';

import { useEffect, useRef, useState } from 'react';

export interface RealtimeMemberState {
  remainingCredit: number;
  elapsedSeconds: number;
  isControlling: boolean;
  canControl: boolean;
  isWaiting: boolean;
  connected: boolean;
  battery: number | null;
  lastMessage: string | null;
}

/**
 * Hook client : ouvre une connexion WebSocket vers le serveur temps réel
 * (src/lib/websocket/server.ts) filtrée sur un memberId, et met à jour
 * l'état local à chaque tick de crédit / changement de statut.
 * Le chronomètre reste synchronisé avec le serveur (jamais un setInterval
 * client livré à lui-même) : chaque tick reçu écrase la valeur locale.
 */
export function useRealtimeMember(memberId: string, initial: RealtimeMemberState, controlClientId: string | null) {
  const [state, setState] = useState<RealtimeMemberState>(initial);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let shouldReconnect = true;
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT ?? '4001';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    const socket = new WebSocket(`${protocol}://${host}:${wsPort}/`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Record<string, unknown>;

      setState((prev) => {
        switch (payload.type) {
          case 'credit-tick':
            if (payload.memberId !== memberId) return prev;
            return {
              ...prev,
              remainingCredit: payload.remainingCredit as number,
              elapsedSeconds: payload.elapsedSeconds as number,
              isControlling: payload.isControlling as boolean,
            };
          case 'session-started':
            if (payload.memberId !== memberId) {
              return {
                ...prev,
                isControlling: true,
                canControl: false,
                isWaiting: true,
              };
            }

            return {
              ...prev,
              isControlling: true,
              elapsedSeconds: 0,
              canControl: Boolean(controlClientId && payload.controlClientId === controlClientId),
              isWaiting: !controlClientId || payload.controlClientId !== controlClientId,
            };
          case 'session-stopped':
            if (payload.memberId !== memberId && !prev.isWaiting) return prev;
            return { ...prev, isControlling: false, canControl: false, isWaiting: false };
          case 'device-status':
            if (payload.memberId !== memberId) return prev;
            return {
              ...prev,
              connected: payload.connected as boolean,
              battery: (payload.battery as number | null) ?? prev.battery,
            };
          case 'command-result':
            if (payload.memberId !== memberId) return prev;
            return { ...prev, lastMessage: payload.message as string };
          default:
            return prev;
        }
      });
    };

    // Reconnexion automatique si le serveur WS redémarre.
    socket.onclose = () => {
      if (!shouldReconnect) return;
      window.setTimeout(() => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          setReconnectAttempt((attempt) => attempt + 1);
        }
      }, 2000);
    };

    return () => {
      shouldReconnect = false;
      socket.close();
    };
  }, [memberId, reconnectAttempt, controlClientId]);

  useEffect(() => {
    if (!controlClientId) return;

    let cancelled = false;

    async function refreshOwnership() {
      const params = new URLSearchParams({ memberId, controlClientId: controlClientId! });
      const response = await fetch(`/api/control/status?${params.toString()}`);
      if (!response.ok || cancelled) return;

      const payload = await response.json();
      setState((prev) => ({
        ...prev,
        remainingCredit: payload.remainingCredit as number,
        elapsedSeconds: payload.elapsedSeconds as number,
        isControlling: payload.isControlling as boolean,
        canControl: payload.canControl as boolean,
        isWaiting: payload.isWaiting as boolean,
        connected: payload.connected as boolean,
        battery: payload.battery as number | null,
      }));
    }

    refreshOwnership().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [memberId, controlClientId]);

  return state;
}

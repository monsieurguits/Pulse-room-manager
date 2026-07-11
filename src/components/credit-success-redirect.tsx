'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CreditSuccessRedirectProps {
  href: string;
}

export function CreditSuccessRedirect({ href }: CreditSuccessRedirectProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace(href);
    }, 5000);

    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdownTimer);
    };
  }, [href, router]);

  return (
    <div className="mt-5 space-y-3">
      <p className="text-xs text-neutral-500">Retour automatique vers votre espace dans {secondsLeft} s.</p>
      <Link href={href} className="btn-accent w-full justify-center">
        Retourner maintenant à mon espace
      </Link>
    </div>
  );
}

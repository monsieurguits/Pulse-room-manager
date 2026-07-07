from __future__ import annotations

import os
import shutil
from dataclasses import dataclass

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "output", "pdf", "manuel-complet-pulseroom.pdf")
PUBLIC_OUT = os.path.join(ROOT, "public", "manuel-complet-pulseroom.pdf")
LOGO = os.path.join(ROOT, "public", "pulseroom-logo-transparent.png")
MARK = os.path.join(ROOT, "public", "pulseroom-mark-transparent.png")

W, H = A4
M = 42

BG = colors.HexColor("#050509")
PANEL = colors.Color(0.045, 0.045, 0.068, alpha=0.92)
PANEL_2 = colors.Color(0.075, 0.075, 0.11, alpha=0.96)
LINE = colors.Color(1, 1, 1, alpha=0.12)
TEXT = colors.HexColor("#F8FAFC")
MUTED = colors.HexColor("#B5B5C3")
DIM = colors.HexColor("#747480")
ROSE = colors.HexColor("#FF2E6D")
PINK = colors.HexColor("#FF67AD")
CYAN = colors.HexColor("#00D8FF")
VIOLET = colors.HexColor("#8B5CF6")
GREEN = colors.HexColor("#34D399")
AMBER = colors.HexColor("#FBBF24")


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Black.ttf",
        ),
        (
            "/Library/Fonts/Arial.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/Library/Fonts/Arial Black.ttf",
        ),
    ]
    for regular, bold, black in candidates:
        if os.path.exists(regular) and os.path.exists(bold) and os.path.exists(black):
            pdfmetrics.registerFont(TTFont("PulseRegular", regular))
            pdfmetrics.registerFont(TTFont("PulseBold", bold))
            pdfmetrics.registerFont(TTFont("PulseBlack", black))
            return "PulseRegular", "PulseBold", "PulseBlack"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Bold"


FONT, BOLD, BLACK = register_fonts()


@dataclass
class ButtonDoc:
    label: str
    role: str
    note: str = ""
    accent: colors.Color = CYAN


def text_lines(text: str, max_w: float, font: str, size: float) -> list[str]:
    lines: list[str] = []
    for raw in text.split("\n"):
        words = raw.split()
        if not words:
            lines.append("")
            continue
        line = ""
        for word in words:
            test = f"{line} {word}".strip()
            if pdfmetrics.stringWidth(test, font, size) <= max_w:
                line = test
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
    return lines


def draw_text(c: canvas.Canvas, text: str, x: float, y: float, max_w: float, font: str, size: float, color=TEXT, leading=None) -> float:
    c.setFillColor(color)
    c.setFont(font, size)
    leading = leading or size * 1.36
    for line in text_lines(text, max_w, font, size):
        c.drawString(x, y, line)
        y -= leading
    return y


def rounded_rect(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=PANEL, stroke=LINE, radius=16):
    c.saveState()
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    c.restoreState()


def page_bg(c: canvas.Canvas):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.saveState()
    c.setFillAlpha(0.34)
    c.setFillColor(ROSE)
    c.circle(95, H - 120, 160, fill=1, stroke=0)
    c.setFillAlpha(0.24)
    c.setFillColor(CYAN)
    c.circle(W - 80, 210, 170, fill=1, stroke=0)
    c.setFillAlpha(0.18)
    c.setFillColor(VIOLET)
    c.circle(W - 125, H - 160, 115, fill=1, stroke=0)
    c.restoreState()
    c.saveState()
    c.setFillAlpha(0.80)
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.restoreState()


def header(c: canvas.Canvas, page_no: int, section: str):
    c.drawImage(ImageReader(MARK), M, H - 49, 27, 24, mask="auto", preserveAspectRatio=True, anchor="c")
    c.setFont(BLACK, 10)
    c.setFillColor(TEXT)
    c.drawString(M + 36, H - 42, "PULSEROOM")
    c.setFont(FONT, 8.5)
    c.setFillColor(DIM)
    c.drawRightString(W - M, H - 42, section.upper())
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.10))
    c.line(M, H - 66, W - M, H - 66)
    c.setFont(FONT, 8)
    c.setFillColor(DIM)
    c.drawRightString(W - M, 24, f"Manuel complet - page {page_no}")


def page_title(c: canvas.Canvas, title: str, subtitle: str | None = None):
    c.setFont(BLACK, 24)
    c.setFillColor(TEXT)
    c.drawString(M, H - 112, title)
    if subtitle:
        draw_text(c, subtitle, M, H - 137, W - 2 * M, FONT, 10.5, MUTED, 15)


def pill(c: canvas.Canvas, x: float, y: float, label: str, color=ROSE, w: float | None = None):
    width = w or max(84, pdfmetrics.stringWidth(label.upper(), BOLD, 7.5) + 24)
    c.setFillColor(color)
    c.roundRect(x, y - 19, width, 24, 12, fill=1, stroke=0)
    c.setFont(BOLD, 7.5)
    c.setFillColor(colors.white)
    c.drawCentredString(x + width / 2, y - 10.5, label.upper())


def card(c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str, body: str, accent=ROSE, number: str | int | None = None):
    rounded_rect(c, x, y, w, h, PANEL)
    c.setFillColor(accent)
    c.roundRect(x + 14, y + h - 20, 44, 5, 3, fill=1, stroke=0)
    if number is not None:
        c.setFont(BLACK, 18)
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.12))
        c.drawRightString(x + w - 14, y + h - 29, str(number).zfill(2) if isinstance(number, int) else str(number))
    c.setFont(BOLD, 12.5)
    c.setFillColor(TEXT)
    c.drawString(x + 14, y + h - 43, title)
    draw_text(c, body, x + 14, y + h - 65, w - 28, FONT, 9.2, MUTED, 12.5)


def button_row(c: canvas.Canvas, x: float, y: float, w: float, doc: ButtonDoc) -> float:
    h = 52
    rounded_rect(c, x, y - h, w, h, PANEL_2)
    c.setFillColor(doc.accent)
    c.roundRect(x + 12, y - 34, 88, 24, 12, fill=1, stroke=0)
    c.setFont(BOLD, 8)
    c.setFillColor(colors.white)
    c.drawCentredString(x + 56, y - 25.5, doc.label.upper()[:22])
    c.setFont(BOLD, 9.7)
    c.setFillColor(TEXT)
    c.drawString(x + 114, y - 19, doc.role)
    if doc.note:
        draw_text(c, doc.note, x + 114, y - 34, w - 128, FONT, 8.2, DIM, 10)
    return y - h - 9


def bullet_list(c: canvas.Canvas, items: list[str], x: float, y: float, w: float, color=CYAN, gap=22) -> float:
    for item in items:
        c.setFillColor(color)
        c.circle(x + 5, y + 3, 3.5, fill=1, stroke=0)
        next_y = draw_text(c, item, x + 18, y, w - 18, FONT, 9.3, MUTED, 12)
        y = min(y - gap, next_y - 6)
    return y


def table(c: canvas.Canvas, x: float, y: float, w: float, rows: list[tuple[str, str]], accent=ROSE) -> float:
    for label, desc in rows:
        lines = text_lines(desc, w - 175, FONT, 8.6)
        h = max(40, 24 + len(lines) * 10.8)
        rounded_rect(c, x, y - h, w, h, PANEL_2, colors.Color(1, 1, 1, alpha=0.08), 12)
        c.setFont(BOLD, 9)
        c.setFillColor(accent)
        c.drawString(x + 13, y - 22, label)
        draw_text(c, desc, x + 170, y - 19, w - 185, FONT, 8.6, MUTED, 10.8)
        y -= h + 8
    return y


def cover(c: canvas.Canvas):
    page_bg(c)
    c.drawImage(ImageReader(LOGO), W / 2 - 148, H - 392, 296, 296, mask="auto", preserveAspectRatio=True, anchor="c")
    c.setFont(BLACK, 31)
    c.setFillColor(TEXT)
    c.drawCentredString(W / 2, 354, "MANUEL COMPLET")
    c.setFont(BOLD, 15)
    c.setFillColor(CYAN)
    c.drawCentredString(W / 2, 328, "Pages, boutons et fonctions du site")
    rounded_rect(c, M, 198, W - 2 * M, 84, colors.Color(1, 1, 1, alpha=0.06), colors.Color(1, 1, 1, alpha=0.13), 22)
    draw_text(
        c,
        "Guide professionnel pour comprendre PULSEROOM: accès admin, modèles, membres, Lovense, contrôle membre, tips, overlay OBS, sécurité et mise en ligne.",
        M + 24,
        248,
        W - 2 * M - 48,
        FONT,
        11,
        TEXT,
        16,
    )
    c.setFont(FONT, 9)
    c.setFillColor(DIM)
    c.drawCentredString(W / 2, 62, "Document interne - version 2026")
    c.showPage()


def page_summary(c):
    page_bg(c)
    header(c, 2, "Sommaire")
    page_title(c, "Sommaire", "Ce manuel suit le parcours réel du site, depuis la connexion jusqu'à l'utilisation en live.")
    items = [
        ("01", "Connexion et accès légal", "Se connecter, accepter les documents, sécuriser le compte."),
        ("02", "Tableau de bord", "Lire les indicateurs, suivre les sessions et les connexions."),
        ("03", "Membres", "Créer, modifier, suspendre, supprimer et partager les liens."),
        ("04", "Lovense", "Connecter un jouet, lire le statut, comprendre les callbacks."),
        ("05", "Contrôle membre", "Démarrer, pause, stop, intensité, patterns et file d'attente."),
        ("06", "Tips et overlay OBS", "Comprendre les tips en attente et afficher les annonces live."),
        ("07", "Compte, paramètres, modèles", "Mot de passe, support, API Lovense, comptes modèles."),
        ("08", "Sécurité et checklist", "Bonnes pratiques avant diffusion et avant déploiement."),
    ]
    y = 622
    for num, title, body in items:
        rounded_rect(c, M, y - 54, W - 2 * M, 48, PANEL)
        c.setFont(BLACK, 14)
        c.setFillColor(ROSE if int(num) % 2 else CYAN)
        c.drawString(M + 15, y - 35, num)
        c.setFont(BOLD, 11)
        c.setFillColor(TEXT)
        c.drawString(M + 58, y - 24, title)
        c.setFont(FONT, 8.6)
        c.setFillColor(MUTED)
        c.drawString(M + 58, y - 39, body)
        y -= 59
    c.showPage()


def page_login_legal(c):
    page_bg(c)
    header(c, 3, "Connexion")
    page_title(c, "Connexion et validation légale", "Ces pages protègent l'accès administrateur et imposent l'acceptation des règles aux modèles.")
    card(c, M, 548, 248, 94, "Page /login", "Email + mot de passe. Le bouton Connexion ouvre l'espace admin si les identifiants sont valides.", CYAN, 1)
    card(c, M + 268, 548, 248, 94, "Première connexion modèle", "Si les documents n'ont pas été acceptés, le modèle est redirigé vers la page d'acceptation.", ROSE, 2)
    y = 410
    pill(c, M, y + 30, "Boutons")
    y = button_row(c, M, y, W - 2 * M, ButtonDoc("Connexion", "Valide l'email et le mot de passe.", "En cas d'erreur, vérifier l'email, le mot de passe et que le compte n'est pas suspendu.", ROSE))
    y = button_row(c, M, y, W - 2 * M, ButtonDoc("Valider l'acceptation", "Active l'accès modèle après lecture des documents.", "La case obligatoire confirme la majorité et l'acceptation CGU/confidentialité.", CYAN))
    rounded_rect(c, M, 116, W - 2 * M, 100, PANEL_2)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(M + 18, 182, "Pages légales couvertes")
    bullet_list(c, ["Conditions Générales d'Utilisation.", "Politique de confidentialité et RGPD.", "Mentions légales.", "Conditions de vente si abonnement."], M + 20, 158, W - 2 * M - 40, VIOLET, 18)
    c.showPage()


def page_dashboard(c):
    page_bg(c)
    header(c, 4, "Tableau de bord")
    page_title(c, "Tableau de bord", "La page d'accueil admin donne une vision rapide de l'activité et de l'état des membres.")
    cards = [
        ("Membres", "Nombre total de membres gérés par le compte connecté.", ROSE),
        ("Connectés", "Nombre de membres dont le jouet Lovense est actuellement disponible.", CYAN),
        ("Sessions actives", "Contrôles en cours au moment où la page est affichée.", VIOLET),
        ("Activité semaine", "Graphique des minutes utilisées sur la période récente.", PINK),
    ]
    for i, (t, b, a) in enumerate(cards):
        card(c, M + (i % 2) * 268, 520 - (i // 2) * 136, 248, 106, t, b, a, i + 1)
    rounded_rect(c, M, 158, W - 2 * M, 135, PANEL_2)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(M + 18, 258, "Comment l'utiliser")
    bullet_list(
        c,
        [
            "Vérifier que les membres prévus pour le live sont actifs et connectés.",
            "Repérer rapidement les sessions récentes ou encore ouvertes.",
            "Confirmer que le crédit restant correspond bien aux accès vendus.",
        ],
        M + 20,
        232,
        W - 2 * M - 40,
        CYAN,
        23,
    )
    c.showPage()


def page_members_list(c):
    page_bg(c)
    header(c, 5, "Membres")
    page_title(c, "Liste des membres", "Cette page sert à gérer les accès individuels des membres du fanclub.")
    rows = [
        ("Rechercher", "Filtre la liste par pseudo pour retrouver rapidement un membre."),
        ("Nouveau membre", "Ouvre le formulaire de création d'un membre."),
        ("Copier le lien", "Copie le lien sécurisé du membre pour le partager."),
        ("Ouvrir", "Ouvre le lien public de contrôle dans un nouvel onglet."),
        ("QR Code", "Ouvre la page d'appairage Lovense du membre."),
        ("Réinitialiser crédit", "Remet le crédit hebdomadaire du membre à son niveau prévu."),
        ("Modifier", "Ouvre le formulaire de modification du membre."),
        ("Suspendre/Réactiver", "Bloque ou rétablit l'accès public du membre."),
        ("Supprimer", "Supprime définitivement le membre et ses accès."),
    ]
    table(c, M, 640, W - 2 * M, rows, CYAN)
    c.showPage()


def page_member_form(c):
    page_bg(c)
    header(c, 6, "Formulaire membre")
    page_title(c, "Créer ou modifier un membre", "Les champs du formulaire définissent qui peut contrôler, quand, et pendant combien de temps.")
    rows = [
        ("Pseudo", "Nom affiché dans l'admin, la fiche membre et l'overlay OBS."),
        ("Plateforme", "Origine du membre: OnlyFans, Chaturbate, Cam4, Stripchat, Twitch ou autre."),
        ("Membre depuis", "Date utilisée pour garder un historique commercial propre."),
        ("Début de validité", "Premier jour où le lien peut être utilisé."),
        ("Fin de validité", "Dernier jour d'accès autorisé."),
        ("Niveau Fanclub", "Définit automatiquement le crédit hebdomadaire: Bronze 5 min, Argent 7 min, Or 10 min."),
        ("Annuler", "Retourne à la page précédente sans enregistrer."),
        ("Créer/Mettre à jour", "Enregistre les informations et retourne vers la liste des membres."),
    ]
    table(c, M, 640, W - 2 * M, rows, ROSE)
    c.showPage()


def page_member_detail_qr(c):
    page_bg(c)
    header(c, 7, "Fiche membre")
    page_title(c, "Fiche membre et appairage Lovense", "La fiche membre centralise le lien public, le statut Lovense et l'historique.")
    card(c, M, 530, 248, 108, "Ouvrir le lien", "Permet de tester l'interface publique du membre dans un nouvel onglet.", CYAN, 1)
    card(c, M + 268, 530, 248, 108, "Copier le lien sécurisé", "Copie l'URL à envoyer au membre. Ce lien ne donne pas accès à l'admin.", ROSE, 2)
    card(c, M, 386, 248, 108, "QR Code Lovense", "Affiche le QR à scanner avec Lovense Remote pour associer le jouet au membre.", VIOLET, 3)
    card(c, M + 268, 386, 248, 108, "Modifier", "Ouvre le formulaire pour changer dates, niveau ou plateforme.", PINK, 4)
    rounded_rect(c, M, 140, W - 2 * M, 168, PANEL_2)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(M + 18, 274, "Statuts Lovense")
    bullet_list(
        c,
        [
            "Connecté: le jouet peut recevoir les commandes.",
            "Déconnecté: vérifier Lovense Remote, Bluetooth, batterie et réseau.",
            "Batterie: indication utile avant de lancer une diffusion.",
            "Nom du jouet: utilisé aussi dans l'overlay OBS.",
        ],
        M + 20,
        248,
        W - 2 * M - 40,
        GREEN,
        24,
    )
    c.showPage()


def page_control(c):
    page_bg(c)
    header(c, 8, "Controle membre")
    page_title(c, "Page de contrôle membre", "C'est la page publique que le membre utilise. Elle est limitée par son crédit, son statut et la disponibilité du jouet.")
    rows = [
        ("Démarrer", "Lance une session et démarre la vibration à l'intensité sélectionnée."),
        ("Pause", "Stoppe temporairement le jouet sans donner le contrôle à quelqu'un d'autre."),
        ("Reprendre", "Relance la vibration après une pause."),
        ("Arrêter", "Termine la session, stoppe le jouet et libère la place."),
        ("Intensité 0-20", "Contrôle manuel de la puissance. Les changements sont envoyés rapidement au jouet."),
        ("Presets rapides", "Pulse, Wave, Fireworks et Earthquake sont des patterns prédéfinis."),
        ("Patterns perso", "Montée, Vagues et Impulsions sont des patterns personnalisés PULSEROOM."),
        ("Tous / Jouet précis", "Si plusieurs jouets sont connectés, choisit la cible avant de démarrer."),
        ("Liste d'attente", "Affiché si une autre personne contrôle déjà le jouet."),
    ]
    table(c, M, 640, W - 2 * M, rows, PINK)
    c.showPage()


def page_tips(c):
    page_bg(c)
    header(c, 9, "Tips")
    page_title(c, "Tips CAM4, Stripchat et file d'attente", "PULSEROOM peut recevoir des tips via webhook et les transformer en commandes Lovense.")
    card(c, M, 528, W - 2 * M, 92, "Quand aucun membre ne contrôle", "Le tip est lancé directement selon la commande reçue: vibration, pattern, preset ou fonction.", CYAN, 1)
    card(c, M, 404, W - 2 * M, 92, "Quand un membre contrôle déjà", "Le tip est enregistré en attente. Il sera joué après la fin du contrôle membre.", ROSE, 2)
    card(c, M, 280, W - 2 * M, 92, "Ordre de lecture", "Les tips en attente sont traités du plus ancien au plus récent, tant qu'aucune session membre active ne bloque la lecture.", VIOLET, 3)
    rounded_rect(c, M, 116, W - 2 * M, 110, PANEL_2)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(M + 18, 188, "À configurer côté plateforme")
    draw_text(c, "CAM4 ou Stripchat doivent envoyer le tip vers le webhook PULSEROOM. Sans intégration webhook/API, le site ne peut pas deviner automatiquement qu'un tip a été envoyé.", M + 18, 164, W - 2 * M - 36, FONT, 10, MUTED, 14)
    c.showPage()


def page_obs(c):
    page_bg(c)
    header(c, 10, "Overlay OBS")
    page_title(c, "Overlay OBS", "L'overlay affiche automatiquement une annonce visuelle quand un membre prend ou termine le contrôle.")
    rows = [
        ("Bloc Compte > Overlay OBS", "Affiche le lien privé du modèle."),
        ("Copier", "Copie l'URL complète à coller dans OBS."),
        ("Aperçu", "Ouvre l'overlay dans un nouvel onglet pour vérifier le rendu."),
        ("Source navigateur OBS", "Ajouter une source navigateur, coller l'URL, définir une taille 1920 x 1080."),
        ("Fond transparent", "La page overlay est conçue pour être transparente dans OBS."),
        ("Annonce automatique", "Exemple: Pseudo a pris le contrôle du jouet Lush 3."),
    ]
    table(c, M, 640, W - 2 * M, rows, CYAN)
    rounded_rect(c, M, 98, W - 2 * M, 86, colors.Color(0, 0.85, 1, alpha=0.08), colors.Color(0, 0.85, 1, alpha=0.24), 16)
    c.setFont(BOLD, 12)
    c.setFillColor(CYAN)
    c.drawString(M + 18, 151, "Confidentialité")
    draw_text(c, "Chaque compte possède son token overlay. Ne pas publier ce lien dans le chat: il est fait pour OBS ou un outil privé.", M + 18, 129, W - 2 * M - 36, FONT, 9.4, TEXT, 13)
    c.showPage()


def page_account(c):
    page_bg(c)
    header(c, 11, "Compte")
    page_title(c, "Page Compte", "Cette page rassemble profil, sécurité, documents, overlay, Lovense et support.")
    rows = [
        ("Profil", "Nom, email, rôle, dates et version légale."),
        ("Documents légaux", "Relire les conditions ou ouvrir le guide PDF modèle."),
        ("Sécurité", "Changer son mot de passe admin."),
        ("Déconnecter tous les appareils", "Ferme toutes les sessions admin ouvertes."),
        ("Overlay OBS", "Copier le lien privé de l'overlay live."),
        ("Résumé Lovense", "Voir membres, appairés, connectés et sessions actives."),
        ("Support", "Informations à fournir en cas de problème, avec l'adresse support configurée."),
    ]
    table(c, M, 640, W - 2 * M, rows, VIOLET)
    c.showPage()


def page_settings_models(c):
    page_bg(c)
    header(c, 12, "Paramètres et modèles")
    page_title(c, "Paramètres Lovense et espace propriétaire", "Certaines pages sont réservées au propriétaire de la plateforme.")
    card(c, M, 520, 248, 108, "Paramètres", "Nom application, Developer Token Lovense, Callback URL, heartbeat et domaine public.", CYAN, 1)
    card(c, M + 268, 520, 248, 108, "Enregistrer", "Sauvegarde les réglages Lovense. Le token n'est jamais renvoyé au navigateur.", ROSE, 2)
    card(c, M, 374, 248, 108, "Modèles", "Créer un compte modèle avec nom, email et mot de passe initial.", VIOLET, 3)
    card(c, M + 268, 374, 248, 108, "Actions modèles", "Suspendre, réactiver, réinitialiser le mot de passe ou supprimer un modèle.", PINK, 4)
    rounded_rect(c, M, 150, W - 2 * M, 136, PANEL_2)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(M + 18, 252, "Important pour la revente")
    bullet_list(
        c,
        [
            "Chaque modèle voit uniquement ses propres membres.",
            "Le propriétaire garde une vue globale et peut créer de nouveaux modèles.",
            "La suppression d'un modèle doit être utilisée avec prudence.",
        ],
        M + 20,
        226,
        W - 2 * M - 40,
        AMBER,
        24,
    )
    c.showPage()


def page_deploy(c):
    page_bg(c)
    header(c, 13, "Mise en ligne")
    page_title(c, "Vercel, Turso et déploiement", "Ces points évitent les erreurs les plus fréquentes après une mise en ligne.")
    rows = [
        ("Variables Vercel", "DATABASE_URL, DATABASE_AUTH_TOKEN, variables Lovense, secrets d'auth et domaine public."),
        ("Migrations Turso", "Appliquer les migrations SQL avant d'utiliser une nouvelle fonctionnalité qui modifie la base."),
        ("Build", "Le script npm run build régénère Prisma puis compile Next."),
        ("Callback Lovense", "Le domaine public doit pointer vers /api/lovense/callback."),
        ("Overlay production", "Les modèles doivent copier l'URL Vercel, pas l'URL localhost."),
        ("Test final", "Créer un membre test, connecter le jouet, démarrer, stopper, vérifier l'overlay et un tip."),
    ]
    table(c, M, 640, W - 2 * M, rows, GREEN)
    c.showPage()


def page_security(c):
    page_bg(c)
    header(c, 14, "Sécurité")
    page_title(c, "Sécurité et bonnes pratiques", "PULSEROOM manipule des accès privés et des appareils connectés. Les règles ci-dessous sont essentielles.")
    items = [
        "Ne jamais partager un mot de passe admin avec un membre.",
        "Créer un compte modèle séparé pour chaque diffuseur.",
        "Supprimer ou suspendre les membres qui ne doivent plus avoir accès.",
        "Vérifier la validité des dates avant d'envoyer un lien.",
        "Tester Start et Stop avant une diffusion importante.",
        "Garder Lovense Remote ouvert et le jouet chargé.",
        "Ne pas publier les liens overlay OBS publiquement.",
        "Documenter l'heure et le message exact en cas d'erreur.",
    ]
    rounded_rect(c, M, 184, W - 2 * M, 430, PANEL)
    bullet_list(c, items, M + 26, 574, W - 2 * M - 52, ROSE, 42)
    c.showPage()


def page_checklist(c):
    page_bg(c)
    header(c, 15, "Checklist")
    page_title(c, "Checklist avant live", "Une page à garder sous la main avant de lancer une diffusion.")
    sections = [
        ("Compte", ["Je suis connecté au bon compte modèle.", "Mon mot de passe est personnel.", "La page Compte ne montre aucune erreur."]),
        ("Membres", ["Le membre prévu est actif.", "Le crédit est correct.", "Le lien public a été testé."]),
        ("Lovense", ["Le jouet est allumé.", "Lovense Remote est connecté.", "Le statut PULSEROOM indique connecté."]),
        ("OBS", ["La source navigateur overlay est ajoutée.", "Le lien utilisé est celui du domaine Vercel.", "L'overlay est placé sans masquer le contenu important."]),
    ]
    x_positions = [M, M + 268]
    y_positions = [500, 290]
    idx = 0
    for title, items in sections:
        x = x_positions[idx % 2]
        y = y_positions[idx // 2]
        rounded_rect(c, x, y, 248, 142, PANEL)
        c.setFont(BOLD, 13)
        c.setFillColor([ROSE, CYAN, VIOLET, GREEN][idx])
        c.drawString(x + 16, y + 106, title)
        bullet_list(c, items, x + 18, y + 82, 214, [ROSE, CYAN, VIOLET, GREEN][idx], 23)
        idx += 1
    c.showPage()


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("Manuel complet PULSEROOM")
    c.setAuthor("PULSEROOM")
    cover(c)
    page_summary(c)
    page_login_legal(c)
    page_dashboard(c)
    page_members_list(c)
    page_member_form(c)
    page_member_detail_qr(c)
    page_control(c)
    page_tips(c)
    page_obs(c)
    page_account(c)
    page_settings_models(c)
    page_deploy(c)
    page_security(c)
    page_checklist(c)
    c.save()
    shutil.copyfile(OUT, PUBLIC_OUT)
    print(OUT)
    print(PUBLIC_OUT)


if __name__ == "__main__":
    main()

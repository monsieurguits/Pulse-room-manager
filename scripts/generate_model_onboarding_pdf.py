from __future__ import annotations

import os
from textwrap import wrap

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "output", "pdf", "guide-modeles-pulseroom.pdf")
LOGO = os.path.join(ROOT, "public", "pulseroom-logo-transparent.png")
MARK = os.path.join(ROOT, "public", "pulseroom-mark-transparent.png")

W, H = A4
M = 42

BG = colors.HexColor("#050509")
PANEL = colors.Color(0.035, 0.035, 0.055, alpha=0.82)
PANEL_2 = colors.Color(0.07, 0.07, 0.10, alpha=0.92)
LINE = colors.Color(1, 1, 1, alpha=0.12)
TEXT = colors.HexColor("#F8FAFC")
MUTED = colors.HexColor("#A1A1AA")
DIM = colors.HexColor("#71717A")
ROSE = colors.HexColor("#FF2E6D")
PINK = colors.HexColor("#FF5FA2")
CYAN = colors.HexColor("#00D8FF")
VIOLET = colors.HexColor("#8B5CF6")


def register_fonts() -> tuple[str, str, str]:
    regular = "/System/Library/Fonts/Supplemental/Arial.ttf"
    bold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    black = "/System/Library/Fonts/Supplemental/Arial Black.ttf"
    pdfmetrics.registerFont(TTFont("PulseRegular", regular))
    pdfmetrics.registerFont(TTFont("PulseBold", bold))
    pdfmetrics.registerFont(TTFont("PulseBlack", black))
    return "PulseRegular", "PulseBold", "PulseBlack"


FONT, BOLD, BLACK = register_fonts()


def fit_text(c: canvas.Canvas, text: str, x: float, y: float, max_w: float, font: str, size: float, color=TEXT, leading=None):
    c.setFillColor(color)
    c.setFont(font, size)
    leading = leading or size * 1.35
    words = text.split()
    lines: list[str] = []
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
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def rounded_rect(c, x, y, w, h, fill, stroke=LINE, radius=18):
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
    c.setFillAlpha(0.42)
    c.setFillColor(ROSE)
    c.rect(-90, H * 0.55, W * 0.72, 170, fill=1, stroke=0)
    c.rotate(16)
    c.setFillAlpha(0.24)
    c.setFillColor(CYAN)
    c.rect(W * 0.42, H * 0.08, W * 0.78, 150, fill=1, stroke=0)
    c.restoreState()
    c.saveState()
    c.setFillAlpha(0.72)
    c.setFillColor(colors.HexColor("#050509"))
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.restoreState()


def header(c: canvas.Canvas, page_no: int, title: str):
    c.drawImage(ImageReader(MARK), M, H - 56, 28, 24, mask="auto", preserveAspectRatio=True, anchor="c")
    c.setFont(BLACK, 10)
    c.setFillColor(TEXT)
    c.drawString(M + 38, H - 43, "PULSEROOM")
    c.setFont(FONT, 8)
    c.setFillColor(DIM)
    c.drawRightString(W - M, H - 43, title.upper())
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.1))
    c.line(M, H - 68, W - M, H - 68)
    c.setFont(FONT, 8)
    c.setFillColor(DIM)
    c.drawRightString(W - M, 25, f"Guide modèle - page {page_no}")


def title(c, text, subtitle=None):
    c.setFont(BLACK, 25)
    c.setFillColor(TEXT)
    c.drawString(M, H - 118, text)
    if subtitle:
        fit_text(c, subtitle, M, H - 144, W - 2 * M, FONT, 10.5, MUTED, 15)


def section_label(c, x, y, label, color=ROSE):
    c.setFillColor(color)
    c.roundRect(x, y - 18, 88, 24, 12, fill=1, stroke=0)
    c.setFont(BOLD, 8)
    c.setFillColor(colors.white)
    c.drawCentredString(x + 44, y - 10, label.upper())


def card(c, x, y, w, h, heading, body, accent=ROSE, number=None):
    rounded_rect(c, x, y, w, h, PANEL)
    c.setFillColor(accent)
    c.roundRect(x + 14, y + h - 24, 42, 5, 3, fill=1, stroke=0)
    if number:
        c.setFont(BLACK, 21)
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.12))
        display_number = str(number).zfill(2) if isinstance(number, int) else str(number)
        c.drawRightString(x + w - 14, y + h - 34, display_number)
    c.setFont(BOLD, 13)
    c.setFillColor(TEXT)
    c.drawString(x + 14, y + h - 50, heading)
    fit_text(c, body, x + 14, y + h - 72, w - 28, FONT, 9.4, MUTED, 13)


def checklist(c, items, x, y, w, gap=25):
    for item in items:
        c.setStrokeColor(CYAN)
        c.setLineWidth(1.4)
        c.circle(x + 8, y + 2, 6, fill=0, stroke=1)
        c.setStrokeColor(ROSE)
        c.line(x + 4, y + 2, x + 7, y - 2)
        c.line(x + 7, y - 2, x + 13, y + 6)
        fit_text(c, item, x + 24, y - 2, w - 24, FONT, 9.5, MUTED, 12.5)
        y -= gap
    return y


def cover(c):
    page_bg(c)
    c.drawImage(ImageReader(LOGO), W / 2 - 138, H - 390, 276, 276, mask="auto", preserveAspectRatio=True, anchor="c")
    c.setFont(BLACK, 33)
    c.setFillColor(TEXT)
    c.drawCentredString(W / 2, 354, "GUIDE MODELE")
    c.setFont(FONT, 14)
    c.setFillColor(MUTED)
    c.drawCentredString(W / 2, 329, "Comprendre, configurer et utiliser votre espace PULSEROOM")
    rounded_rect(c, M, 198, W - 2 * M, 82, colors.Color(1, 1, 1, alpha=0.06), colors.Color(1, 1, 1, alpha=0.13), 22)
    fit_text(
        c,
        "Ce document explique le fonctionnement du site pour les nouveaux modèles: connexion, création des membres, connexion Lovense, partage des liens et bonnes pratiques de sécurité.",
        M + 24,
        246,
        W - 2 * M - 48,
        FONT,
        11,
        TEXT,
        16,
    )
    c.setFont(FONT, 9)
    c.setFillColor(DIM)
    c.drawCentredString(W / 2, 62, "Version onboarding - à partager aux modèles avant leur première utilisation")
    c.showPage()


def page_principle(c):
    page_bg(c)
    header(c, 2, "Vue d'ensemble")
    title(c, "Le principe en 60 secondes", "PULSEROOM permet à vos membres autorisés de contrôler votre jouet Lovense pendant des sessions limitées et suivies.")
    y = H - 342
    cards = [
        ("1. Vous créez un membre", "Chaque membre reçoit un lien de contrôle unique et sécurisé. Vous choisissez ses dates d'accès et son crédit disponible.", ROSE),
        ("2. Vous connectez le jouet", "Depuis la fiche du membre, vous lancez le QR Lovense et vous le scannez avec votre application Lovense Remote.", VIOLET),
        ("3. Le membre ouvre son lien", "Il accepte les conditions, puis accède aux boutons Start, Pause, Stop et aux patterns disponibles.", CYAN),
        ("4. Le site suit le crédit", "Le temps de contrôle est débité automatiquement. Les sessions sont visibles dans votre tableau de bord.", PINK),
    ]
    for i, (h, b, a) in enumerate(cards):
        row = i // 2
        col = i % 2
        card(c, M + col * 262, y - row * 150, 238, 118, h, b, a, i + 1)
    section_label(c, M, 168, "Important")
    rounded_rect(c, M, 72, W - 2 * M, 78, PANEL_2)
    fit_text(c, "Votre compte modèle ne voit que vos propres membres. Le propriétaire de la plateforme peut gérer les comptes modèles et les réglages globaux.", M + 22, 121, W - 2 * M - 44, FONT, 10.5, TEXT, 15)
    c.showPage()


def page_login(c):
    page_bg(c)
    header(c, 3, "Connexion")
    title(c, "1. Se connecter à son espace", "Votre administrateur vous fournit une adresse de connexion, un email et un mot de passe temporaire.")
    card(c, M, 520, W - 2 * M, 105, "Adresse de connexion", "Rendez-vous sur l'URL fournie par le propriétaire, par exemple: https://votre-domaine.com/login. Utilisez uniquement le lien officiel.", CYAN)
    card(c, M, 385, W - 2 * M, 105, "Changer votre mot de passe", "Apres la premiere connexion, ouvrez le menu Compte. Entrez l'ancien mot de passe, choisissez un nouveau mot de passe, puis confirmez.", ROSE)
    card(c, M, 250, W - 2 * M, 105, "Votre périmètre", "Un compte modèle peut créer, modifier et connecter ses propres membres. Il ne peut pas voir les membres des autres modèles.", VIOLET)
    section_label(c, M, 170, "Bon reflexe", PINK)
    checklist(c, ["Utilisez un mot de passe unique.", "Ne partagez jamais votre accès admin avec un membre.", "Déconnectez-vous sur les ordinateurs partagés."], M, 130, W - 2 * M)
    c.showPage()


def page_members(c):
    page_bg(c)
    header(c, 4, "Membres")
    title(c, "2. Créer et paramétrer un membre", "Chaque membre possède son propre lien de contrôle, son propre crédit et sa propre connexion Lovense.")
    left = M
    right = M + 270
    card(c, left, 505, 238, 120, "Informations de base", "Renseignez le pseudo, la plateforme, la date de début et la date de fin de l'accès.", ROSE, 1)
    card(c, right, 505, 238, 120, "Crédit de contrôle", "Définissez le temps disponible. Le crédit est exprimé en secondes et s'actualise pendant les sessions.", CYAN, 2)
    card(c, left, 350, 238, 120, "Statut actif", "Un membre inactif ne peut pas lancer de contrôle. Utilisez ce statut pour suspendre un accès.", VIOLET, 3)
    card(c, right, 350, 238, 120, "Lien sécurisé", "Le lien public est unique. Il donne accès au panneau de contrôle du membre, pas à votre espace admin.", PINK, 4)
    rounded_rect(c, M, 105, W - 2 * M, 180, PANEL_2)
    c.setFont(BOLD, 14)
    c.setFillColor(TEXT)
    c.drawString(M + 20, 252, "Exemple de workflow")
    y = 226
    for step in ["Créer le membre", "Connecter Lovense", "Vérifier que le jouet est détecté", "Envoyer le lien au membre", "Suivre les sessions dans le dashboard"]:
        c.setFillColor(ROSE)
        c.circle(M + 27, y + 3, 4, fill=1, stroke=0)
        fit_text(c, step, M + 42, y, W - 2 * M - 60, FONT, 10.5, MUTED, 13)
        y -= 22
    c.showPage()


def page_lovense(c):
    page_bg(c)
    header(c, 5, "Lovense")
    title(c, "3. Connecter votre jouet Lovense", "La connexion se fait depuis la fiche d'un membre. Le QR code doit être scanné avec votre propre application Lovense Remote.")
    card(c, M, 515, W - 2 * M, 92, "Étape A - ouvrir la fiche membre", "Dans votre espace, ouvrez le membre concerné puis lancez l'association Lovense / QR code.", CYAN, "A")
    card(c, M, 400, W - 2 * M, 92, "Étape B - scanner le QR", "Sur votre téléphone, ouvrez Lovense Remote et scannez le QR affiché. Gardez le jouet allumé et connecté à l'app.", ROSE, "B")
    card(c, M, 285, W - 2 * M, 92, "Étape C - vérifier le statut", "Quand Lovense renvoie le callback, PULSEROOM enregistre les informations du jouet sur ce membre.", VIOLET, "C")
    rounded_rect(c, M, 120, W - 2 * M, 115, colors.Color(1, 0.18, 0.43, alpha=0.10), colors.Color(1, 0.18, 0.43, alpha=0.28), 18)
    c.setFont(BOLD, 13)
    c.setFillColor(PINK)
    c.drawString(M + 20, 198, "À retenir")
    fit_text(c, "Le compte API Lovense de la plateforme sert de moteur technique. Mais le jouet contrôlé est celui qui a été connecté via le QR code du membre. Si vous scannez avec votre app et votre jouet, c'est votre jouet qui sera associé.", M + 20, 174, W - 2 * M - 40, FONT, 10.2, TEXT, 15)
    c.showPage()


def page_member_control(c):
    page_bg(c)
    header(c, 6, "Controle membre")
    title(c, "4. Ce que voit votre membre", "Le membre ne voit pas votre espace admin. Il accède seulement à une interface de contrôle limitée par vos règles.")
    controls = [
        ("Start", "Démarre une session si le jouet est connecté et le crédit disponible."),
        ("Pause", "Met temporairement en pause l'action sans fermer l'accès."),
        ("Stop", "Arrête le contrôle et met fin à l'action en cours."),
        ("Patterns", "Permet de choisir des intensités ou séquences prédéfinies."),
    ]
    x = M
    y = 502
    for idx, (h, b) in enumerate(controls):
        card(c, x + (idx % 2) * 262, y - (idx // 2) * 143, 238, 110, h, b, [ROSE, CYAN, VIOLET, PINK][idx])
    rounded_rect(c, M, 160, W - 2 * M, 160, PANEL_2)
    c.setFont(BOLD, 14)
    c.setFillColor(TEXT)
    c.drawString(M + 20, 282, "Le crédit et les limites")
    fit_text(c, "Le site calcule la durée de contrôle et débite le crédit du membre. Cela vous permet de proposer des accès limités dans le temps, sans tout surveiller manuellement.", M + 20, 256, W - 2 * M - 40, FONT, 10.5, MUTED, 15)
    fit_text(c, "Si une session reste ouverte, le système synchronise l'état régulièrement pour garder un suivi fiable.", M + 20, 208, W - 2 * M - 40, FONT, 10.5, MUTED, 15)
    c.showPage()


def page_checklist(c):
    page_bg(c)
    header(c, 7, "Checklist")
    title(c, "Checklist avant de partager un lien", "Utilisez cette page comme contrôle rapide avant d'envoyer un lien à un membre.")
    rounded_rect(c, M, 220, W - 2 * M, 420, PANEL)
    items = [
        "Mon compte modèle fonctionne et mon mot de passe a été changé.",
        "Le membre est créé avec les bonnes dates d'accès.",
        "Le crédit de contrôle correspond à ce que j'ai promis.",
        "Le jouet Lovense est allumé, chargé et connecté à Lovense Remote.",
        "Le QR code a été scanné depuis ma propre application Lovense.",
        "Le statut du membre indique que le jouet est bien connecté.",
        "J'ai teste Start / Stop avant d'envoyer le lien.",
        "Le membre a reçu uniquement son lien de contrôle, jamais mon accès admin.",
    ]
    checklist(c, items, M + 24, 590, W - 2 * M - 48, 38)
    rounded_rect(c, M, 85, W - 2 * M, 95, colors.Color(0, 0.85, 1, alpha=0.08), colors.Color(0, 0.85, 1, alpha=0.24), 18)
    c.setFont(BOLD, 13)
    c.setFillColor(CYAN)
    c.drawString(M + 20, 145, "Support")
    fit_text(c, "En cas de problème: notez le membre concerné, le message d'erreur, l'heure du test et l'étape bloquante. Envoyez ces informations au propriétaire de la plateforme.", M + 20, 121, W - 2 * M - 40, FONT, 10.2, TEXT, 14)
    c.showPage()


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("Guide modeles PULSEROOM")
    c.setAuthor("PULSEROOM")
    cover(c)
    page_principle(c)
    page_login(c)
    page_members(c)
    page_lovense(c)
    page_member_control(c)
    page_checklist(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    main()

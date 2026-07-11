from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT = "public/conditions-generales-pulseroom.pdf"
VERSION = "weekly-2026-07-05"

weekly_updates = [
    "Ajout d'une messagerie directe entre les membres et leur modele.",
    "Ajout d'une recherche de membres par pseudo pour demarrer une conversation entre membres du meme espace modele.",
    "Ajout d'un rappel professionnel indiquant de ne jamais communiquer d'informations personnelles, bancaires ou privees dans les messages.",
    "Mise a jour des conditions relatives aux messages, a la confidentialite et a la responsabilite des informations partagees entre utilisateurs.",
    "Ajout d'un systeme d'acceptation obligatoire des nouveautes avant l'acces a l'espace lorsque les conditions evoluent.",
]

sections = [
    (
        "Conditions Generales d'Utilisation",
        [
            ("1. Objet", ["PULSEROOM est une plateforme permettant a des createurs de contenu majeurs de gerer leurs appareils compatibles Lovense, leurs membres et leurs sessions de controle."], []),
            ("2. Conditions d'acces", ["L'utilisation de PULSEROOM est strictement reservee aux personnes majeures (18 ans ou plus, ou l'age legal dans leur pays).", "L'utilisateur garantit que toutes les informations fournies sont exactes."], []),
            ("3. Responsabilite", ["L'utilisateur est seul responsable :"], ["de l'utilisation de son compte ;", "de ses appareils ;", "des interactions avec ses abonnes ;", "du respect des lois applicables dans son pays ;", "des informations personnelles, privees ou bancaires qu'il choisit de communiquer dans les espaces de message.", "PULSEROOM ne peut etre tenu responsable des pertes financieres, d'une mauvaise utilisation, d'une interruption de service ou des informations communiquees volontairement entre utilisateurs."]),
            ("4. Utilisation du service", ["Il est interdit :"], ["d'utiliser le service a des fins illegales ;", "de tenter d'acceder aux comptes d'autres utilisateurs ;", "de perturber le fonctionnement de la plateforme ;", "de diffuser des contenus interdits par la loi ;", "de partager des informations personnelles sensibles dans les messages ou espaces de conversation.", "Tout abus pourra entrainer la suspension ou la suppression du compte."]),
            ("5. Disponibilite", ["Nous faisons notre possible pour assurer un fonctionnement continu, mais aucune disponibilite permanente ne peut etre garantie.", "Des operations de maintenance, mises a jour ou incidents techniques peuvent entrainer une interruption temporaire du service."], []),
            ("6. Donnees personnelles", ["Les donnees sont utilisees uniquement pour le fonctionnement de la plateforme.", "Elles ne sont ni revendues ni cedees a des tiers, sauf obligation legale.", "L'utilisateur peut demander la suppression de ses donnees conformement a la reglementation applicable."], []),
            ("7. Propriete intellectuelle", ["Le logiciel PULSEROOM, son interface, son logo, son code source et son identite visuelle sont proteges.", "Toute reproduction, copie ou redistribution sans autorisation est interdite."], []),
            ("8. Resiliation", ["Nous pouvons suspendre ou supprimer un compte en cas de non-respect des presentes conditions."], []),
            ("9. Modification des conditions", ["Les presentes conditions peuvent evoluer.", "Lorsqu'une mise a jour importante est publiee, l'utilisateur peut etre invite a lire les nouveautes et a accepter la version mise a jour avant de continuer a utiliser son espace."], []),
        ],
    ),
    (
        "Politique de confidentialite / RGPD",
        [
            ("Donnees collectees", ["PULSEROOM collecte uniquement les donnees necessaires au fonctionnement du service.", "Ces donnees peuvent comprendre :"], ["adresse e-mail ;", "pseudonyme ;", "informations relatives aux appareils Lovense ;", "parametres du compte ;", "messages echanges via la messagerie PULSEROOM ;", "journaux techniques necessaires au fonctionnement.", "Les donnees sont stockees de maniere securisee. L'utilisateur peut demander leur suppression a tout moment."]),
        ],
    ),
    (
        "Mentions legales",
        [
            ("Editeur et support", ["PULSEROOM est edite et exploite par le proprietaire de la plateforme. Les informations legales completes de l'editeur doivent etre communiquees aux utilisateurs selon le pays d'exploitation.", "Pour toute demande relative au compte, aux donnees personnelles ou au service, l'utilisateur doit contacter le support indique par le proprietaire de la plateforme."], []),
        ],
    ),
    (
        "Conditions de vente",
        [
            ("Si abonnement", ["Les abonnements sont factures selon le tarif affiche lors de la souscription.", "Sauf mention contraire :"], ["les abonnements sont renouveles automatiquement ;", "l'utilisateur peut resilier a tout moment ;", "aucun remboursement n'est effectue pour une periode deja commencee, sauf obligation legale."]),
            ("Achat de credits membres", ["Les membres peuvent acheter des credits additionnels lorsque cette option est proposee dans leur espace.", "Les credits ajoutes apres paiement sont rattaches au compte membre concerne et utilisables selon les regles du service."], []),
        ],
    ),
]


def bullet(text):
    return Paragraph(f"- {text}", styles["PulseBullet"])


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitlePulse", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, leading=24, textColor=colors.HexColor("#f8fafc"), spaceAfter=8))
styles.add(ParagraphStyle(name="SubtitlePulse", parent=styles["BodyText"], fontSize=10, leading=15, textColor=colors.HexColor("#cbd5e1")))
styles.add(ParagraphStyle(name="SectionPulse", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=colors.HexColor("#111827"), spaceBefore=14, spaceAfter=8))
styles.add(ParagraphStyle(name="HeadingPulse", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=colors.HexColor("#111827"), spaceBefore=8, spaceAfter=3))
styles.add(ParagraphStyle(name="BodyPulse", parent=styles["BodyText"], fontSize=9.5, leading=14, textColor=colors.HexColor("#334155"), spaceAfter=4))
styles.add(ParagraphStyle(name="PulseBullet", parent=styles["BodyPulse"], leftIndent=8, firstLineIndent=0, spaceAfter=3))

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=16 * mm,
)

story = []
hero = Table(
    [[Paragraph("PULSEROOM", styles["TitlePulse"]), Paragraph(f"Version des conditions : {VERSION}<br/>Document complet mis a jour avec les nouveautes applicables et les clauses toujours en vigueur.", styles["SubtitlePulse"])]],
    colWidths=[80 * mm, 78 * mm],
)
hero.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#070713")),
    ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#334155")),
    ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 14),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
story.append(hero)
story.append(Spacer(1, 10))

story.append(Paragraph("Nouveautes de la semaine", styles["SectionPulse"]))
story.append(Paragraph("Cette section reprend uniquement les dernieres mises a jour fonctionnelles et legales de la semaine en cours.", styles["BodyPulse"]))
for item in weekly_updates:
    story.append(bullet(item))

for section_title, blocks in sections:
    story.append(Paragraph(section_title, styles["SectionPulse"]))
    for heading, paragraphs, items in blocks:
        if heading:
            story.append(Paragraph(heading, styles["HeadingPulse"]))
        for paragraph in paragraphs:
            story.append(Paragraph(paragraph, styles["BodyPulse"]))
        for item in items:
            story.append(bullet(item))


def footer(canvas, document):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(18 * mm, 10 * mm, "PULSEROOM - Conditions generales")
    canvas.drawRightString(192 * mm, 10 * mm, f"Page {document.page}")
    canvas.restoreState()


doc.build(story, onFirstPage=footer, onLaterPages=footer)

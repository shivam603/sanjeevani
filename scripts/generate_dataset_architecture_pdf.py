"""Script to generate a professional PDF document for Sanjeevani's 6 Sovereign Agricultural Datasets Architecture.

Uses ReportLab with high-fidelity formatting.
"""

from datetime import datetime
import os
import sys

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        HRFlowable,
        KeepTogether,
        PageBreak,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )
except ImportError:
    print("ReportLab not installed in current environment.")
    sys.exit(1)


def create_dataset_architecture_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    PRIMARY = colors.HexColor("#1b4332")      # Forest Green
    SECONDARY = colors.HexColor("#2d6a4f")    # Deep Green
    ACCENT = colors.HexColor("#52b788")       # Emerald
    HIGHLIGHT = colors.HexColor("#d8f3dc")    # Light Mint
    DARK_TEXT = colors.HexColor("#1f2937")    # Charcoal
    LIGHT_BG = colors.HexColor("#f8fafc")     # Light Slate

    # Typography Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceAfter=12,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT,
    )

    bold_body = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=1,
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT,
    )

    story = []

    # Title & Header
    story.append(Paragraph("Sanjeevani (AgriTrust) — Dataset Architecture Report", title_style))
    story.append(
        Paragraph(
            "Integration Architecture for Sovereign Indian Agricultural & Remote Sensing Datasets | NABARD & DPI Aligned",
            subtitle_style,
        )
    )
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=10))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary & Objective", h1_style))
    summary_text = (
        "Sanjeevani ingests, cross-validates, and synthesizes <b>6 sovereign Government of India agricultural datasets</b> "
        "alongside Sentinel-2 satellite remote sensing to construct an explainable, zero-PII Credit Passport and Risk Assessment engine. "
        "This multi-source grounding enables formal financial institutions to underwrite smallholder farmers with high confidence, "
        "adhering to NABARD Scale of Finance norms, PMFBY climate loss benchmarks, and DPDP Act 2023 privacy requirements."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # Table of 6 Datasets
    story.append(Paragraph("2. Public Agricultural Dataset Mapping Matrix", h1_style))

    data_matrix = [
        [
            Paragraph("Dataset & Source", table_header),
            Paragraph("Primary Attributes", table_header),
            Paragraph("Ingestion Connector", table_header),
            Paragraph("ML Engine Target", table_header),
            Paragraph("Platform Value & Impact", table_header),
        ],
        [
            Paragraph("<b>1. AGMARKNET 2.0</b><br/><i>agmarknet.gov.in (MoA&FW)</i>", table_cell),
            Paragraph("Daily Mandi Arrivals, Modal Price, Min/Max Price, Commodity, Grade", table_cell),
            Paragraph("<code>agmarknet_ingestor.py</code>", table_cell),
            Paragraph("<b>Model D</b><br/>ARIMA Price Predictor", table_cell),
            Paragraph("Harvest revenue realization models; price volatility stress-testing for credit sizing.", table_cell),
        ],
        [
            Paragraph("<b>2. National Horticulture Board (NHB)</b><br/><i>nhb.gov.in</i>", table_cell),
            Paragraph("State & District Acreage, Production Volume, Yield (MT/Ha), Multi-year trends", table_cell),
            Paragraph("<code>nhb_ingestor.py</code>", table_cell),
            Paragraph("<b>Model B</b><br/>Repayment Engine", table_cell),
            Paragraph("Calibrates district Scale of Finance for horticulture crops (Grapes, Pomegranate, Onion).", table_cell),
        ],
        [
            Paragraph("<b>3. PM-KISAN Beneficiary</b><br/><i>Data.gov.in (Sep 2026)</i>", table_cell),
            Paragraph("Village & Gender-wise Beneficiary Count, DBT Installment disbursement status", table_cell),
            Paragraph("<code>pmkisan_ingestor.py</code>", table_cell),
            Paragraph("<b>Identity & Land Verification</b>", table_cell),
            Paragraph("Validates landholder smallholder credentials; contributes ₹6,000/yr guaranteed liquidity buffer.", table_cell),
        ],
        [
            Paragraph("<b>4. PMFBY Crop Loss</b><br/><i>pmfby.gov.in / Data.gov.in</i>", table_cell),
            Paragraph("Historical Claims Ratio, Loss Cost Ratio (LCR), Insured Area, Crop Losses", table_cell),
            Paragraph("<code>pmfby_ingestor.py</code>", table_cell),
            Paragraph("<b>Model C</b><br/>Crop & Region Risk", table_cell),
            Paragraph("Trains Random Forest on hyper-local climate distress; determines default risk under drought.", table_cell),
        ],
        [
            Paragraph("<b>5. Kisan Call Centre (KCC)</b><br/><i>Data.gov.in / DAC&FW</i>", table_cell),
            Paragraph("Query Category (Pest/Weather/Seeds), District, Crop, Season, Advisory Notes", table_cell),
            Paragraph("<code>kcc_advisory_ingestor.py</code>", table_cell),
            Paragraph("<b>NLP Early-Warning Engine</b>", table_cell),
            Paragraph("Identifies emerging regional pest surges; pushes localized advisories in Hindi, Tamil & Punjabi.", table_cell),
        ],
        [
            Paragraph("<b>6. ICAR Disease Image Dataset</b><br/><i>Data.gov.in / ICAR-IASRI</i>", table_cell),
            Paragraph("Annotated Leaf/Crop Images, Pathology Class, Pest Severity, Growth Stage", table_cell),
            Paragraph("<code>icar_disease_ingestor.py</code>", table_cell),
            Paragraph("<b>Computer Vision CNN</b><br/>(MobileNetV3)", table_cell),
            Paragraph("Powers camera leaf scans on Farmer PWA; auto-applies yield haircut factor in credit limits.", table_cell),
        ],
    ]

    col_widths = [105, 115, 105, 85, 130]
    t = Table(data_matrix, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), SECONDARY),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 12))

    # Architecture Pipeline & Compliance
    story.append(Paragraph("3. Multi-Model Architecture Integration Flow", h1_style))
    arch_desc = (
        "<b>A. Ingestion & Normalization:</b> Connectors asynchronously poll REST/CKAN endpoints on Data.gov.in, "
        "storing cleaned records into the Unified Feature Store with PostgreSQL caching.<br/>"
        "<b>B. Remote Sensing Fusion:</b> Sentinel-2 10m NDVI vegetative indices are intersected with PMFBY district loss records "
        "and AGMARKNET mandi prices.<br/>"
        "<b>C. Explainable Underwriting:</b> Model outputs populate the <code>CreditEligibilityResponse</code> schema with transparent "
        "factor breakdowns, ensuring full explainability for bank credit committees."
    )
    story.append(Paragraph(arch_desc, body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("4. Sovereign Data Governance & Privacy Guarantee", h1_style))
    gov_text = (
        "• <b>Zero-PII Transmission:</b> Lenders query credit scores and risk bounds using cryptographic Consent Tokens (DPDP Act 2023 compliant).<br/>"
        "• <b>KCC & NABARD Rules:</b> Enforces Scale of Finance limits per crop-acre to eliminate over-indebtedness.<br/>"
        "• <b>Real-Time Resynchronization:</b> AGMARKNET prices refresh daily at 18:00 IST; Satellite imagery updates on a 5-day cycle."
    )
    story.append(Paragraph(gov_text, body_style))

    doc.build(story)
    print(f"PDF successfully generated at: {output_path}")


if __name__ == "__main__":
    out_file = os.path.join("docs", "Sanjeevani_Sovereign_Agricultural_Datasets_Architecture.pdf")
    os.makedirs("docs", exist_ok=True)
    create_dataset_architecture_pdf(out_file)

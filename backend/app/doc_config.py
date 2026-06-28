"""Per-document configuration: fields, system prompts, and greetings for all catalog entries."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from pydantic import create_model

TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"


@dataclass
class FieldDef:
    name: str
    label: str
    description: str


@dataclass
class DocConfig:
    doc_type: str
    title: str
    fields: list[FieldDef]
    greeting: str
    system_prompt: str
    template_file: str


def _build_system_prompt(title: str, fields: list[FieldDef]) -> str:
    field_lines = "\n".join(f"- {f.name}: {f.description}" for f in fields)
    return (
        f"You are a friendly legal assistant helping users complete a {title}.\n\n"
        "Your job is to ask conversational questions to gather all required information, "
        "confirm details naturally, and let the user know when you have everything needed.\n\n"
        f"Fields you need to gather:\n{field_lines}\n\n"
        "Ask about one or two topics at a time. Be concise and professional but warm.\n"
        "In your structured response, populate every field you have gathered so far. "
        "Leave fields as null if they haven't been mentioned yet."
    )


# ── Shared field groups ───────────────────────────────────────────────────────

_PARTY1_FIELDS = [
    FieldDef("party1_company", "Party 1 Company", "Legal name of the first party's organization"),
    FieldDef("party1_print_name", "Party 1 Name", "Full name of the signatory for party 1"),
    FieldDef("party1_title", "Party 1 Title", "Job title of the signatory for party 1"),
    FieldDef("party1_notice_address", "Party 1 Address", "Mailing address for party 1 notices"),
]

_PARTY2_FIELDS = [
    FieldDef("party2_company", "Party 2 Company", "Legal name of the second party's organization"),
    FieldDef("party2_print_name", "Party 2 Name", "Full name of the signatory for party 2"),
    FieldDef("party2_title", "Party 2 Title", "Job title of the signatory for party 2"),
    FieldDef("party2_notice_address", "Party 2 Address", "Mailing address for party 2 notices"),
]

_PROVIDER_CUSTOMER_FIELDS = [
    FieldDef("provider_company", "Provider Company", "Legal name of the service provider organization"),
    FieldDef("provider_contact_name", "Provider Contact Name", "Full name of the provider's signatory"),
    FieldDef("provider_contact_title", "Provider Contact Title", "Job title of the provider's signatory"),
    FieldDef("customer_company", "Customer Company", "Legal name of the customer organization"),
    FieldDef("customer_contact_name", "Customer Contact Name", "Full name of the customer's signatory"),
    FieldDef("customer_contact_title", "Customer Contact Title", "Job title of the customer's signatory"),
]

# ── Per-document field lists ──────────────────────────────────────────────────

_NDA_FIELDS = [
    FieldDef("purpose", "Purpose", "How confidential information may be used (free text)"),
    FieldDef("effective_date", "Effective Date", "When the NDA takes effect (YYYY-MM-DD format)"),
    FieldDef("mnda_term_type", "MNDA Term Type", "'expires' (after N years) or 'continues' (until terminated)"),
    FieldDef("mnda_term_years", "MNDA Term Years", "Number of years the MNDA lasts (only if mnda_term_type is 'expires')"),
    FieldDef("confidentiality_term_type", "Confidentiality Term Type", "'years' or 'perpetuity'"),
    FieldDef("confidentiality_term_years", "Confidentiality Term Years", "Number of years confidentiality lasts (only if confidentiality_term_type is 'years')"),
    FieldDef("governing_law", "Governing Law", "US state whose laws govern the agreement (e.g. 'Delaware')"),
    FieldDef("jurisdiction", "Jurisdiction", "City/county for courts (e.g. 'New Castle, Delaware')"),
    FieldDef("modifications", "Modifications", "Any custom changes to standard terms (optional, can be empty string)"),
    *_PARTY1_FIELDS,
    *_PARTY2_FIELDS,
]

_CSA_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the framework agreement takes effect (YYYY-MM-DD format)"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes (e.g. 'courts of Delaware')"),
    FieldDef("subscription_period", "Subscription Period", "Length of the initial subscription (e.g. '12 months', '1 year')"),
    FieldDef("services_description", "Services Description", "Brief description of the cloud services being provided"),
    FieldDef("fees", "Fees", "Fee amount and structure (e.g. '$500/month', '$6,000/year')"),
    FieldDef("payment_process", "Payment Process", "How payments will be made (e.g. 'monthly invoicing', 'annual upfront')"),
]

_SLA_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the SLA takes effect (YYYY-MM-DD format)"),
    FieldDef("target_uptime", "Target Uptime", "Uptime commitment as a percentage (e.g. '99.9%')"),
    FieldDef("target_response_time", "Target Response Time", "Support response time target (e.g. '4 business hours')"),
    FieldDef("support_channel", "Support Channel", "How support requests are submitted (e.g. 'email at support@provider.com')"),
    FieldDef("uptime_credit", "Uptime Credit", "Credit issued when uptime target is missed (e.g. '10% of monthly fees')"),
    FieldDef("response_time_credit", "Response Time Credit", "Credit issued when response time target is missed"),
    FieldDef("scheduled_downtime", "Scheduled Downtime", "Any pre-planned maintenance windows"),
]

_DPA_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the DPA takes effect (YYYY-MM-DD format)"),
    FieldDef("governing_member_state", "Governing Member State", "EU member state whose laws govern this DPA"),
    FieldDef("categories_of_personal_data", "Categories of Personal Data", "Types of personal data being processed (e.g. 'name, email, IP address')"),
    FieldDef("categories_of_data_subjects", "Categories of Data Subjects", "Who the data belongs to (e.g. 'employees, customers')"),
    FieldDef("nature_and_purpose_of_processing", "Nature and Purpose of Processing", "Why and how the data is being processed"),
    FieldDef("duration_of_processing", "Duration of Processing", "How long data will be processed (e.g. 'duration of the service agreement')"),
    FieldDef("special_category_data", "Special Category Data", "Whether any special category data (health, biometric, etc.) is involved — 'none' if not applicable"),
]

_DESIGN_PARTNER_FIELDS = [
    FieldDef("provider_company", "Provider Company", "Legal name of the company providing early product access"),
    FieldDef("provider_contact_name", "Provider Contact Name", "Full name of the provider's signatory"),
    FieldDef("partner_company", "Partner Company", "Legal name of the design partner organization"),
    FieldDef("partner_contact_name", "Partner Contact Name", "Full name of the partner's signatory"),
    FieldDef("partner_contact_title", "Partner Contact Title", "Job title of the partner's signatory"),
    FieldDef("effective_date", "Effective Date", "When the agreement takes effect (YYYY-MM-DD format)"),
    FieldDef("term", "Term", "Duration of the design partner relationship (e.g. '6 months', 'until December 31, 2026')"),
    FieldDef("program_description", "Program Description", "Description of the design partner program and product being evaluated"),
    FieldDef("fees", "Fees", "Any fees the partner will pay (enter 'none' if no fees)"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes"),
    FieldDef("notice_address", "Notice Address", "Mailing address for legal notices"),
]

_PSA_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the framework agreement takes effect (YYYY-MM-DD format)"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes"),
    FieldDef("services_description", "Services Description", "Description of the professional services to be provided"),
    FieldDef("deliverables", "Deliverables", "Specific outputs or work products to be delivered"),
    FieldDef("fees", "Fees", "Fee amount and payment structure"),
    FieldDef("payment_period", "Payment Period", "When invoices must be paid (e.g. 'net 30 days')"),
    FieldDef("sow_term", "Statement of Work Term", "Duration of the initial statement of work"),
]

_PARTNERSHIP_FIELDS = [
    FieldDef("company_name", "Company Name", "Legal name of the primary company"),
    FieldDef("company_contact_name", "Company Contact Name", "Full name of the company's signatory"),
    FieldDef("company_contact_title", "Company Contact Title", "Job title of the company's signatory"),
    FieldDef("partner_company", "Partner Company", "Legal name of the partner organization"),
    FieldDef("partner_contact_name", "Partner Contact Name", "Full name of the partner's signatory"),
    FieldDef("partner_contact_title", "Partner Contact Title", "Job title of the partner's signatory"),
    FieldDef("effective_date", "Effective Date", "When the agreement takes effect (YYYY-MM-DD format)"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes"),
    FieldDef("territory", "Territory", "Geographic territory covered by the partnership"),
    FieldDef("obligations", "Partner Obligations", "Key obligations of the partner under this agreement"),
    FieldDef("payment_process", "Payment Process", "How revenue sharing or payments will be handled"),
    FieldDef("end_date", "End Date", "When the partnership agreement expires (YYYY-MM-DD or 'ongoing')"),
]

_BAA_FIELDS = [
    FieldDef("provider_company", "Business Associate", "Legal name of the business associate (the service provider handling PHI)"),
    FieldDef("provider_contact_name", "Business Associate Contact", "Full name of the business associate's signatory"),
    FieldDef("company_name", "Covered Entity", "Legal name of the covered entity (the healthcare organization)"),
    FieldDef("company_contact_name", "Covered Entity Contact", "Full name of the covered entity's signatory"),
    FieldDef("baa_effective_date", "BAA Effective Date", "When this BAA takes effect (YYYY-MM-DD format)"),
    FieldDef("agreement", "Underlying Agreement", "Name or description of the main service agreement this BAA supplements"),
    FieldDef("breach_notification_period", "Breach Notification Period", "Number of days within which a breach must be reported (e.g. '60 days')"),
    FieldDef("limitations", "Limitations", "Any limitations on the use or disclosure of PHI (or 'none' if no additional limitations)"),
]

_SOFTWARE_LICENSE_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the framework agreement takes effect (YYYY-MM-DD format)"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes"),
    FieldDef("software_description", "Software Description", "Name and brief description of the licensed software"),
    FieldDef("permitted_uses", "Permitted Uses", "How the customer is allowed to use the software"),
    FieldDef("subscription_period", "Subscription Period", "Length of the license subscription (e.g. '1 year')"),
    FieldDef("fees", "Fees", "License fee amount and payment structure"),
    FieldDef("payment_process", "Payment Process", "How payments are made (e.g. 'annual upfront invoicing')"),
]

_PILOT_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the pilot begins (YYYY-MM-DD format)"),
    FieldDef("pilot_period", "Pilot Period", "Duration of the pilot (e.g. '30 days', '3 months')"),
    FieldDef("governing_law", "Governing Law", "State or jurisdiction whose laws govern the agreement"),
    FieldDef("chosen_courts", "Chosen Courts", "Courts agreed upon for resolving disputes"),
    FieldDef("general_cap_amount", "Liability Cap", "Maximum liability amount (e.g. '$10,000' or 'fees paid in last 12 months')"),
    FieldDef("notice_address", "Notice Address", "Mailing address for legal notices"),
]

_AI_ADDENDUM_FIELDS = [
    *_PROVIDER_CUSTOMER_FIELDS,
    FieldDef("effective_date", "Effective Date", "When the addendum takes effect (YYYY-MM-DD format)"),
    FieldDef("underlying_agreement", "Underlying Agreement", "Name or description of the main agreement this addendum supplements"),
    FieldDef("training_data", "Training Data", "Description of what customer data, if any, may be used for AI training"),
    FieldDef("training_purposes", "Training Purposes", "Permitted purposes for using data in AI model training"),
    FieldDef("training_restrictions", "Training Restrictions", "Restrictions on how training data may be used"),
    FieldDef("improvement_restrictions", "Improvement Restrictions", "Any restrictions on using data to improve AI models"),
]


# ── Document configurations ───────────────────────────────────────────────────

DOC_CONFIGS: dict[str, DocConfig] = {
    "Mutual-NDA": DocConfig(
        doc_type="Mutual-NDA",
        title="Mutual Non-Disclosure Agreement",
        fields=_NDA_FIELDS,
        greeting=(
            "Hi! I'm here to help you create a Mutual NDA. "
            "Let's start with the basics — what's the purpose of this NDA? "
            "For example, are you evaluating a potential business partnership, a vendor relationship, or something else?"
        ),
        system_prompt=_build_system_prompt("Mutual Non-Disclosure Agreement", _NDA_FIELDS),
        template_file="Mutual-NDA.md",
    ),
    "Mutual-NDA-coverpage": DocConfig(
        doc_type="Mutual-NDA-coverpage",
        title="Mutual NDA Cover Page",
        fields=_NDA_FIELDS,
        greeting=(
            "Hi! I'll help you fill out the cover page for a Mutual NDA. "
            "What's the purpose of this agreement — for example, are you evaluating a business partnership or a vendor relationship?"
        ),
        system_prompt=_build_system_prompt("Mutual NDA Cover Page", _NDA_FIELDS),
        template_file="Mutual-NDA-coverpage.md",
    ),
    "CSA": DocConfig(
        doc_type="CSA",
        title="Cloud Service Agreement",
        fields=_CSA_FIELDS,
        greeting=(
            "Hi! I'm here to help you draft a Cloud Service Agreement. "
            "To get started — who are the two parties? Please share the provider's company name and the customer's company name."
        ),
        system_prompt=_build_system_prompt("Cloud Service Agreement", _CSA_FIELDS),
        template_file="CSA.md",
    ),
    "SLA": DocConfig(
        doc_type="SLA",
        title="Service Level Agreement",
        fields=_SLA_FIELDS,
        greeting=(
            "Hi! Let's set up your Service Level Agreement. "
            "Who is the service provider and who is the customer?"
        ),
        system_prompt=_build_system_prompt("Service Level Agreement", _SLA_FIELDS),
        template_file="SLA.md",
    ),
    "DPA": DocConfig(
        doc_type="DPA",
        title="Data Processing Agreement",
        fields=_DPA_FIELDS,
        greeting=(
            "Hi! I'll help you draft a Data Processing Agreement to cover GDPR and data protection requirements. "
            "Who is the data processor (typically the service provider) and who is the data controller (typically the customer)?"
        ),
        system_prompt=_build_system_prompt("Data Processing Agreement", _DPA_FIELDS),
        template_file="DPA.md",
    ),
    "Design-Partner-Agreement": DocConfig(
        doc_type="Design-Partner-Agreement",
        title="Design Partner Agreement",
        fields=_DESIGN_PARTNER_FIELDS,
        greeting=(
            "Hi! Let's draft a Design Partner Agreement so you can formalize an early-access relationship. "
            "Who is the provider (the company offering the product) and who is the design partner?"
        ),
        system_prompt=_build_system_prompt("Design Partner Agreement", _DESIGN_PARTNER_FIELDS),
        template_file="Design-Partner-Agreement.md",
    ),
    "PSA": DocConfig(
        doc_type="PSA",
        title="Professional Services Agreement",
        fields=_PSA_FIELDS,
        greeting=(
            "Hi! I'm here to help you draft a Professional Services Agreement. "
            "Who is the service provider and who is the client receiving the services?"
        ),
        system_prompt=_build_system_prompt("Professional Services Agreement", _PSA_FIELDS),
        template_file="PSA.md",
    ),
    "Partnership-Agreement": DocConfig(
        doc_type="Partnership-Agreement",
        title="Partnership Agreement",
        fields=_PARTNERSHIP_FIELDS,
        greeting=(
            "Hi! Let's draft a Partnership Agreement. "
            "Who are the two companies entering into this partnership?"
        ),
        system_prompt=_build_system_prompt("Partnership Agreement", _PARTNERSHIP_FIELDS),
        template_file="Partnership-Agreement.md",
    ),
    "BAA": DocConfig(
        doc_type="BAA",
        title="Business Associate Agreement",
        fields=_BAA_FIELDS,
        greeting=(
            "Hi! I'll help you draft a Business Associate Agreement (BAA) for HIPAA compliance. "
            "Who is the covered entity (the healthcare organization) and who is the business associate "
            "(the service provider handling protected health information)?"
        ),
        system_prompt=_build_system_prompt("Business Associate Agreement", _BAA_FIELDS),
        template_file="BAA.md",
    ),
    "Software-License-Agreement": DocConfig(
        doc_type="Software-License-Agreement",
        title="Software License Agreement",
        fields=_SOFTWARE_LICENSE_FIELDS,
        greeting=(
            "Hi! Let's draft a Software License Agreement. "
            "Who is the software provider and who is the licensee (customer)?"
        ),
        system_prompt=_build_system_prompt("Software License Agreement", _SOFTWARE_LICENSE_FIELDS),
        template_file="Software-License-Agreement.md",
    ),
    "Pilot-Agreement": DocConfig(
        doc_type="Pilot-Agreement",
        title="Pilot Agreement",
        fields=_PILOT_FIELDS,
        greeting=(
            "Hi! I'll help you draft a Pilot Agreement for a short-term product evaluation. "
            "Who is the provider and who is the customer evaluating the product?"
        ),
        system_prompt=_build_system_prompt("Pilot Agreement", _PILOT_FIELDS),
        template_file="Pilot-Agreement.md",
    ),
    "AI-Addendum": DocConfig(
        doc_type="AI-Addendum",
        title="AI Addendum",
        fields=_AI_ADDENDUM_FIELDS,
        greeting=(
            "Hi! Let's draft an AI Addendum to address AI-specific terms for your agreement. "
            "Who is the provider and who is the customer, and which main agreement does this addendum attach to?"
        ),
        system_prompt=_build_system_prompt("AI Addendum", _AI_ADDENDUM_FIELDS),
        template_file="AI-Addendum.md",
    ),
}


def get_extraction_model(doc_type: str):
    """Return a dynamic Pydantic model for structured output extraction for the given doc type."""
    config = DOC_CONFIGS[doc_type]
    field_defs: dict = {
        "assistant_reply": (str, ...),
        **{f.name: (Optional[str], None) for f in config.fields},
    }
    model_name = doc_type.replace("-", "") + "Extraction"
    return create_model(model_name, **field_defs)


# Pre-build all extraction models at import time
EXTRACTION_MODELS: dict[str, type] = {
    doc_type: get_extraction_model(doc_type) for doc_type in DOC_CONFIGS
}


def template_content(filename: str) -> str:
    """Read a template file and return its content."""
    path = TEMPLATES_DIR / filename
    return path.read_text(encoding="utf-8")

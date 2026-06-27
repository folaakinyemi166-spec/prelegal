import os

from fastapi import APIRouter, HTTPException, status
from litellm import completion

from .schemas import ChatMessageRequest, ChatMessageResponse, GreetingResponse, NdaExtraction

router = APIRouter(prefix="/api/chat")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

GREETING = (
    "Hi! I'm here to help you create a Mutual NDA. "
    "Let's start with the basics — what's the purpose of this NDA? "
    "For example, are you evaluating a potential business partnership, a vendor relationship, or something else?"
)

SYSTEM_PROMPT = """You are a friendly legal assistant helping users complete a Mutual Non-Disclosure Agreement (NDA).

Your job is to ask conversational questions to gather all required information, confirm details naturally, and let the user know when you have everything needed.

Fields you need to gather:
- purpose: How confidential information may be used (free text)
- effective_date: When the NDA takes effect (YYYY-MM-DD format)
- mnda_term_type: "expires" (after N years) or "continues" (until terminated)
- mnda_term_years: Number of years (only if mnda_term_type is "expires")
- confidentiality_term_type: "years" or "perpetuity"
- confidentiality_term_years: Number of years (only if confidentiality_term_type is "years")
- governing_law: US state whose laws govern the agreement (e.g. "Delaware")
- jurisdiction: City/county for courts (e.g. "New Castle, Delaware")
- modifications: Any custom changes to standard terms (optional, can be empty string)
- party1_company, party1_print_name, party1_title, party1_notice_address
- party2_company, party2_print_name, party2_title, party2_notice_address

Ask about one or two topics at a time. Be concise and professional but warm.
In your structured response, populate every field you have gathered so far. Leave fields as null if they haven't been mentioned yet.
"""


@router.get("/greeting", response_model=GreetingResponse)
def greeting():
    return GreetingResponse(message=GREETING)


@router.post("/message", response_model=ChatMessageResponse)
def message(body: ChatMessageRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENROUTER_API_KEY is not configured",
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in body.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.user_message})

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=NdaExtraction,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        extraction = NdaExtraction.model_validate_json(response.choices[0].message.content)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {exc}",
        )

    return ChatMessageResponse(assistant_reply=extraction.assistant_reply, nda_fields=extraction)

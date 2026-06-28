from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str


# ── Chat / NDA extraction ────────────────────────────────────────────────────


class NdaExtraction(BaseModel):
    """Structured output returned by the AI for every chat turn.

    assistant_reply is the conversational message shown to the user.
    All NDA fields are Optional — null means "not yet mentioned".
    """

    assistant_reply: str

    # Agreement parameters
    purpose: Optional[str] = None
    effective_date: Optional[str] = None          # YYYY-MM-DD
    mnda_term_type: Optional[Literal["expires", "continues"]] = None
    mnda_term_years: Optional[str] = None
    confidentiality_term_type: Optional[Literal["years", "perpetuity"]] = None
    confidentiality_term_years: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None

    # Party 1
    party1_company: Optional[str] = None
    party1_print_name: Optional[str] = None
    party1_title: Optional[str] = None
    party1_notice_address: Optional[str] = None

    # Party 2
    party2_company: Optional[str] = None
    party2_print_name: Optional[str] = None
    party2_title: Optional[str] = None
    party2_notice_address: Optional[str] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatMessageRequest(BaseModel):
    user_message: str
    history: list[ChatMessage] = []


class ChatMessageResponse(BaseModel):
    assistant_reply: str
    nda_fields: NdaExtraction


class GreetingResponse(BaseModel):
    message: str

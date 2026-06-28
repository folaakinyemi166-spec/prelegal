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


# ── Chat / document extraction ───────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatMessageRequest(BaseModel):
    user_message: str
    history: list[ChatMessage] = []
    doc_type: str = "Mutual-NDA"


class ChatMessageResponse(BaseModel):
    assistant_reply: str
    doc_fields: dict[str, Optional[str]]


class GreetingResponse(BaseModel):
    message: str


class FieldDefinition(BaseModel):
    name: str
    label: str
    description: str


class DocConfigResponse(BaseModel):
    doc_type: str
    title: str
    fields: list[FieldDefinition]

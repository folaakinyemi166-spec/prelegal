import os

from fastapi import APIRouter, HTTPException, Query, status
from litellm import completion

from .doc_config import DOC_CONFIGS, EXTRACTION_MODELS
from .schemas import ChatMessageRequest, ChatMessageResponse, DocConfigResponse, FieldDefinition, GreetingResponse

router = APIRouter(prefix="/api/chat")

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


def _get_config(doc_type: str):
    config = DOC_CONFIGS.get(doc_type)
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown document type: {doc_type}. Valid types: {list(DOC_CONFIGS.keys())}",
        )
    return config


@router.get("/greeting", response_model=GreetingResponse)
def greeting(doc_type: str = Query(default="Mutual-NDA")):
    config = _get_config(doc_type)
    return GreetingResponse(message=config.greeting)


@router.get("/config", response_model=DocConfigResponse)
def doc_config(doc_type: str = Query(default="Mutual-NDA")):
    config = _get_config(doc_type)
    return DocConfigResponse(
        doc_type=config.doc_type,
        title=config.title,
        fields=[FieldDefinition(name=f.name, label=f.label, description=f.description) for f in config.fields],
    )


@router.post("/message", response_model=ChatMessageResponse)
def message(body: ChatMessageRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENROUTER_API_KEY is not configured",
        )

    config = _get_config(body.doc_type)
    extraction_model = EXTRACTION_MODELS[body.doc_type]

    messages = [{"role": "system", "content": config.system_prompt}]
    for msg in body.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": body.user_message})

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=extraction_model,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        extraction = extraction_model.model_validate_json(response.choices[0].message.content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {exc}",
        )

    doc_fields = {k: v for k, v in extraction.model_dump().items() if k != "assistant_reply"}
    return ChatMessageResponse(assistant_reply=extraction.assistant_reply, doc_fields=doc_fields)

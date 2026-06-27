from unittest.mock import MagicMock, patch

import pytest


def _make_completion_response(payload: dict):
    """Build a fake litellm completion response with JSON content."""
    import json

    choice = MagicMock()
    choice.message.content = json.dumps(payload)
    response = MagicMock()
    response.choices = [choice]
    return response


def test_greeting(client):
    r = client.get("/api/chat/greeting")
    assert r.status_code == 200
    body = r.json()
    assert "message" in body
    assert len(body["message"]) > 10


def test_message_returns_reply_and_fields(client, monkeypatch):
    fake_response = _make_completion_response(
        {
            "assistant_reply": "Great, let's get started!",
            "purpose": "Evaluating a potential partnership",
            "effective_date": "2026-07-01",
            "mnda_term_type": "expires",
            "mnda_term_years": "2",
            "confidentiality_term_type": "years",
            "confidentiality_term_years": "3",
            "governing_law": "Delaware",
            "jurisdiction": "New Castle, Delaware",
            "modifications": None,
            "party1_company": None,
            "party1_print_name": None,
            "party1_title": None,
            "party1_notice_address": None,
            "party2_company": None,
            "party2_print_name": None,
            "party2_title": None,
            "party2_notice_address": None,
        }
    )

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    with patch("app.chat.completion", return_value=fake_response):
        r = client.post(
            "/api/chat/message",
            json={"user_message": "We want to evaluate a potential partnership.", "history": []},
        )

    assert r.status_code == 200
    body = r.json()
    assert body["assistant_reply"] == "Great, let's get started!"
    assert body["nda_fields"]["purpose"] == "Evaluating a potential partnership"
    assert body["nda_fields"]["governing_law"] == "Delaware"


def test_message_passes_history(client, monkeypatch):
    """History is forwarded to the LLM as prior turns."""
    captured = {}

    def fake_completion(**kwargs):
        captured["messages"] = kwargs["messages"]
        return _make_completion_response(
            {
                "assistant_reply": "Got it.",
                **{k: None for k in [
                    "purpose", "effective_date", "mnda_term_type", "mnda_term_years",
                    "confidentiality_term_type", "confidentiality_term_years",
                    "governing_law", "jurisdiction", "modifications",
                    "party1_company", "party1_print_name", "party1_title", "party1_notice_address",
                    "party2_company", "party2_print_name", "party2_title", "party2_notice_address",
                ]},
            }
        )

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    with patch("app.chat.completion", side_effect=fake_completion):
        client.post(
            "/api/chat/message",
            json={
                "user_message": "Second message",
                "history": [
                    {"role": "assistant", "content": "Hello!"},
                    {"role": "user", "content": "First message"},
                ],
            },
        )

    roles = [m["role"] for m in captured["messages"]]
    assert roles == ["system", "assistant", "user", "user"]


def test_message_missing_api_key(client, monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    r = client.post(
        "/api/chat/message",
        json={"user_message": "hello", "history": []},
    )
    assert r.status_code == 503

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


def _nda_payload(**overrides):
    base = {
        "assistant_reply": "Great, let's get started!",
        "purpose": None,
        "effective_date": None,
        "mnda_term_type": None,
        "mnda_term_years": None,
        "confidentiality_term_type": None,
        "confidentiality_term_years": None,
        "governing_law": None,
        "jurisdiction": None,
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
    base.update(overrides)
    return base


def _csa_payload(**overrides):
    from app.doc_config import DOC_CONFIGS
    base = {"assistant_reply": "Got it.", **{f.name: None for f in DOC_CONFIGS["CSA"].fields}}
    base.update(overrides)
    return base


# ── Greeting ─────────────────────────────────────────────────────────────────

def test_greeting_default(client):
    r = client.get("/api/chat/greeting")
    assert r.status_code == 200
    assert len(r.json()["message"]) > 10


def test_greeting_with_doc_type(client):
    r = client.get("/api/chat/greeting?doc_type=CSA")
    assert r.status_code == 200
    body = r.json()
    assert "message" in body
    assert "Cloud Service Agreement" in body["message"] or "provider" in body["message"].lower()


def test_greeting_unknown_doc_type(client):
    r = client.get("/api/chat/greeting?doc_type=UnknownDoc")
    assert r.status_code == 400


# ── Config endpoint ───────��───────────────────────────────────────────────────

def test_config_returns_fields(client):
    r = client.get("/api/chat/config?doc_type=CSA")
    assert r.status_code == 200
    body = r.json()
    assert body["doc_type"] == "CSA"
    assert body["title"] == "Cloud Service Agreement"
    field_names = [f["name"] for f in body["fields"]]
    assert "provider_company" in field_names
    assert "customer_company" in field_names


def test_config_nda(client):
    r = client.get("/api/chat/config?doc_type=Mutual-NDA")
    assert r.status_code == 200
    body = r.json()
    assert body["doc_type"] == "Mutual-NDA"
    field_names = [f["name"] for f in body["fields"]]
    assert "purpose" in field_names
    assert "governing_law" in field_names


# ── Message endpoint ───────���──────────────────────────────────────────────────

def test_message_returns_reply_and_fields(client, monkeypatch):
    fake_response = _make_completion_response(
        _nda_payload(
            assistant_reply="Great, let's get started!",
            purpose="Evaluating a potential partnership",
            effective_date="2026-07-01",
            governing_law="Delaware",
            jurisdiction="New Castle, Delaware",
        )
    )

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    with patch("app.chat.completion", return_value=fake_response):
        r = client.post(
            "/api/chat/message",
            json={"user_message": "We want to evaluate a potential partnership.", "history": [], "doc_type": "Mutual-NDA"},
        )

    assert r.status_code == 200
    body = r.json()
    assert body["assistant_reply"] == "Great, let's get started!"
    assert body["doc_fields"]["purpose"] == "Evaluating a potential partnership"
    assert body["doc_fields"]["governing_law"] == "Delaware"


def test_message_csa_doc_type(client, monkeypatch):
    """CSA doc_type uses the CSA extraction model and returns CSA fields."""
    fake_response = _make_completion_response(
        _csa_payload(
            assistant_reply="Got it, Acme is the provider.",
            provider_company="Acme Inc.",
            customer_company="Beta Corp.",
        )
    )

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    with patch("app.chat.completion", return_value=fake_response):
        r = client.post(
            "/api/chat/message",
            json={"user_message": "Acme is the provider, Beta Corp is the customer.", "history": [], "doc_type": "CSA"},
        )

    assert r.status_code == 200
    body = r.json()
    assert body["assistant_reply"] == "Got it, Acme is the provider."
    assert body["doc_fields"]["provider_company"] == "Acme Inc."
    assert body["doc_fields"]["customer_company"] == "Beta Corp."


def test_message_defaults_to_mutual_nda(client, monkeypatch):
    """Omitting doc_type defaults to Mutual-NDA."""
    fake_response = _make_completion_response(_nda_payload(assistant_reply="Let's start."))

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    with patch("app.chat.completion", return_value=fake_response):
        r = client.post(
            "/api/chat/message",
            json={"user_message": "Hello", "history": []},
        )

    assert r.status_code == 200
    assert "doc_fields" in r.json()


def test_message_unknown_doc_type(client, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    r = client.post(
        "/api/chat/message",
        json={"user_message": "Hello", "history": [], "doc_type": "UnknownDoc"},
    )
    assert r.status_code == 400


def test_message_passes_history(client, monkeypatch):
    """History is forwarded to the LLM as prior turns."""
    captured = {}

    def fake_completion(**kwargs):
        captured["messages"] = kwargs["messages"]
        return _make_completion_response(_nda_payload(assistant_reply="Got it."))

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
                "doc_type": "Mutual-NDA",
            },
        )

    roles = [m["role"] for m in captured["messages"]]
    assert roles == ["system", "assistant", "user", "user"]


def test_message_missing_api_key(client, monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    r = client.post(
        "/api/chat/message",
        json={"user_message": "hello", "history": [], "doc_type": "Mutual-NDA"},
    )
    assert r.status_code == 503


# ── Catalog and template endpoints ─────��─────────────────────────────────────

def test_catalog_returns_list(client):
    r = client.get("/api/catalog")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert len(body) > 0
    assert "name" in body[0]
    assert "filename" in body[0]


def test_template_mutual_nda(client):
    r = client.get("/api/templates/Mutual-NDA.md")
    assert r.status_code == 200
    assert "Non-Disclosure" in r.text


def test_template_not_found(client):
    r = client.get("/api/templates/nonexistent.md")
    assert r.status_code == 404


def test_template_directory_traversal(client):
    # The URL gets path-normalized before routing, so we get 404; either 400 or 404 means the attempt failed
    r = client.get("/api/templates/../catalog.json")
    assert r.status_code in (400, 404)

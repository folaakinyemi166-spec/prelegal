import pytest


@pytest.fixture
def auth_client(client):
    client.post("/api/auth/signup", json={"email": "doc@example.com", "password": "secret123"})
    return client


@pytest.fixture
def saved_doc(auth_client):
    r = auth_client.post(
        "/api/documents",
        json={
            "doc_type": "Mutual-NDA",
            "doc_name": "Test NDA",
            "template_filename": "Mutual-NDA.md",
            "fields": {"party_a": "Acme Corp", "party_b": None},
        },
    )
    assert r.status_code == 201
    return r.json()


# ── Auth guard ─────────────────────────────────────────────────────────────

def test_list_unauthenticated(client):
    r = client.get("/api/documents")
    assert r.status_code == 401


def test_create_unauthenticated(client):
    r = client.post(
        "/api/documents",
        json={"doc_type": "Mutual-NDA", "doc_name": "x", "template_filename": "x.md"},
    )
    assert r.status_code == 401


# ── CRUD ───────────────────────────────────────────────────────────────────

def test_create_document(auth_client):
    r = auth_client.post(
        "/api/documents",
        json={
            "doc_type": "Mutual-NDA",
            "doc_name": "My NDA",
            "template_filename": "Mutual-NDA.md",
            "fields": {"party_a": "Alpha Inc"},
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["doc_name"] == "My NDA"
    assert body["fields"]["party_a"] == "Alpha Inc"
    assert "id" in body


def test_list_documents(auth_client, saved_doc):
    r = auth_client.get("/api/documents")
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) == 1
    assert docs[0]["id"] == saved_doc["id"]


def test_get_document(auth_client, saved_doc):
    r = auth_client.get(f"/api/documents/{saved_doc['id']}")
    assert r.status_code == 200
    assert r.json()["doc_name"] == "Test NDA"


def test_get_document_not_found(auth_client):
    r = auth_client.get("/api/documents/9999")
    assert r.status_code == 404


def test_update_document(auth_client, saved_doc):
    r = auth_client.put(
        f"/api/documents/{saved_doc['id']}",
        json={"fields": {"party_a": "Beta Corp", "party_b": "Gamma LLC"}},
    )
    assert r.status_code == 200
    assert r.json()["fields"]["party_a"] == "Beta Corp"
    assert r.json()["fields"]["party_b"] == "Gamma LLC"


def test_update_document_name(auth_client, saved_doc):
    r = auth_client.put(
        f"/api/documents/{saved_doc['id']}",
        json={"doc_name": "Renamed NDA"},
    )
    assert r.status_code == 200
    assert r.json()["doc_name"] == "Renamed NDA"


def test_delete_document(auth_client, saved_doc):
    r = auth_client.delete(f"/api/documents/{saved_doc['id']}")
    assert r.status_code == 204

    r = auth_client.get(f"/api/documents/{saved_doc['id']}")
    assert r.status_code == 404


def test_delete_not_found(auth_client):
    r = auth_client.delete("/api/documents/9999")
    assert r.status_code == 404


def test_user_isolation(client, saved_doc):
    # Second user cannot access first user's document
    client.post("/api/auth/signup", json={"email": "other@example.com", "password": "pass"})
    r = client.get(f"/api/documents/{saved_doc['id']}")
    assert r.status_code == 404

    r = client.get("/api/documents")
    assert r.json() == []

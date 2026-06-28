import pytest


@pytest.fixture
def user(client):
    r = client.post("/api/auth/signup", json={"email": "test@example.com", "password": "secret123"})
    assert r.status_code == 201
    return r.json()


def test_signup(client):
    r = client.post("/api/auth/signup", json={"email": "a@example.com", "password": "pass"})
    assert r.status_code == 201
    assert r.json()["email"] == "a@example.com"
    assert "auth_token" in r.cookies


def test_signup_duplicate_email(client, user):
    r = client.post("/api/auth/signup", json={"email": "test@example.com", "password": "other"})
    assert r.status_code == 409


def test_signin(client, user):
    r = client.post("/api/auth/signin", json={"email": "test@example.com", "password": "secret123"})
    assert r.status_code == 200
    assert r.json()["email"] == "test@example.com"
    assert "auth_token" in r.cookies


def test_signin_wrong_password(client, user):
    r = client.post("/api/auth/signin", json={"email": "test@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_me_authenticated(client, user):
    client.post("/api/auth/signin", json={"email": "test@example.com", "password": "secret123"})
    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == "test@example.com"


def test_me_unauthenticated(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_signout(client, user):
    client.post("/api/auth/signin", json={"email": "test@example.com", "password": "secret123"})
    r = client.post("/api/auth/signout")
    assert r.status_code == 200
    # After signout, /me should be unauthorized
    r = client.get("/api/auth/me")
    assert r.status_code == 401

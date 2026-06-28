import pytest
from fastapi.testclient import TestClient

import app.db as db_module


@pytest.fixture(autouse=True)
def _temp_db(tmp_path, monkeypatch):
    # Redirect DB_PATH before each test so every test gets a clean database
    db_file = str(tmp_path / "test.db")
    monkeypatch.setattr(db_module, "DB_PATH", db_file)
    db_module.init_db()
    yield


@pytest.fixture
def client():
    from app.main import app
    with TestClient(app) as c:
        yield c

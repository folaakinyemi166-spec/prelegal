import os
import sqlite3
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Cookie, HTTPException, Response, status
from jose import JWTError, jwt

from .db import get_connection
from .schemas import SigninRequest, SignupRequest, UserResponse

router = APIRouter(prefix="/api/auth")

_raw_secret = os.environ.get("JWT_SECRET", "")
if not _raw_secret:
    import warnings
    warnings.warn("JWT_SECRET is not set — using insecure default. Set JWT_SECRET in production.", stacklevel=1)
    _raw_secret = "dev-secret-change-in-production"
JWT_SECRET = _raw_secret
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7  # 1 week


def _create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, response: Response):
    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email",
            (body.email, password_hash),
        )
        row = cursor.fetchone()
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    finally:
        conn.close()

    token = _create_token(row["id"])
    response.set_cookie("auth_token", token, httponly=True, samesite="lax", max_age=JWT_EXPIRE_HOURS * 3600)
    return UserResponse(id=row["id"], email=row["email"])


@router.post("/signin", response_model=UserResponse)
def signin(body: SigninRequest, response: Response):
    conn = get_connection()
    row = conn.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (body.email,)).fetchone()
    conn.close()

    if not row or not bcrypt.checkpw(body.password.encode(), row["password_hash"].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = _create_token(row["id"])
    response.set_cookie("auth_token", token, httponly=True, samesite="lax", max_age=JWT_EXPIRE_HOURS * 3600)
    return UserResponse(id=row["id"], email=row["email"])


@router.post("/signout")
def signout(response: Response):
    response.delete_cookie("auth_token")
    return {"message": "Signed out"}


def get_current_user(auth_token: str | None = Cookie(default=None)) -> int:
    if not auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return _verify_token(auth_token)


@router.get("/me", response_model=UserResponse)
def me(auth_token: str | None = Cookie(default=None)):
    if not auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = _verify_token(auth_token)

    conn = get_connection()
    row = conn.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return UserResponse(id=row["id"], email=row["email"])

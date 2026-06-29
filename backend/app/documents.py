import json

from fastapi import APIRouter, Depends, HTTPException, status

from .auth import get_current_user
from .db import get_connection
from .schemas import DocumentCreate, DocumentResponse, DocumentUpdate

router = APIRouter(prefix="/api/documents")


def _row_to_response(row) -> DocumentResponse:
    return DocumentResponse(
        id=row["id"],
        doc_type=row["doc_type"],
        doc_name=row["doc_name"],
        template_filename=row["template_filename"],
        fields=json.loads(row["fields_json"]),
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
    )


@router.get("", response_model=list[DocumentResponse])
def list_documents(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    return [_row_to_response(r) for r in rows]


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(body: DocumentCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    try:
        cursor = conn.execute(
            """INSERT INTO documents (user_id, doc_type, doc_name, template_filename, fields_json)
               VALUES (?, ?, ?, ?, ?) RETURNING *""",
            (user_id, body.doc_type, body.doc_name, body.template_filename, json.dumps(body.fields)),
        )
        row = cursor.fetchone()
        conn.commit()
    finally:
        conn.close()
    return _row_to_response(row)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return _row_to_response(row)


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(doc_id: int, body: DocumentUpdate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id),
    ).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc_name = body.doc_name if body.doc_name is not None else row["doc_name"]
    fields_json = json.dumps(body.fields) if body.fields else row["fields_json"]

    cursor = conn.execute(
        """UPDATE documents
           SET doc_name = ?, fields_json = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ? RETURNING *""",
        (doc_name, fields_json, doc_id, user_id),
    )
    updated = cursor.fetchone()
    conn.commit()
    conn.close()
    return _row_to_response(updated)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    result = conn.execute(
        "DELETE FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id),
    )
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

import sqlite3
from pathlib import Path


DB_PATH = Path("app/metadata.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def initialize_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            department TEXT,
            document_type TEXT,
            uploaded_by TEXT,
            upload_date TEXT
        )
    """)

    connection.commit()
    connection.close()


def add_document(
    filename,
    department=None,
    document_type=None,
    uploaded_by=None,
    upload_date=None
):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO documents (
            filename,
            department,
            document_type,
            uploaded_by,
            upload_date
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        filename,
        department,
        document_type,
        uploaded_by,
        upload_date
    ))

    connection.commit()

    document_id = cursor.lastrowid

    connection.close()

    return document_id


def get_documents(
    department=None,
    document_type=None,
    uploaded_by=None
):
    connection = get_connection()

    cursor = connection.cursor()

    query = """
        SELECT
            id,
            filename,
            department,
            document_type,
            uploaded_by,
            upload_date
        FROM documents
        WHERE 1=1
    """

    parameters = []

    if department:
        query += " AND department = ?"
        parameters.append(department)

    if document_type:
        query += " AND document_type = ?"
        parameters.append(document_type)

    if uploaded_by:
        query += " AND uploaded_by = ?"
        parameters.append(uploaded_by)

    cursor.execute(query, parameters)

    rows = cursor.fetchall()

    connection.close()

    documents = []

    for row in rows:
        documents.append({
            "id": row[0],
            "filename": row[1],
            "department": row[2],
            "document_type": row[3],
            "uploaded_by": row[4],
            "upload_date": row[5]
        })

    return documents

def delete_document(document_id):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        "SELECT filename FROM documents WHERE id = ?",
        (document_id,)
    )

    row = cursor.fetchone()

    if not row:
        connection.close()
        return None

    filename = row[0]

    cursor.execute(
        "DELETE FROM documents WHERE id = ?",
        (document_id,)
    )

    connection.commit()
    connection.close()

    return filename
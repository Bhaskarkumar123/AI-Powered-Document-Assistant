import sqlite3
from pathlib import Path
from datetime import datetime


DB_PATH = Path("app/metadata.db")


def initialize_feedback_table():
    connection = sqlite3.connect(DB_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            query TEXT,
            answer TEXT,
            rating TEXT NOT NULL,
            comment TEXT,
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def add_feedback(
    session_id: str,
    query: str,
    answer: str,
    rating: str,
    comment: str | None = None
):
    connection = sqlite3.connect(DB_PATH)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO feedback (
            session_id,
            query,
            answer,
            rating,
            comment,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        session_id,
        query,
        answer,
        rating,
        comment,
        datetime.now().isoformat()
    ))

    feedback_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return feedback_id


def get_feedback():
    connection = sqlite3.connect(DB_PATH)

    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM feedback
        ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]
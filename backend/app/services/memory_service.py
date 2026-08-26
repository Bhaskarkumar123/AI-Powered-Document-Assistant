from typing import Dict, List


# Temporary in-memory conversation storage
conversations: Dict[str, List[dict]] = {}


def get_conversation(session_id: str):
    """
    Get conversation history for a session.
    """

    return conversations.get(session_id, [])


def add_message(
    session_id: str,
    role: str,
    content: str
):
    """
    Add a message to conversation history.
    """

    if session_id not in conversations:
        conversations[session_id] = []

    conversations[session_id].append({
        "role": role,
        "content": content
    })


def clear_conversation(session_id: str):
    """
    Clear conversation history.
    """

    conversations.pop(session_id, None)
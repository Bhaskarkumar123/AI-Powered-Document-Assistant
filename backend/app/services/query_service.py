import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is not configured."
    )


client = Groq(api_key=api_key)


def rewrite_query(query, history=None):
    """
    Rewrite the user's query using conversation history.
    """

    if not history:
        return query

    conversation = []

    for message in history[-6:]:
        role = message.get("role", "")
        content = message.get("content", "")

        if content:
            conversation.append(
                f"{role}: {content}"
            )

    history_text = "\n".join(conversation)

    prompt = f"""
You are a query rewriting system for an Enterprise
Knowledge Assistant.

Rewrite the user's latest query into a clear,
standalone search query.

Use the conversation history to understand references
such as it, this, that, they, and those.

Do not answer the question.
Return ONLY the rewritten search query.

Conversation history:
{history_text}

Latest user query:
{query}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": "You rewrite search queries only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    rewritten_query = response.choices[0].message.content

    if not rewritten_query:
        return query

    return rewritten_query.strip()
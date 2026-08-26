import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is not configured"
    )

client = Groq(api_key=api_key)


def generate_answer(
    query,
    retrieved_chunks,
    conversation_history=None
):
    """
    Generate an answer using retrieved document chunks
    and previous conversation history.
    """

    if not retrieved_chunks:
        return {
            "answer": (
                "I could not find relevant information "
                "in the uploaded documents."
            ),
            "sources": []
        }

    context_parts = []
    sources = []

    for index, chunk in enumerate(
        retrieved_chunks,
        start=1
    ):

        context_parts.append(
            f"""
Source {index}
File: {chunk['filename']}
Page: {chunk['page_number']}

Content:
{chunk['text']}
"""
        )

        sources.append({
            "filename": chunk["filename"],
            "page_number": chunk["page_number"]
        })

    context = "\n".join(context_parts)

    # Build conversation history
    history_text = ""

    if conversation_history:

        for message in conversation_history[-10:]:

            history_text += (
                f"{message['role'].capitalize()}: "
                f"{message['content']}\n"
            )

    prompt = f"""
You are an Enterprise Knowledge Assistant.

Answer the user's question ONLY using the
provided document context.

You may use the conversation history to
understand references such as:
"it", "that policy", "this document",
or "the previous answer".

Do not invent facts.

If the answer cannot be found in the
document context, say:

"I could not find this information
in the uploaded documents."

Conversation History:
{history_text}

User Question:
{query}

Document Context:
{context}

Provide a clear and concise answer.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful enterprise "
                    "document assistant."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": sources
    }
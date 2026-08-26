from app.services.metadata_service import get_documents


def get_dashboard_statistics():
    """
    Return statistics required by the admin dashboard.
    """

    documents = get_documents()

    total_documents = len(documents)

    departments = {}

    for document in documents:
        department = document.get(
            "department",
            "General"
        )

        departments[department] = (
            departments.get(department, 0) + 1
        )

    return {
        "total_documents": total_documents,
        "total_departments": len(departments),
        "departments": departments,
        "recent_documents": documents[-5:]
    }
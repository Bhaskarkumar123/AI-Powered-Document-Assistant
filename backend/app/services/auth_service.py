from fastapi import HTTPException


VALID_ROLES = {
    "admin",
    "manager",
    "user"
}


def validate_role(role: str):
    """
    Validate user role.
    """

    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    return role


def check_permission(
    role: str,
    permission: str
):
    """
    Check whether a role has a specific permission.
    """

    permissions = {
        "admin": {
            "upload_document",
            "delete_document",
            "view_all_documents",
            "view_documents",
            "manage_users",
            "ask_question"
        },

        "manager": {
            "upload_document",
            "view_assigned_documents",
            "view_documents",
            "ask_question"
        },

        "user": {
            "upload_document",
            "view_authorized_documents",
            "view_documents",
            "ask_question"
        }
    }

    validate_role(role)

    if permission not in permissions[role]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to perform this action"
        )

    return True
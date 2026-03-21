from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.user import User


def require_role(*roles: str):
    async def dependency(user: User = Depends(get_current_user)):
        if user.role.value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(roles)}.",
            )
        return user
    return dependency


require_borrower = require_role("borrower")
require_investor = require_role("investor")
require_admin = require_role("admin")

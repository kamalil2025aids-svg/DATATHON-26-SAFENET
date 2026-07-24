"""
Custom exceptions for SafeNet application.
"""

class SafeNetException(Exception):
    """Base exception for SafeNet."""
    def __init__(self, status_code: int, detail: str, error_code: str = "UNKNOWN"):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code

class NotFoundException(SafeNetException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail, error_code="NOT_FOUND")

class UnauthorizedException(SafeNetException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail, error_code="UNAUTHORIZED")

class ForbiddenException(SafeNetException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail, error_code="FORBIDDEN")

class BadRequestException(SafeNetException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=400, detail=detail, error_code="BAD_REQUEST")
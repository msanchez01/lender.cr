from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Lender.cr"
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "postgresql://lendercr:lendercr@localhost:5432/lendercr"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # API Key (for admin endpoints)
    API_KEY: str = ""

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "no-reply@lender.cr"

    # Cloudflare Turnstile
    TURNSTILE_SECRET_KEY: str = ""

    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "lendercr"
    R2_ENDPOINT_URL: str = ""
    R2_PUBLIC_URL: str = ""

    # Admin
    ADMIN_USER_EMAIL: str = ""
    ADMIN_USER_PASSWORD: str = ""

    # Site
    SITE_URL: str = "https://lender.cr"
    ENVIRONMENT: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

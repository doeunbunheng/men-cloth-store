from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# ============================================================
# BASE DIRECTORY + ENV
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# ============================================================
# DJANGO BASIC CONFIG
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY", "django-secret-key-change-in-production")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]


# ============================================================
# INSTALLED APPS
# ============================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",
    "store",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / WSGI
# ============================================================

ROOT_URLCONF = "mens_store.urls"

WSGI_APPLICATION = "mens_store.wsgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]


# ============================================================
# ORACLE DATABASE CONFIG
# ============================================================

# Used by store/utils.py with oracledb.connect()
ORACLE_CONFIG = {
    "user": os.getenv("DB_USER", "SYSTEM"),
    "password": os.getenv("DB_PASSWORD"),
    "dsn": os.getenv("DB_NAME", "localhost:1521/orclpdb"),
}

# Used by Django ORM/admin
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.oracle",
        "NAME": os.getenv("DB_NAME", "localhost:1521/orclpdb"),
        "USER": os.getenv("DB_USER", "SYSTEM"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
    }
}


# ============================================================
# CORS CONFIG
# ============================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True


# ============================================================
# REST FRAMEWORK / JWT
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}


# ============================================================
# LANGUAGE / TIMEZONE
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Phnom_Penh"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC / MEDIA FILES
# ============================================================

STATIC_URL = "static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


# ============================================================
# DEFAULT AUTO FIELD
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
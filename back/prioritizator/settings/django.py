import os

from decouple import config, Csv
from dj_database_url import parse as db_url


BASE_DIR = os.path.abspath(os.path.join(__file__, '..', '..'))

SECRET_KEY = config('SECRET_KEY', '#a!8)&0%ihs*zzt5c2hv45u)6s+3$finso1gh&$nis!g6m23+6')

DEBUG = config('DEBUG', False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', '', cast=Csv())


INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'social_django',
    # 'rest_framework.authtoken',  # only if you use token authentication
    # 'social.apps.django_app.default',  # python social auth
    # 'rest_social_auth',  # provide exchange code to DRF auth token
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'prioritizator.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'prioritizator.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', None),
        'USER': config('DB_USER', None),
        'PASSWORD': config('DB_PASSWORD', None),
        'HOST': config('DB_HOST', None),
        'PORT': config('DB_PORT', None),
    },
}

DB_URL = config('DB_URL', None)
if DB_URL is not None:
    DATABASES['default'] = db_url(DB_URL)


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..', 'staticfiles'))

AUTHENTICATION_BACKENDS = (
    # 'social.backends.facebook.FacebookOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

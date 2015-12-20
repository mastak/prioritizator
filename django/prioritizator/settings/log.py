import os

from .django import DEBUG


LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console'],
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'filters': ['require_debug_true'],
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
        },
        'py.warnings': {
            'handlers': ['console'],
        },
    }
}

if 'SENTRY_DSN' in os.environ and os.environ['SENTRY_DSN']:
    RAVEN_CONFIG = {
        'dsn': os.environ['SENTRY_DSN']
    }
    LOGGING['handlers'].extend({
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler'
        },
        'sentry.debug': {
            'level': 'DEBUG',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
            'filters': ['require_debug_true'],
        },
    })
    LOGGING['loggers'].extend({
        'django.request': {
            'handlers': ['sentry'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['sentry'],
            'level': 'ERROR',
            'propagate': False,
        },
        'sentry.debug': {
            'level': 'DEBUG',
            'handlers': ['sentry.debug'],
        },
    })
    LOGGING['root']['handlers'].append('sentry')

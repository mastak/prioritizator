"""prioritizator URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers

from prioritizator.apps.account.api import views as account_views

router = routers.SimpleRouter()
router.register(r'user', account_views.UserViewSet)


urlpatterns = [
    url(r'^api/v1/', include([
        url(r'^login/', include('rest_social_auth.urls_session')),
        url(r'^login/', include('rest_social_auth.urls_token')),
        url(r'^', include(router.urls)),
    ])),

    url(r'^admin/', admin.site.urls),
]

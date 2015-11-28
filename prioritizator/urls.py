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

    url(r'^admin/', include(admin.site.urls)),
]

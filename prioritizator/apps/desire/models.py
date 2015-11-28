from django.conf import settings
from django.db import models


class Desire(models.Model):
    title = models.CharField(max_length=255)
    price = models.CharField(null=True, blank=True)  # it's can be range `100-150`
    created_at = models.DateTimeField(auto_now_add=True)
    expire_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    weight = models.SmallIntegerField(default=0)
    done = models.BooleanField(default=False)


class Category(models.Model):
    parent = models.ForeignKey('self', blank=True, null=True)
    title = models.CharField(max_length=150)
    weight = models.SmallIntegerField()
    desires = models.ManyToManyField(Desire, related_name='categories',
                                     related_query_name='category')


class Comparison(models.Model):
    desire1 = models.ForeignKey(Desire, related_name='compare1')
    desire2 = models.ForeignKey(Desire, related_name='compare2')
    result = models.ForeignKey(Desire, related_name='result')
    category = models.ForeignKey(Category)

    class Meta:
        unique_together = ('desire1', 'desire2', 'category')

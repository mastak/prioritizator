from django.contrib.auth import get_user_model
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('url', 'username')


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ('password', 'first_name', 'email',)
#         extra_kwargs = {
#                 'password': {'write_only': True}
#         }
#         write_only_fields = ('password',)
#         # read_only_fields = ('is_staff', 'is_superuser', 'is_active', 'date_joined',)
#
#     def update(self, instance, validated_data):
#         instance.set_password(validated_data['password'])
#         instance.save()
#         return instance
#
#     def create(self, validated_data):
#         user = User.objects.create(**validated_data)
#         user.set_password(validated_data['password'])
#         return user

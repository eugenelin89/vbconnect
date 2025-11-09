from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.players.models import PlayerProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_profile(sender, instance: User, created: bool, **kwargs):
    if not created:
        return
    PlayerProfile.objects.get_or_create(user=instance)


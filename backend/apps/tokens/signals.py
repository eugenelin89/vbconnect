from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.achievements.models import PlayerAchievement
from apps.tokens.models import TokenTransaction


@receiver(post_save, sender=PlayerAchievement)
def award_tokens(sender, instance: PlayerAchievement, created: bool, **kwargs):
    if not created:
        return
    reward = instance.achievement.token_reward
    if reward <= 0:
        return
    TokenTransaction.objects.create(
        profile=instance.profile,
        amount=reward,
        reason=f"Achievement: {instance.achievement.name}",
        created_by=instance.awarded_by,
    )


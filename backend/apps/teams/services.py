from apps.players.models import PlayerProfile


def attach_user_to_team(user, team):
    profile, _ = PlayerProfile.objects.get_or_create(user=user)
    profile.team = team
    profile.save(update_fields=["team", "updated_at"])
    return profile


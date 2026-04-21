import random
from django.db import migrations

def populate_user_data(apps, schema_editor):
    User = apps.get_model('api', 'User')
    for user in User.objects.all():
        save_needed = False
        if not user.full_name:
            user.full_name = user.email.split('@')[0] if user.email else user.username
            save_needed = True
        if not user.phone_number:
            # Generate random 10-digit number starting with 9
            user.phone_number = '9' + ''.join([str(random.randint(0, 9)) for _ in range(9)])
            save_needed = True
        if save_needed:
            user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0014_alter_user_full_name_alter_user_phone_number'),
    ]

    operations = [
        migrations.RunPython(populate_user_data),
    ]

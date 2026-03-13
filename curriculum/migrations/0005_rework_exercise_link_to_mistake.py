import django.db.models.deletion
from django.db import migrations, models


def delete_all_exercises(apps, schema_editor):
    Exercise = apps.get_model("curriculum", "Exercise")
    Exercise.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("curriculum", "0004_exercise_user_answer_exercise_weakness_tag"),
        ("analysis", "0001_initial"),
    ]

    operations = [
        # Delete all existing exercises (they don't have mistake links)
        migrations.RunPython(delete_all_exercises, migrations.RunPython.noop),
        # Remove old weakness_tag field
        migrations.RemoveField(
            model_name="exercise",
            name="weakness_tag",
        ),
        # Add mistake FK (non-nullable is safe since table is empty)
        migrations.AddField(
            model_name="exercise",
            name="mistake",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="exercise",
                to="analysis.mistake",
            ),
            preserve_default=False,
        ),
    ]

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0006_merge_20260911_0055'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrgWorkRequestTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('work_request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='organization.orgworkrequest')),
                ('language', models.CharField(choices=[('en', 'English'), ('mr', 'Marathi'), ('hi', 'Hindi')], max_length=2)),
                ('work_description', models.TextField()),
            ],
            options={
                'db_table': 'org_work_request_translations',
                'unique_together': {('work_request', 'language')},
            },
        ),
    ]
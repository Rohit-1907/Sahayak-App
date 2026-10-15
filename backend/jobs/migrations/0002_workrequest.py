# Generated migration for WorkRequest model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('service_category', models.CharField(db_index=True, max_length=100)),
                ('title', models.CharField(blank=True, max_length=200)),
                ('description', models.TextField()),
                ('work_address', models.TextField()),
                ('work_latitude', models.FloatField()),
                ('work_longitude', models.FloatField()),
                ('required_date', models.DateField()),
                ('required_time', models.TimeField()),
                ('number_of_workers', models.IntegerField(default=1)),
                ('estimated_budget', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('status', models.CharField(choices=[('REQUESTED', 'Requested'), ('SCHEDULED', 'Scheduled'), ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled'), ('COMPLETED', 'Completed')], db_index=True, default='REQUESTED', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('rejected_at', models.DateTimeField(blank=True, null=True)),
                ('cancelled_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('rejection_reason', models.TextField(blank=True)),
                ('cancellation_reason', models.TextField(blank=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='work_requests_sent', to='users.customerprofile')),
                ('worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='work_requests_received', to='users.workerprofile')),
            ],
            options={
                'db_table': 'work_requests',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='workrequest',
            index=models.Index(fields=['client', 'status'], name='work_reques_client__idx'),
        ),
        migrations.AddIndex(
            model_name='workrequest',
            index=models.Index(fields=['worker', 'status'], name='work_reques_worker__idx'),
        ),
        migrations.AddIndex(
            model_name='workrequest',
            index=models.Index(fields=['service_category'], name='work_reques_service_idx'),
        ),
        migrations.AddIndex(
            model_name='workrequest',
            index=models.Index(fields=['required_date'], name='work_reques_require_idx'),
        ),
        migrations.AddIndex(
            model_name='workrequest',
            index=models.Index(fields=['status', 'created_at'], name='work_reques_status__idx'),
        ),
    ]


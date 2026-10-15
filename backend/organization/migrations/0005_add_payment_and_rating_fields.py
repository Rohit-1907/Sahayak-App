# Generated migration for adding payment and rating fields to OrgWorkRequest

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0004_add_datetime_to_org_work_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='orgworkrequest',
            name='service_charge',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, help_text='Service charge entered by client'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='platform_fee',
            field=models.DecimalField(decimal_places=2, default=50, max_digits=10, help_text='Platform fee (fixed Rs. 50)'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='additional_charges',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, help_text='Additional charges if any'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='additional_charges_reason',
            field=models.TextField(blank=True, default='', help_text='Reason for additional charges'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='total_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, help_text='Total payment amount'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='payment_mode',
            field=models.CharField(choices=[('CASH', 'Cash'), ('UPI', 'UPI'), ('CARD', 'Card')], default='CASH', max_length=20, help_text='Payment method'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True, help_text='When payment was completed'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='rating',
            field=models.IntegerField(blank=True, null=True, help_text='Client rating (1-5 stars)'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='feedback',
            field=models.TextField(blank=True, default='', help_text='Client feedback'),
        ),
        migrations.AddField(
            model_name='orgworkrequest',
            name='rated_at',
            field=models.DateTimeField(blank=True, null=True, help_text='When rating was submitted'),
        ),
        migrations.AlterField(
            model_name='orgworkrequest',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                    ('completed', 'Completed'),
                ],
                default='pending',
                max_length=20
            ),
        ),
    ]

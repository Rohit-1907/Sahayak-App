from services.translation_engine.translator import TranslationEngine

from .models import WorkRequestTranslation


LANGUAGE_CODES = {
    'en': 'eng',
    'mr': 'mar',
    'hi': 'hin',
}

TRANSLATED_FIELDS = (
    'title',
    'description',
    'rejection_reason',
    'cancellation_reason',
    'feedback',
)


def synchronize_work_request_translations(work_request, source_language):
    if source_language not in LANGUAGE_CODES:
        raise ValueError(f'Unsupported source language: {source_language}')

    source_code = LANGUAGE_CODES[source_language]
    engine = TranslationEngine()
    source_values = {
        field: getattr(work_request, field, '') or ''
        for field in TRANSLATED_FIELDS
    }
    for language, target_code in LANGUAGE_CODES.items():
        translated_values = {}
        for field, value in source_values.items():
            if not value:
                translated_values[field] = ''
            elif language == source_language:
                translated_values[field] = value
            else:
                translated_values[field] = engine.translate(
                    value,
                    source_code,
                    target_code,
                )

        WorkRequestTranslation.objects.update_or_create(
            work_request=work_request,
            language=language,
            defaults={
                **translated_values,
            },
        )

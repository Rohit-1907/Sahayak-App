from pathlib import Path

from .translate import IndicTransONNX
from .terminology import LANGUAGES, correct_terminology


BASE_PATH = Path(__file__).resolve().parent / 'models'

INDIC_INDIC_MODEL = str(BASE_PATH / 'indictrans2-int8')
EN_INDIC_MODEL = str(BASE_PATH / 'indictrans2-en-indic-int8')
INDIC_EN_MODEL = str(BASE_PATH / 'indictrans2-indic-en-int8')


class TranslationEngine:
    def __init__(self):
        self.indic_indic = None
        self.en_indic = None
        self.indic_en = None

    def _get_model(self, source_language, target_language):
        if source_language == 'eng':
            if self.en_indic is None:
                self.en_indic = IndicTransONNX(EN_INDIC_MODEL)
            return self.en_indic

        if target_language == 'eng':
            if self.indic_en is None:
                self.indic_en = IndicTransONNX(INDIC_EN_MODEL)
            return self.indic_en

        if self.indic_indic is None:
            self.indic_indic = IndicTransONNX(INDIC_INDIC_MODEL)
        return self.indic_indic

    def translate(self, text, source_language, target_language):
        if source_language not in LANGUAGES:
            raise ValueError('Unsupported source language')

        if target_language not in LANGUAGES:
            raise ValueError('Unsupported target language')

        if not text or not text.strip():
            return ''

        if source_language == target_language:
            return text

        source_code = LANGUAGES[source_language]
        target_code = LANGUAGES[target_language]

        model = self._get_model(source_language, target_language)
        translated = model.translate(
            text,
            src_lang=source_code,
            tgt_lang=target_code,
        )
        translated = correct_terminology(str(translated), target_language)
        return translated

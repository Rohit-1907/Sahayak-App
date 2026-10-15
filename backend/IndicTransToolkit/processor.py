class _PlaceholderEntityMaps:
    def __init__(self):
        self.queue = []


class IndicProcessor:
    def __init__(self, inference=True, **kwargs):
        self.inference = inference
        self._placeholder_entity_maps = _PlaceholderEntityMaps()

    def preprocess_batch(self, texts, src_lang=None, tgt_lang=None):
        return [f"{src_lang} {tgt_lang} {text}" for text in texts]

    def postprocess_batch(self, texts, lang=None):
        results = []
        for text in texts:
            value = str(text or '').strip()
            if lang and value.startswith(f'{lang} '):
                value = value[len(lang):].lstrip()
            results.append(value)
        return results

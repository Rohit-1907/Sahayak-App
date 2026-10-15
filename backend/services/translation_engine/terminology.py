LANGUAGES = {
    "eng": "eng_Latn",
    "hin": "hin_Deva",
    "mar": "mar_Deva",
}


# Canonical KaamSetu terminology
TERMINOLOGY = {
    "Cleaning": {
        "eng": "Cleaning",
        "hin": "क्लीनिंग",
        "mar": "क्लीनिंग",
    },
    "AC Repair": {
        "eng": "AC Repair",
        "hin": "एसी रिपेयर",
        "mar": "एसी रिपेअर",
    },
    "AC Technician": {
        "eng": "AC Technician",
        "hin": "एसी टेक्नीशियन",
        "mar": "एसी टेक्निशियन",
    },
    "Mason": {
        "eng": "Mason",
        "hin": "मेसन",
        "mar": "मेसन",
    },
    "Security Guard": {
        "eng": "Security Guard",
        "hin": "सिक्योरिटी गार्ड",
        "mar": "सिक्युरिटी गार्ड",
    },
    "Plumber": {
        "eng": "Plumber",
        "hin": "प्लंबर",
        "mar": "प्लंबर",
    },
    "Painter": {
        "eng": "Painter",
        "hin": "पेंटर",
        "mar": "पेंटर",
    },
    "Mechanic": {
        "eng": "Mechanic",
        "hin": "मैकेनिक",
        "mar": "मेकॅनिक",
    },
    "Cook": {
        "eng": "Cook",
        "hin": "कुक",
        "mar": "कुक",
    },
    "Loader": {
        "eng": "Loader",
        "hin": "लोडर",
        "mar": "लोडर",
    },
    "Gardener": {
        "eng": "Gardener",
        "hin": "गार्डनर",
        "mar": "गार्डनर",
    },
    "Construction": {
        "eng": "Construction",
        "hin": "कंस्ट्रक्शन",
        "mar": "कन्स्ट्रक्शन",
    },
    "Driver": {
        "eng": "Driver",
        "hin": "ड्राइवर",
        "mar": "ड्रायव्हर",
    },
    "Carpenter": {
        "eng": "Carpenter",
        "hin": "कारपेंटर",
        "mar": "कारपेंटर",
    },
    "Packer": {
        "eng": "Packer",
        "hin": "पैकर",
        "mar": "पॅकर",
    },
    "Pest Control": {
        "eng": "Pest Control",
        "hin": "पेस्ट कंट्रोल",
        "mar": "पेस्ट कंट्रोल",
    },
    "Welder": {
        "eng": "Welder",
        "hin": "वेल्डर",
        "mar": "वेल्डर",
    },
    "Laundry Worker": {
        "eng": "Laundry Worker",
        "hin": "लॉन्ड्री वर्कर",
        "mar": "लॉन्ड्री वर्कर",
    },
    "Electrical": {
        "eng": "Electrical",
        "hin": "इलेक्ट्रिकल",
        "mar": "इलेक्ट्रिकल",
    },
    "Tile Worker": {
        "eng": "Tile Worker",
        "hin": "टाइल वर्कर",
        "mar": "टाइल वर्कर",
    },
    "Maintenance Worker": {
        "eng": "Maintenance Worker",
        "hin": "मेंटेनन्स वर्कर",
        "mar": "मेंटेनन्स वर्कर",
    },
    "Farm Worker": {
        "eng": "Farm Worker",
        "hin": "फार्म वर्कर",
        "mar": "फार्म वर्कर",
    },
}


# Corrections for terms that IndicTrans2 may translate too literally/formally.
# We will add verified model outputs here as we encounter them.
CORRECTIONS = {
    "hin": {
        "नलसाज": "प्लंबर",
    },

    "mar": {
         "नलसाज": "प्लंबर",
         "नळकार": "प्लंबर",
    },

    "eng": {
    },
}


def correct_terminology(text, target_language):
    """
    Correct domain-specific terminology AFTER IndicTrans2 translation.
    Normal text is left unchanged.
    """

    if target_language not in CORRECTIONS:
        return text

    corrected = text

    for wrong_term, preferred_term in CORRECTIONS[target_language].items():
        corrected = corrected.replace(wrong_term, preferred_term)

    return corrected
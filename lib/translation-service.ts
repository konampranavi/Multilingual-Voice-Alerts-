// This service handles translation of text to different languages
// In a production environment, you would use a real translation API like Google Translate, DeepL, etc.

// Language codes for translation APIs
export const languageCodes: Record<string, string> = {
  English: "en",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Russian: "ru",
  Japanese: "ja",
  Chinese: "zh",
  Arabic: "ar",
  Hindi: "hi",
  Korean: "ko",
  Dutch: "nl",
  Swedish: "sv",
  Polish: "pl",
}

// Translation function using a mock API for demo purposes
// In a real app, replace this with a call to a translation API
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // If target language is English, no translation needed
  if (targetLanguage === "English") return text

  // In a real implementation, you would use something like:
  // const response = await fetch('https://translation-api.com/translate', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text,
  //     source: 'en',
  //     target: languageCodes[targetLanguage]
  //   })
  // });
  // const data = await response.json();
  // return data.translatedText;

  try {
    // For demo purposes, we'll use some predefined translations
    const translations: Record<string, Record<string, string>> = {
      // Temperature alerts
      "High temperature alert": {
        Spanish: "Alerta de temperatura alta",
        French: "Alerte de température élevée",
        German: "Hochtemperaturalarm",
        Italian: "Allarme alta temperatura",
        Hindi: "उच्च तापमान अलर्ट",
      },
      "Low temperature alert": {
        Spanish: "Alerta de temperatura baja",
        French: "Alerte de basse température",
        German: "Niedrigtemperaturalarm",
        Italian: "Allarme bassa temperatura",
        Hindi: "निम्न तापमान अलर्ट",
      },
      // Smoke alerts
      "Smoke detected": {
        Spanish: "Humo detectado",
        French: "Fumée détectée",
        German: "Rauch erkannt",
        Italian: "Fumo rilevato",
        Hindi: "धुआं का पता चला",
      },
      // Gas alerts
      "Gas leak detected": {
        Spanish: "Fuga de gas detectada",
        French: "Fuite de gaz détectée",
        German: "Gasleck erkannt",
        Italian: "Rilevata perdita di gas",
        Hindi: "गैस लीक का पता चला",
      },
      // Humidity alerts
      "High humidity alert": {
        Spanish: "Alerta de humedad alta",
        French: "Alerte d'humidité élevée",
        German: "Hohe Luftfeuchtigkeitsalarm",
        Italian: "Allarme umidità elevata",
        Hindi: "उच्च आर्द्रता अलर्ट",
      },
      // Wind alerts
      "High wind alert": {
        Spanish: "Alerta de viento fuerte",
        French: "Alerte de vent fort",
        German: "Starkwindalarm",
        Italian: "Allarme vento forte",
        Hindi: "तेज हवा अलर्ट",
      },
      // Normal conditions
      "Environmental monitoring": {
        Spanish: "Monitoreo ambiental",
        French: "Surveillance environnementale",
        German: "Umweltüberwachung",
        Italian: "Monitoraggio ambientale",
        Hindi: "पर्यावरण निगरानी",
      },
      "All readings normal": {
        Spanish: "Todas las lecturas normales",
        French: "Toutes les lectures sont normales",
        German: "Alle Messwerte normal",
        Italian: "Tutte le letture normali",
        Hindi: "सभी रीडिंग सामान्य",
      },
      // Common words
      Temperature: {
        Spanish: "Temperatura",
        French: "Température",
        German: "Temperatur",
        Italian: "Temperatura",
        Hindi: "तापमान",
      },
      Humidity: {
        Spanish: "Humedad",
        French: "Humidité",
        German: "Luftfeuchtigkeit",
        Italian: "Umidità",
        Hindi: "आर्द्रता",
      },
      Wind: {
        Spanish: "Viento",
        French: "Vent",
        German: "Wind",
        Italian: "Vento",
        Hindi: "हवा",
      },
      "Please take precautions": {
        Spanish: "Por favor tome precauciones",
        French: "Veuillez prendre des précautions",
        German: "Bitte Vorsichtsmaßnahmen treffen",
        Italian: "Si prega di prendere precauzioni",
        Hindi: "कृपया सावधानी बरतें",
      },
      "Risk of": {
        Spanish: "Riesgo de",
        French: "Risque de",
        German: "Risiko von",
        Italian: "Rischio di",
        Hindi: "का जोखिम",
      },
      "Potential for": {
        Spanish: "Potencial de",
        French: "Potentiel de",
        German: "Potenzial für",
        Italian: "Potenziale di",
        Hindi: "के लिए संभावना",
      },
      "Secure loose objects": {
        Spanish: "Asegure objetos sueltos",
        French: "Sécurisez les objets non fixés",
        German: "Lose Gegenstände sichern",
        Italian: "Fissare gli oggetti sciolti",
        Hindi: "ढीली वस्तुओं को सुरक्षित करें",
      },
    }

    // Try to find translations for parts of the text
    let translatedText = text

    // Replace known phrases with their translations
    for (const [phrase, langTranslations] of Object.entries(translations)) {
      if (translatedText.includes(phrase)) {
        // Check if we have a translation for this language
        const translation = langTranslations[targetLanguage]
        if (translation) {
          translatedText = translatedText.replace(new RegExp(phrase, "g"), translation)
        }
      }
    }

    // Replace numbers and units
    translatedText = translatedText.replace(/(\d+(\.\d+)?)\s*°C/g, (match, number) => `${number}°C`)
    translatedText = translatedText.replace(/(\d+(\.\d+)?)\s*%/g, (match, number) => `${number}%`)
    translatedText = translatedText.replace(/(\d+(\.\d+)?)\s*km\/h/g, (match, number) => `${number} km/h`)

    // If the text hasn't been fully translated, add a language prefix
    if (translatedText === text) {
      return `[${targetLanguage}] ${text}`
    }

    return translatedText
  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error)
    // Return a fallback translation with language prefix
    return `[${targetLanguage}] ${text}`
  }
}

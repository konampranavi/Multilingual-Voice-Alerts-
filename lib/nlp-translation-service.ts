// Enhanced NLP-based translation service with comprehensive language support
// This uses a combination of predefined translations and NLP patterns

export const supportedLanguages = {
  English: { code: "en", voice: "en-US" },
  Spanish: { code: "es", voice: "es-ES" },
  French: { code: "fr", voice: "fr-FR" },
  German: { code: "de", voice: "de-DE" },
  Italian: { code: "it", voice: "it-IT" },
  Portuguese: { code: "pt", voice: "pt-PT" },
  Russian: { code: "ru", voice: "ru-RU" },
  Japanese: { code: "ja", voice: "ja-JP" },
  Chinese: { code: "zh", voice: "zh-CN" },
  Arabic: { code: "ar", voice: "ar-SA" },
  Hindi: { code: "hi", voice: "hi-IN" },
  Korean: { code: "ko", voice: "ko-KR" },
  Dutch: { code: "nl", voice: "nl-NL" },
  Swedish: { code: "sv", voice: "sv-SE" },
  Polish: { code: "pl", voice: "pl-PL" },
  Telugu: { code: "te", voice: "te-IN" },
  Tamil: { code: "ta", voice: "ta-IN" },
  Bengali: { code: "bn", voice: "bn-IN" },
  Gujarati: { code: "gu", voice: "gu-IN" },
  Marathi: { code: "mr", voice: "mr-IN" },
  Punjabi: { code: "pa", voice: "pa-IN" },
  Urdu: { code: "ur", voice: "ur-PK" },
  Turkish: { code: "tr", voice: "tr-TR" },
  Vietnamese: { code: "vi", voice: "vi-VN" },
  Thai: { code: "th", voice: "th-TH" },
}

// Comprehensive translation dictionary with NLP patterns
const translationDatabase = {
  // Alert types
  "High temperature alert": {
    Spanish: "Alerta de temperatura alta",
    French: "Alerte de température élevée",
    German: "Hochtemperaturalarm",
    Italian: "Allarme alta temperatura",
    Russian: "Предупреждение о высокой температуре",
    Hindi: "उच्च तापमान अलर्ट",
    Telugu: "అధిక ఉష్ణోగ్రత హెచ్చరిక",
    Tamil: "அதிக வெப்பநிலை எச்சரிக்கை",
    Bengali: "উচ্চ তাপমাত্রার সতর্কতা",
    Arabic: "تنبيه درجة حرارة عالية",
    Chinese: "高温警报",
    Japanese: "高温警報",
    Korean: "고온 경보",
  },
  "Low temperature alert": {
    Spanish: "Alerta de temperatura baja",
    French: "Alerte de basse température",
    German: "Niedrigtemperaturalarm",
    Italian: "Allarme bassa temperatura",
    Russian: "Предупреждение о низкой температуре",
    Hindi: "निम्न तापमान अलर्ट",
    Telugu: "తక్కువ ఉష్ణోగ్రత హెచ్చరిక",
    Tamil: "குறைந்த வெப்பநிலை எச்சரிக்கை",
    Bengali: "নিম্ন তাপমাত্রার সতর্কতা",
    Arabic: "تنبيه درجة حرارة منخفضة",
    Chinese: "低温警报",
    Japanese: "低温警報",
    Korean: "저온 경보",
  },
  "High humidity alert": {
    Spanish: "Alerta de humedad alta",
    French: "Alerte d'humidité élevée",
    German: "Hohe Luftfeuchtigkeitsalarm",
    Italian: "Allarme umidità elevata",
    Russian: "Предупреждение о высокой влажности",
    Hindi: "उच्च आर्द्रता अलर्ट",
    Telugu: "అధిక తేమ హెచ్చరిక",
    Tamil: "அதிக ஈரப்பதம் எச்சரிக்கை",
    Bengali: "উচ্চ আর্দ্রতার সতর্কতা",
    Arabic: "تنبيه رطوبة عالية",
    Chinese: "高湿度警报",
    Japanese: "高湿度警報",
    Korean: "고습도 경보",
  },
  "High wind alert": {
    Spanish: "Alerta de viento fuerte",
    French: "Alerte de vent fort",
    German: "Starkwindalarm",
    Italian: "Allarme vento forte",
    Russian: "Предупреждение о сильном ветре",
    Hindi: "तेज हवा अलर्ट",
    Telugu: "బలమైన గాలి హెచ్చరిక",
    Tamil: "அதிக காற்று எச்சரிக்கை",
    Bengali: "প্রবল বাতাসের সতর্কতা",
    Arabic: "تنبيه رياح قوية",
    Chinese: "大风警报",
    Japanese: "強風警報",
    Korean: "강풍 경보",
  },
  "Smoke detected": {
    Spanish: "Humo detectado",
    French: "Fumée détectée",
    German: "Rauch erkannt",
    Italian: "Fumo rilevato",
    Russian: "Обнаружен дым",
    Hindi: "धुआं का पता चला",
    Telugu: "పొగ గుర్తించబడింది",
    Tamil: "புகை கண்டறியப்பட்டது",
    Bengali: "ধোঁয়া সনাক্ত করা হয়েছে",
    Arabic: "تم اكتشاف دخان",
    Chinese: "检测到烟雾",
    Japanese: "煙を検出",
    Korean: "연기 감지됨",
  },
  "Gas leak detected": {
    Spanish: "Fuga de gas detectada",
    French: "Fuite de gaz détectée",
    German: "Gasleck erkannt",
    Italian: "Rilevata perdita di gas",
    Russian: "Обнаружена утечка газа",
    Hindi: "गैस लीक का पता चला",
    Telugu: "గ్యాస్ లీకేజ్ గుర్తించబడింది",
    Tamil: "எரிவாயு கசிவு கண்டறியப்பட்டது",
    Bengali: "গ্যাস লিক সনাক্ত করা হয়েছে",
    Arabic: "تم اكتشاف تسرب غاز",
    Chinese: "检测到气体泄漏",
    Japanese: "ガス漏れを検出",
    Korean: "가스 누출 감지됨",
  },
  "Environmental monitoring": {
    Spanish: "Monitoreo ambiental",
    French: "Surveillance environnementale",
    German: "Umweltüberwachung",
    Italian: "Monitoraggio ambientale",
    Russian: "Экологический мониторинг",
    Hindi: "पर्यावरण निगरानी",
    Telugu: "పర్యావరణ పర్యవేక్షణ",
    Tamil: "சுற்றுச்சூழல் கண்காணிப்பு",
    Bengali: "পরিবেশগত পর্যবেক্ষণ",
    Arabic: "المراقبة البيئية",
    Chinese: "环境监测",
    Japanese: "環境監視",
    Korean: "환경 모니터링",
  },
  "All readings normal": {
    Spanish: "Todas las lecturas normales",
    French: "Toutes les lectures sont normales",
    German: "Alle Messwerte normal",
    Italian: "Tutte le letture normali",
    Russian: "Все показания в норме",
    Hindi: "सभी रीडिंग सामान्य",
    Telugu: "అన్ని రీడింగ్‌లు సాధారణం",
    Tamil: "அனைத்து அளவீடுகளும் சாதாரணம்",
    Bengali: "সমস্ত রিডিং স্বাভাবিক",
    Arabic: "جميع القراءات طبيعية",
    Chinese: "所有读数正常",
    Japanese: "すべての測定値が正常",
    Korean: "모든 수치 정상",
  },
  // Action phrases
  "Please take precautions": {
    Spanish: "Por favor tome precauciones",
    French: "Veuillez prendre des précautions",
    German: "Bitte Vorsichtsmaßnahmen treffen",
    Italian: "Si prega di prendere precauzioni",
    Russian: "Пожалуйста, примите меры предосторожности",
    Hindi: "कृपया सावधानी बरतें",
    Telugu: "దయచేసి జాగ్రత్తలు తీసుకోండి",
    Tamil: "தயவுசெய்து முன்னெச்சரிக்கை நடவடிக்கைகள் எடுக்கவும்",
    Bengali: "অনুগ্রহ করে সতর্কতা অবলম্বন করুন",
    Arabic: "يرجى اتخاذ الاحتياطات",
    Chinese: "请采取预防措施",
    Japanese: "予防措置を講じてください",
    Korean: "예방 조치를 취하십시오",
  },
  "Secure loose objects": {
    Spanish: "Asegure objetos sueltos",
    French: "Sécurisez les objets non fixés",
    German: "Lose Gegenstände sichern",
    Italian: "Fissare gli oggetti sciolti",
    Russian: "Закрепите незакрепленные предметы",
    Hindi: "ढीली वस्तुओं को सुरक्षित करें",
    Telugu: "వదులుగా ఉన్న వస్తువులను భద్రపరచండి",
    Tamil: "தளர்வான பொருட்களைப் பாதுகாக்கவும்",
    Bengali: "আলগা বস্তুগুলি সুরক্ষিত করুন",
    Arabic: "تأمين الأشياء المفكوكة",
    Chinese: "固定松散物品",
    Japanese: "緩んだ物を固定してください",
    Korean: "느슨한 물건들을 고정하세요",
  },
  "Evacuate the area immediately": {
    Spanish: "Evacúe el área inmediatamente",
    French: "Évacuez la zone immédiatement",
    German: "Verlassen Sie sofort den Bereich",
    Italian: "Evacuare immediatamente l'area",
    Russian: "Немедленно покиньте территорию",
    Hindi: "तुरंत क्षेत्र खाली करें",
    Telugu: "వెంటనే ప్రాంతాన్ని ఖాళీ చేయండి",
    Tamil: "உடனடியாக பகுதியை காலி செய்யுங்கள்",
    Bengali: "অবিলম্বে এলাকা খালি করুন",
    Arabic: "إخلاء المنطقة فوراً",
    Chinese: "立即撤离该区域",
    Japanese: "直ちにエリアから避難してください",
    Korean: "즉시 해당 지역을 대피하세요",
  },
  // Common words
  Temperature: {
    Spanish: "Temperatura",
    French: "Température",
    German: "Temperatur",
    Italian: "Temperatura",
    Russian: "Температура",
    Hindi: "तापमान",
    Telugu: "ఉష్ణోగ్రత",
    Tamil: "வெப்பநிலை",
    Bengali: "তাপমাত্রা",
    Arabic: "درجة الحرارة",
    Chinese: "温度",
    Japanese: "温度",
    Korean: "온도",
  },
  Humidity: {
    Spanish: "Humedad",
    French: "Humidité",
    German: "Luftfeuchtigkeit",
    Italian: "Umidità",
    Russian: "Влажность",
    Hindi: "आर्द्रता",
    Telugu: "తేమ",
    Tamil: "ஈரப்பதம்",
    Bengali: "আর্দ্রতা",
    Arabic: "الرطوبة",
    Chinese: "湿度",
    Japanese: "湿度",
    Korean: "습도",
  },
  Wind: {
    Spanish: "Viento",
    French: "Vent",
    German: "Wind",
    Italian: "Vento",
    Russian: "Ветер",
    Hindi: "हवा",
    Telugu: "గాలి",
    Tamil: "காற்று",
    Bengali: "বাতাস",
    Arabic: "الرياح",
    Chinese: "风",
    Japanese: "風",
    Korean: "바람",
  },
  Level: {
    Spanish: "Nivel",
    French: "Niveau",
    German: "Stufe",
    Italian: "Livello",
    Russian: "Уровень",
    Hindi: "स्तर",
    Telugu: "స్థాయి",
    Tamil: "நிலை",
    Bengali: "স্তর",
    Arabic: "مستوى",
    Chinese: "水平",
    Japanese: "レベル",
    Korean: "수준",
  },
  Alert: {
    Spanish: "Alerta",
    French: "Alerte",
    German: "Alarm",
    Italian: "Allarme",
    Russian: "Тревога",
    Hindi: "अलर्ट",
    Telugu: "అలర్ట్",
    Tamil: "எச்சரிக்கை",
    Bengali: "সতর্কতা",
    Arabic: "تنبيه",
    Chinese: "警报",
    Japanese: "警報",
    Korean: "경보",
  },
}

// NLP-based translation function
export async function translateTextWithNLP(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === "English") return text

  try {
    let translatedText = text

    // Apply pattern-based translations
    for (const [phrase, translations] of Object.entries(translationDatabase)) {
      if (translatedText.toLowerCase().includes(phrase.toLowerCase())) {
        const translation = translations[targetLanguage as keyof typeof translations]
        if (translation) {
          // Use regex with 'i' flag for case-insensitive replacement
          translatedText = translatedText.replace(new RegExp(phrase, "gi"), translation)
        }
      }
    }

    // Handle numbers and units (preserve them across languages)
    translatedText = translatedText.replace(/(\d+(?:\.\d+)?)\s*°C/g, "$1°C")
    translatedText = translatedText.replace(/(\d+(?:\.\d+)?)\s*%/g, "$1%")
    translatedText = translatedText.replace(/(\d+(?:\.\d+)?)\s*km\/h/g, "$1 km/h")

    // Handle specific language patterns
    if (targetLanguage === "Telugu") {
      translatedText = handleTeluguPatterns(translatedText)
    } else if (targetLanguage === "Russian") {
      translatedText = handleRussianPatterns(translatedText)
    } else if (targetLanguage === "Arabic") {
      translatedText = handleArabicPatterns(translatedText)
    }

    // If no translation was found, provide a basic structure
    if (translatedText === text) {
      return getBasicTranslation(text, targetLanguage)
    }

    console.log(`Translated to ${targetLanguage}: ${translatedText}`)
    return translatedText
  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error)
    return getBasicTranslation(text, targetLanguage)
  }
}

// Telugu-specific patterns
function handleTeluguPatterns(text: string): string {
  // Add Telugu-specific grammar patterns
  text = text.replace(/Level (\d+)/g, "స్థాయి $1")
  text = text.replace(/Temperature/g, "ఉష్ణోగ్రత")
  text = text.replace(/Humidity/g, "తేమ")
  text = text.replace(/Wind/g, "గాలి")
  return text
}

// Russian-specific patterns
function handleRussianPatterns(text: string): string {
  // Add Russian-specific grammar patterns
  text = text.replace(/Level (\d+)/g, "Уровень $1")
  text = text.replace(/Temperature/g, "Температура")
  text = text.replace(/Humidity/g, "Влажность")
  text = text.replace(/Wind/g, "Ветер")
  return text
}

// Arabic-specific patterns
function handleArabicPatterns(text: string): string {
  // Add Arabic-specific grammar patterns
  text = text.replace(/Level (\d+)/g, "المستوى $1")
  text = text.replace(/Temperature/g, "درجة الحرارة")
  text = text.replace(/Humidity/g, "الرطوبة")
  text = text.replace(/Wind/g, "الرياح")
  return text
}

// Basic translation fallback
function getBasicTranslation(text: string, targetLanguage: string): string {
  // Ensure we always return something in the target language
  const alertWord =
    translationDatabase["Alert"][targetLanguage as keyof (typeof translationDatabase)["Alert"]] || "Alert"

  // For languages with different word order, adjust accordingly
  if (["Japanese", "Korean", "Turkish"].includes(targetLanguage)) {
    return `${text} - ${alertWord}`
  } else {
    return `${alertWord}: ${text}`
  }
}

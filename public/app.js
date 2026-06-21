const app = document.querySelector("#app");

const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself, or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being restless",
  "Thoughts that you would be better off dead or of hurting yourself"
];

const state = {
  user: null,
  view: "dashboard",
  authMode: "login",
  authRole: "user",
  authConsent: false,
  authLoading: false,
  authSuccess: "",
  authDark: false,
  resetSent: false,
  showPassword: false,
  screeningMode: "game",
  mindQuestIndex: 0,
  mindQuestComplete: false,
  classicScreeningComplete: false,
  classicAnswers: [],
  mindQuestWhyOpen: false,
  mindQuestAnswers: {},
  chatOpen: false,
  quickOpen: false,
  language: localStorage.getItem("mindguard-language") || "en",
  completedSteps: JSON.parse(localStorage.getItem("mindguard-completed-steps") || "[]"),
  journalEntries: JSON.parse(localStorage.getItem("mindguard-journal-entries") || "[]"),
  copingUses: JSON.parse(localStorage.getItem("mindguard-coping-uses") || "[]"),
  moodDraft: JSON.parse(localStorage.getItem("mindguard-mood-draft") || "{\"moodScore\":6,\"stressScore\":4,\"sleepQuality\":6,\"energyLevel\":5,\"emotions\":[],\"triggers\":[],\"notes\":\"\",\"saved\":false}"),
  trend: null,
  chat: [],
  latest: {
    screening: null,
    post: null,
    image: null,
    admin: null
  }
};

let moodChart;

const dailyNudges = [
  "Take one steady breath before your next task.",
  "You do not have to solve the whole day at once.",
  "Name the feeling, then name one kind next step.",
  "A small pause can still be real progress.",
  "Let your attention land on what is safe right now.",
  "One gentle action counts.",
  "You are allowed to ask for support."
];

const fallbackWeek = [
  { day: "Mon", date: "Monday", mood: 6, emoji: "🙂", emotion: "calm" },
  { day: "Tue", date: "Tuesday", mood: 5, emoji: "😐", emotion: "tired" },
  { day: "Wed", date: "Wednesday", mood: 7, emoji: "😊", emotion: "hopeful" },
  { day: "Thu", date: "Thursday", mood: 4, emoji: "😟", emotion: "stressed" },
  { day: "Fri", date: "Friday", mood: 6, emoji: "🙂", emotion: "steady" },
  { day: "Sat", date: "Saturday", mood: 8, emoji: "😄", emotion: "positive" },
  { day: "Sun", date: "Sunday", mood: 6, emoji: "🙂", emotion: "balanced" }
];

const languageOptions = [
  { value: "en", label: "English (US)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "hi", label: "हिन्दी" },
  { value: "ar", label: "العربية" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" }
];

const translations = {
  en: {
    brandLine: "Care, reflection, and support",
    authTitle: "Log in / Sign up",
    authHero: "A calm space to check in, reflect on mood patterns, and find supportive next steps when things feel heavy.",
    authDisclaimer: "This app provides supportive insights only. It is not a clinical diagnosis tool.",
    signedIn: "Signed in",
    logout: "Logout",
    login: "Login",
    signup: "Sign up",
    name: "Name",
    email: "Email",
    password: "Password",
    role: "Role",
    createAccount: "Create account",
    sendReset: "Send reset link",
    forgot: "Forgot password / User ID?",
    backLogin: "Back to login",
    disclaimerStrong: "Supportive insight only.",
    disclaimerText: "MindGuard AI is not a medical diagnosis tool and does not replace therapy, counseling, emergency care, or professional medical evaluation.",
    nav: { dashboard: "Dashboard", screening: "Screening", mood: "Mood", posts: "Public Posts", image: "Image Insight", support: "Support", profile: "Profile", admin: "Admin" },
    title: { dashboard: "MindGuard Wellness Dashboard", screening: "PHQ-9 Style Screening", mood: "Daily Mood Check-In", chatbot: "AI Support Companion", posts: "Public Post Analysis", image: "Image Emotional Insight", support: "Patient Support Options", admin: "Admin & Research Dashboard", profile: "Profile & Consent" },
    nudgeTitle: "Today’s gentle nudge",
    nudgeText: "Pause, breathe, and name one thing you need.",
    currentRisk: "Current combined risk",
    averageMood: "7-day average mood",
    supportOptions: "Support options",
    supportOptionsText: "Chat, mood, breathing, journaling, resources",
    moodTrend: "Mood Trend",
    weeklyMoodTrend: "Weekly Mood Trend",
    nextSteps: "Recommended Next Steps",
    nextStepItems: ["Complete today’s mood check-in.", "Use the PHQ-9 style screener weekly, not obsessively.", "Analyze only public posts or content you are authorized to use.", "If anything feels urgent or unsafe, use crisis support immediately."],
    noMood: "No mood check-ins yet.",
    noData: "No data yet",
    calculateRisk: "Calculate supportive risk level",
    phqOptions: ["Not at all", "Several days", "More than half", "Nearly every day"],
    moodScore: "Mood score",
    stressScore: "Stress score",
    sleepQuality: "Sleep quality",
    energyLevel: "Energy level",
    notes: "Notes",
    notesPlaceholder: "A few words about today",
    saveCheckin: "Save check-in",
    botTitle: "MindGuard Bot",
    botSubtitle: "Supportive AI companion",
    botHello: "Hi. I can offer supportive reflections and coping ideas. I am not a diagnosis tool.",
    typeMessage: "Type a message...",
    send: "Send",
    publicNotice: "Analyze publicly available content only. Do not scrape private accounts, bypass login walls, or submit content you are not authorized to use.",
    publicPostText: "Public post text",
    publicPostPlaceholder: "Paste public post text here",
    analyzePost: "Analyze public post",
    imageOrScreenshot: "Image or screenshot",
    visibleText: "Text visible in image",
    visibleTextPlaceholder: "Add any words visible in the screenshot or image",
    visibleTone: "Visible tone",
    neutral: "Neutral",
    sadTone: "Sad / low energy",
    tenseTone: "Tense / distressed",
    analyzeImage: "Analyze image insight",
    breathing: "Breathing Exercise",
    breathingText: "Box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat four times.",
    journaling: "Journaling Prompt",
    journalingText: "What is one feeling you can name without judging it, and what is one small need underneath it?",
    activity: "Positive Activity Planner",
    activityText: "Pick one low-friction action: drink water, step outside, message a trusted person, or tidy one surface.",
    crisis: "Crisis support:",
    crisisText: "If you or someone else may be in immediate danger, call emergency services. In the U.S., call or text 988 for the Suicide & Crisis Lifeline.",
    therapy: "Therapy & Counseling",
    therapyText: "Consider reaching out to a licensed professional, campus counseling center, employee assistance program, or local clinic when symptoms persist or feel severe.",
    community: "Anonymous Community",
    communityText: "Share encouragement and reflection in a moderated, anonymous support space designed around kindness and safety.",
    privacyTitle: "Your Privacy Choices",
    privacyItems: ["You choose whether mood history is used for personalization.", "You choose whether anonymous insights may support research.", "You choose whether high-risk alerts may be visible to support staff.", "You can update these choices anytime."],
    saveProfile: "Save profile",
    resultsHere: "Results will appear here.",
    analysisResult: "Analysis Result",
    totalScore: "Total score",
    sentimentScore: "Sentiment score",
    importantPhrases: "Important phrases",
    imageResultsHere: "Image results will appear here.",
    combinedImage: "Combined Image Insight",
    imageInsightText: "The words and visual cues you shared are combined for supportive insight only.",
    explanation: "Explanation",
    noStrongPhrases: "No strong negative phrases found.",
    risks: { Low: "Low", Moderate: "Moderate", High: "High" }
  }
};

const phraseTranslations = {
  es: {
    brandLine: "Cuidado, reflexión y apoyo",
    authTitle: "Iniciar sesión / Registrarse",
    signedIn: "Sesión iniciada",
    logout: "Salir",
    login: "Iniciar sesión",
    signup: "Registrarse",
    forgot: "¿Olvidaste contraseña / ID?",
    nav: { dashboard: "Panel", screening: "Evaluación", mood: "Ánimo", posts: "Publicaciones", image: "Imagen", support: "Apoyo", profile: "Perfil", admin: "Admin" },
    title: { dashboard: "Panel de Bienestar MindGuard", screening: "Evaluación PHQ-9", mood: "Registro Diario", posts: "Análisis de Publicaciones", image: "Análisis de Imagen", support: "Opciones de Apoyo", admin: "Panel de Investigación", profile: "Perfil y Consentimiento" },
    currentRisk: "Riesgo actual", averageMood: "Ánimo promedio 7 días", supportOptions: "Opciones de apoyo", moodTrend: "Tendencia de ánimo", nextSteps: "Próximos pasos", noData: "Sin datos", noMood: "Aún no hay registros.", calculateRisk: "Calcular nivel de apoyo", saveCheckin: "Guardar registro", send: "Enviar", publicPostText: "Texto público", analyzePost: "Analizar publicación", analyzeImage: "Analizar imagen", breathing: "Respiración", journaling: "Diario", activity: "Actividad positiva", privacyTitle: "Tus opciones de privacidad", resultsHere: "Los resultados aparecerán aquí.", analysisResult: "Resultado", risks: { Low: "Bajo", Moderate: "Moderado", High: "Alto" }
  },
  fr: {
    brandLine: "Soin, réflexion et soutien",
    authTitle: "Connexion / Inscription",
    signedIn: "Connecté",
    logout: "Déconnexion",
    login: "Connexion",
    signup: "Inscription",
    forgot: "Mot de passe / ID oublié ?",
    nav: { dashboard: "Tableau", screening: "Dépistage", mood: "Humeur", posts: "Publications", image: "Image", support: "Soutien", profile: "Profil", admin: "Admin" },
    title: { dashboard: "Tableau Bien-être MindGuard", screening: "Dépistage PHQ-9", mood: "Point quotidien", posts: "Analyse de publication", image: "Analyse d’image", support: "Options de soutien", admin: "Tableau recherche", profile: "Profil et consentement" },
    currentRisk: "Risque actuel", averageMood: "Humeur moyenne 7 jours", supportOptions: "Options de soutien", moodTrend: "Tendance d’humeur", nextSteps: "Prochaines étapes", noData: "Aucune donnée", noMood: "Aucun point d’humeur.", calculateRisk: "Calculer le niveau", saveCheckin: "Enregistrer", send: "Envoyer", publicPostText: "Texte public", analyzePost: "Analyser", analyzeImage: "Analyser l’image", breathing: "Respiration", journaling: "Journal", activity: "Activité positive", privacyTitle: "Vos choix de confidentialité", resultsHere: "Les résultats apparaîtront ici.", analysisResult: "Résultat", risks: { Low: "Faible", Moderate: "Modéré", High: "Élevé" }
  },
  hi: {
    brandLine: "देखभाल, चिंतन और सहयोग",
    authTitle: "लॉग इन / साइन अप",
    signedIn: "साइन इन",
    logout: "लॉग आउट",
    login: "लॉग इन",
    signup: "साइन अप",
    forgot: "पासवर्ड / यूज़र ID भूल गए?",
    nav: { dashboard: "डैशबोर्ड", screening: "स्क्रीनिंग", mood: "मूड", posts: "पोस्ट", image: "इमेज", support: "सहयोग", profile: "प्रोफ़ाइल", admin: "एडमिन" },
    title: { dashboard: "MindGuard वेलनेस डैशबोर्ड", screening: "PHQ-9 स्क्रीनिंग", mood: "दैनिक मूड चेक-इन", posts: "पोस्ट विश्लेषण", image: "इमेज विश्लेषण", support: "सहयोग विकल्प", admin: "रिसर्च डैशबोर्ड", profile: "प्रोफ़ाइल और सहमति" },
    currentRisk: "वर्तमान जोखिम", averageMood: "7-दिन औसत मूड", supportOptions: "सहयोग विकल्प", moodTrend: "मूड ट्रेंड", nextSteps: "अगले कदम", noData: "डेटा नहीं", noMood: "अभी कोई मूड चेक-इन नहीं.", calculateRisk: "सहयोग स्तर निकालें", saveCheckin: "सेव करें", send: "भेजें", publicPostText: "सार्वजनिक पोस्ट टेक्स्ट", analyzePost: "पोस्ट विश्लेषण", analyzeImage: "इमेज विश्लेषण", breathing: "सांस अभ्यास", journaling: "जर्नल संकेत", activity: "सकारात्मक गतिविधि", privacyTitle: "आपकी गोपनीयता", resultsHere: "परिणाम यहाँ दिखेंगे.", analysisResult: "परिणाम", risks: { Low: "कम", Moderate: "मध्यम", High: "उच्च" }
  },
  ar: {
    brandLine: "رعاية وتأمل ودعم",
    authTitle: "تسجيل الدخول / إنشاء حساب",
    signedIn: "تم تسجيل الدخول",
    logout: "خروج",
    login: "دخول",
    signup: "إنشاء حساب",
    forgot: "نسيت كلمة المرور / المعرّف؟",
    nav: { dashboard: "الرئيسية", screening: "الفحص", mood: "المزاج", posts: "المنشورات", image: "الصورة", support: "الدعم", profile: "الملف", admin: "الإدارة" },
    title: { dashboard: "لوحة العافية MindGuard", screening: "فحص PHQ-9", mood: "تسجيل المزاج اليومي", posts: "تحليل المنشورات", image: "تحليل الصورة", support: "خيارات الدعم", admin: "لوحة البحث", profile: "الملف والموافقة" },
    currentRisk: "المستوى الحالي", averageMood: "متوسط 7 أيام", supportOptions: "خيارات الدعم", moodTrend: "اتجاه المزاج", nextSteps: "الخطوات التالية", noData: "لا توجد بيانات", noMood: "لا توجد تسجيلات بعد.", calculateRisk: "احسب مستوى الدعم", saveCheckin: "حفظ", send: "إرسال", publicPostText: "نص منشور عام", analyzePost: "تحليل المنشور", analyzeImage: "تحليل الصورة", breathing: "تمرين التنفس", journaling: "مذكرة", activity: "نشاط إيجابي", privacyTitle: "خيارات الخصوصية", resultsHere: "ستظهر النتائج هنا.", analysisResult: "النتيجة", risks: { Low: "منخفض", Moderate: "متوسط", High: "مرتفع" }
  },
  zh: {
    brandLine: "关怀、反思与支持",
    authTitle: "登录 / 注册",
    signedIn: "已登录",
    logout: "退出",
    login: "登录",
    signup: "注册",
    forgot: "忘记密码 / 用户ID？",
    nav: { dashboard: "仪表盘", screening: "筛查", mood: "心情", posts: "公开帖子", image: "图像", support: "支持", profile: "个人资料", admin: "管理" },
    title: { dashboard: "MindGuard 健康仪表盘", screening: "PHQ-9 筛查", mood: "每日心情记录", posts: "公开帖子分析", image: "图像情绪分析", support: "支持选项", admin: "研究仪表盘", profile: "资料与同意" },
    currentRisk: "当前风险", averageMood: "7天平均心情", supportOptions: "支持选项", moodTrend: "心情趋势", nextSteps: "建议下一步", noData: "暂无数据", noMood: "暂无心情记录。", calculateRisk: "计算支持等级", saveCheckin: "保存记录", send: "发送", publicPostText: "公开帖子文本", analyzePost: "分析帖子", analyzeImage: "分析图像", breathing: "呼吸练习", journaling: "日记提示", activity: "积极活动", privacyTitle: "隐私选择", resultsHere: "结果将显示在这里。", analysisResult: "分析结果", risks: { Low: "低", Moderate: "中等", High: "高" }
  },
  ja: {
    brandLine: "ケア、振り返り、サポート",
    authTitle: "ログイン / 登録",
    signedIn: "サインイン中",
    logout: "ログアウト",
    login: "ログイン",
    signup: "登録",
    forgot: "パスワード / IDを忘れた？",
    nav: { dashboard: "ダッシュボード", screening: "チェック", mood: "気分", posts: "公開投稿", image: "画像", support: "サポート", profile: "プロフィール", admin: "管理" },
    title: { dashboard: "MindGuard ウェルネス", screening: "PHQ-9 チェック", mood: "毎日の気分チェック", posts: "公開投稿分析", image: "画像分析", support: "サポート options", admin: "研究ダッシュボード", profile: "プロフィールと同意" },
    currentRisk: "現在のリスク", averageMood: "7日平均の気分", supportOptions: "サポート", moodTrend: "気分の傾向", nextSteps: "次のステップ", noData: "データなし", noMood: "気分チェックはまだありません。", calculateRisk: "サポートレベルを計算", saveCheckin: "保存", send: "送信", publicPostText: "公開投稿テキスト", analyzePost: "投稿を分析", analyzeImage: "画像を分析", breathing: "呼吸法", journaling: "日記プロンプト", activity: "前向きな活動", privacyTitle: "プライバシー設定", resultsHere: "結果はここに表示されます。", analysisResult: "分析結果", risks: { Low: "低", Moderate: "中", High: "高" }
  }
};

for (const [language, values] of Object.entries(phraseTranslations)) {
  translations[language] = deepMerge(translations.en, values);
}

function deepMerge(base, override) {
  const merged = structuredClone(base);
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value)) merged[key] = deepMerge(base[key] || {}, value);
    else merged[key] = value;
  }
  return merged;
}

function t(path) {
  return path.split(".").reduce((value, key) => value?.[key], translations[state.language]) ?? path.split(".").reduce((value, key) => value?.[key], translations.en) ?? path;
}

function riskLabel(value) {
  return t(`risks.${value}`) || value;
}

function weeklyMoodData() {
  const saved = state.trend?.points || [];
  if (!saved.length) return fallbackWeek;
  const merged = [...fallbackWeek];
  saved.slice(-7).forEach((point, index) => {
    const slot = Math.max(0, merged.length - saved.slice(-7).length + index);
    merged[slot] = {
      ...merged[slot],
      mood: Number(point.mood || merged[slot].mood),
      emoji: Number(point.mood || 0) >= 7 ? "😊" : Number(point.mood || 0) >= 5 ? "🙂" : "😟",
      emotion: Number(point.mood || 0) >= 7 ? "positive" : Number(point.mood || 0) >= 5 ? "steady" : "strained"
    };
  });
  return merged;
}

function greeting() {
  const hour = new Date().getHours();
  const name = (state.user?.name || "there").split(" ")[0];
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function nudgeForToday() {
  const dayIndex = Math.floor(Date.now() / 86400000) % dailyNudges.length;
  return dailyNudges[dayIndex];
}

function streakDays() {
  return Math.max(1, Math.min(7, state.trend?.points?.length || 4));
}

function dashboardInsights(week) {
  const best = week.reduce((top, item) => (item.mood > top.mood ? item : top), week[0]);
  const hardest = week.reduce((low, item) => (item.mood < low.mood ? item : low), week[0]);
  const emotionCounts = week.reduce((counts, item) => {
    counts[item.emotion] = (counts[item.emotion] || 0) + 1;
    return counts;
  }, {});
  const commonEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "steady";
  const riskTrend = week.at(-1).mood >= week[0].mood ? "Improving" : "Needs attention";
  return { best, hardest, commonEmotion, riskTrend };
}

function todayMoodLog(week) {
  const today = week.at(-1);
  const hasCheckin = Boolean(state.trend?.points?.length);
  return {
    hasCheckin,
    score: today?.mood || 0,
    emoji: today?.emoji || "🙂",
    time: hasCheckin ? new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""
  };
}

function weeklyJournalSummary() {
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const entries = state.journalEntries.filter((entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo);
  const last = entries.at(-1);
  return {
    count: entries.length,
    preview: last?.text ? last.text.slice(0, 72) : "Write a short reflection to start your weekly journal."
  };
}

function copingToolsUsed() {
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  return state.copingUses.filter((item) => new Date(item.createdAt).getTime() >= sevenDaysAgo).length;
}

function sleepQualityAverage(week) {
  const saved = state.trend?.points?.filter((point) => Number(point.sleepQuality)) || [];
  const values = saved.length ? saved.map((point) => Number(point.sleepQuality)) : week.map((item) => Math.max(4, Math.min(9, item.mood + (item.mood > 5 ? 1 : 0))));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(average.toFixed(1));
}

function advancedDashboardCards(week) {
  const journalThisWeek = weeklyJournalSummary();
  const copingCount = copingToolsUsed();
  const avgMood = week.reduce((sum, item) => sum + item.mood, 0) / week.length;
  const commonEmotion = dashboardInsights(week).commonEmotion;
  const chatThisWeek = state.chat.filter((item) => item.sender === "user").length;
  const lastChat = state.chat.filter((item) => item.sender === "user").at(-1);
  const positiveEntries = state.journalEntries.filter((entry) => /grateful|good|better|happy|hope|proud|calm|positive|thank/i.test(entry.text)).length;
  const wellnessScore = Math.max(0, Math.min(100, Math.round(avgMood * 7 + streakDays() * 3 + copingCount * 4 + Math.min(journalThisWeek.count, 5) * 3)));
  return [
    {
      title: "PHQ-9 score trend",
      value: state.latest.screening ? `${state.latest.screening.totalScore}/27` : "Not taken",
      detail: state.latest.screening ? `Last screening: ${new Date(state.latest.screening.createdAt).toLocaleDateString()}` : "Start a screening to see trend."
    },
    {
      title: "Emotional pattern",
      value: `${week.find((item) => item.emotion === commonEmotion)?.emoji || "🙂"} ${commonEmotion}`,
      detail: `Appeared ${week.filter((item) => item.emotion === commonEmotion).length} of 7 days.`
    },
    {
      title: "AI chat sessions",
      value: chatThisWeek,
      detail: lastChat ? `Last chat: ${new Date(lastChat.createdAt).toLocaleDateString()}` : "No support chats this week."
    },
    {
      title: "Crisis readiness",
      value: copingCount > 0 ? "All clear" : "Check in",
      detail: copingCount > 0 ? "You have used a support tool recently." : "Review crisis resources once this week."
    },
    {
      title: "Weekly progress score",
      value: `${wellnessScore}/100`,
      detail: "Based on mood, check-ins, coping tools, and journaling."
    },
    {
      title: "Peer support",
      value: "42 checked in",
      detail: "Anonymous community activity today."
    },
    {
      title: "Next screening due",
      value: "Due in 3 days",
      detail: "Weekly screening is usually enough for reflection."
    },
    {
      title: "Positive moments logged",
      value: positiveEntries,
      detail: "Journal entries with gratitude or positive language."
    }
  ];
}

function urgentNextAction(risk) {
  if (risk === "High") {
    return {
      title: "Talk to AI now",
      description: "Your recent signals suggest immediate support may help.",
      action: "chat",
      button: "Start chat"
    };
  }
  if (risk === "Moderate") {
    return {
      title: "Try a breathing reset",
      description: "Take two minutes to steady your body and attention.",
      action: "breathing",
      button: "Begin"
    };
  }
  return {
    title: "Log today’s mood",
    description: "Keep your weekly pattern accurate with a quick check-in.",
    action: "mood",
    button: "Log now"
  };
}

const emotionOptions = ["😰 Anxious", "😢 Sad", "😤 Frustrated", "😴 Tired", "😶 Numb", "😟 Worried", "😌 Calm", "🙂 Content", "💪 Motivated", "🤩 Excited", "🥰 Grateful", "😎 Confident"];
const triggerOptions = ["😴 Poor sleep", "💼 Work stress", "👥 Social interaction", "🏃 Exercise", "🍎 Nutrition", "💊 Medication", "🌧️ Weather", "📱 Social media", "👨‍👩‍👧 Family", "💰 Finances", "🎯 Achievement", "🤝 Helped someone"];
const notePlaceholders = ["What made today feel this way?", "One word that describes today:", "What do you need right now?"];

function moodEmoji(value) {
  if (value <= 2) return "😔";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "🙂";
  return "😊";
}

function sliderTone(type, value) {
  const highBad = type === "stressScore";
  if (highBad) return value < 4 ? "green" : value <= 6 ? "amber" : "red";
  return value < 4 ? "red" : value <= 6 ? "amber" : "green";
}

function wellnessScore(draft = state.moodDraft) {
  const invertedStress = 11 - Number(draft.stressScore || 0);
  return Math.round(((Number(draft.moodScore) + invertedStress + Number(draft.sleepQuality) + Number(draft.energyLevel)) / 40) * 100);
}

function dominantCluster(draft = state.moodDraft) {
  const joined = draft.emotions.join(" ").toLowerCase();
  if (/anxious|worried/.test(joined) || draft.stressScore > 6) return "Anxiety signals";
  if (/tired|numb/.test(joined) || draft.energyLevel < 4) return "Fatigue pattern";
  if (/sad|frustrated/.test(joined) || draft.moodScore < 5) return "Low mood pattern";
  return "Resilience pattern";
}

function copingSuggestion(draft = state.moodDraft) {
  if (draft.stressScore > 6) return "Try a 60-second grounding reset: feet down, slow exhale, name five things you see.";
  if (draft.sleepQuality < 5) return "Protect tonight’s wind-down with a low-light, no-phone 10 minute buffer.";
  if (draft.energyLevel < 5) return "Choose one low-effort task and one recovery action instead of pushing through everything.";
  return "Keep the momentum gentle: note one thing that helped today and repeat it tomorrow.";
}

function weeklyMultiData() {
  return weeklyMoodData().map((item, index) => ({
    ...item,
    stress: [4, 6, 5, 7, 4, 3, 5][index],
    sleep: [7, 5, 6, 4, 7, 8, 6][index],
    energy: [6, 5, 7, 4, 6, 8, 6][index]
  }));
}

function mindQuestQuests() {
  return [
    {
      name: "Energy Garden",
      icon: "🌱",
      domain: "PHQ-9 · Interest & pleasure",
      insight: "This looks at reduced interest or pleasure, a common depression-related signal.",
      detail: "Choose the plant that matches your energy and interest lately.",
      field: "q0",
      bar: "Energy",
      options: [
        ["Blooming", 0, "I still enjoy things often."],
        ["A little dry", 1, "Some activities feel less fun."],
        ["Wilting", 2, "Most things feel hard to enjoy."],
        ["Bare soil", 3, "Almost nothing feels interesting."]
      ]
    },
    {
      name: "Weather Map",
      icon: "☁️",
      domain: "PHQ-9 · Mood",
      insight: "This checks for low mood, sadness, or hopelessness signals.",
      detail: "Pick the sky that matches your emotional weather.",
      field: "q1",
      bar: "Mood",
      options: [["Clear", 0, "Mostly steady."], ["Cloudy", 1, "Some low days."], ["Rainy", 2, "Many sad or hopeless days."], ["Storm", 3, "Almost every day feels very low."]]
    },
    {
      name: "Sleep Sky",
      icon: "🌙",
      domain: "PHQ-9 · Sleep",
      insight: "Sleep disruption can affect mood, anxiety, and energy.",
      detail: "Match the moon to your sleep rhythm.",
      field: "q2",
      bar: "Sleep",
      options: [["Rested", 0, "Sleep feels okay."], ["Uneven", 1, "Some restless nights."], ["Broken", 2, "Sleep is often difficult."], ["Lost night", 3, "Sleep feels disrupted most days."]]
    },
    {
      name: "Battery Level",
      icon: "🔋",
      domain: "PHQ-9 · Energy",
      insight: "Low energy or fatigue can be a depression or stress-related signal.",
      detail: "Choose your usual body battery.",
      field: "q3",
      bar: "Energy",
      options: [["Charged", 0, "Enough energy."], ["Half", 1, "Energy dips sometimes."], ["Low", 2, "Often tired."], ["Empty", 3, "Exhausted most days."]]
    },
    {
      name: "Thought Clouds",
      icon: "💭",
      domain: "PHQ-9 · Self-perception",
      insight: "This looks at self-blame, guilt, or worthlessness signals.",
      detail: "Pick how thoughts about yourself have felt.",
      field: "q5",
      bar: "Mood",
      options: [["Kind", 0, "Mostly fair to myself."], ["Critical", 1, "Some self-blame."], ["Heavy", 2, "Often feel like I failed."], ["Crushing", 3, "Worthless feelings most days."]]
    },
    {
      name: "Focus Trail",
      icon: "🧭",
      domain: "PHQ-9 · Concentration",
      insight: "Difficulty focusing can appear with depression, anxiety, stress, or poor sleep.",
      detail: "Choose how easy it is to stay on the path.",
      field: "q6",
      bar: "Focus",
      options: [["Clear path", 0, "Focus is okay."], ["Distracted", 1, "Some concentration trouble."], ["Foggy", 2, "Often hard to focus."], ["Lost", 3, "Almost always hard to focus."]]
    },
    {
      name: "Calm Meter",
      icon: "🫁",
      domain: "PHQ-9 · Movement & anxiety cues",
      insight: "Restlessness, tension, or slowed movement can point to stress or anxiety-related patterns.",
      detail: "This helps flag anxiety and stress signals.",
      field: "q7",
      bar: "Focus",
      options: [["Calm", 0, "Body feels mostly settled."], ["Tense", 1, "Some restlessness or worry."], ["On edge", 2, "Often tense or slowed down."], ["Overloaded", 3, "Very restless, tense, or slowed most days."]]
    },
    {
      name: "Hope Lantern",
      icon: "🕯️",
      domain: "PHQ-9 · Safety & hope",
      insight: "This asks about safety and hopelessness so support resources can appear quickly if needed.",
      detail: "Choose the lantern that best fits safety and hope.",
      field: "q8",
      bar: "Mood",
      options: [["Bright", 0, "I feel safe with myself."], ["Dim", 1, "Hope has felt harder to hold."], ["Flickering", 2, "I need extra support soon."], ["Urgent", 3, "I may need immediate support."]]
    }
  ];
}

function mindQuestAnswersArray() {
  return phq9Questions.map((_, index) => Number(state.mindQuestAnswers[`q${index}`] || 0));
}

function signalFromAnswers(answers) {
  const total = answers.reduce((sum, value) => sum + Number(value || 0), 0);
  if (total >= 20 || Number(answers[8] || 0) > 0) return "High";
  if (total >= 10) return "Moderate";
  return "Low";
}

function mindQuestSignal() {
  const answered = Object.keys(state.mindQuestAnswers).length;
  const total = Object.values(state.mindQuestAnswers).reduce((sum, value) => sum + Number(value || 0), 0);
  if (!answered) return "Low";
  const projected = (total / answered) * 9;
  if (projected >= 15 || Number(state.mindQuestAnswers.q8 || 0) > 0) return "High";
  if (projected >= 8) return "Moderate";
  return "Low";
}

function screeningCompletionCard({ signal, answers, title = "Screening complete", subtitle = "This is a supportive insight, not a PHQ-9 clinical score." }) {
  const energy = Math.min(100, ((answers[0] + answers[3]) / 6) * 100);
  const mood = Math.min(100, ((answers[1] + answers[5] + answers[8]) / 9) * 100);
  const sleep = Math.min(100, (answers[2] / 3) * 100);
  const focus = Math.min(100, ((answers[6] + answers[7]) / 6) * 100);
  return `
    <section class="panel full quest-complete">
      <div class="complete-check">✓</div>
      <h3>${title}</h3>
      <span class="pill ${riskClass(signal)}">${signal}</span>
      <p>${subtitle}</p>
      <div class="domain-bars">
        ${[["Energy", energy], ["Mood", mood], ["Sleep", sleep], ["Focus", focus]].map(([label, value]) => `<div><span>${label}</span><b><i style="width:${value}%"></i></b></div>`).join("")}
      </div>
      <form id="screeningSaveForm" class="actions">
        ${answers.map((value, idx) => `<input type="hidden" name="q${idx}" value="${value}" />`).join("")}
        <button class="btn" type="button" data-quick="chat">Talk to AI about my results</button>
        <button class="btn secondary">Save to my wellness history</button>
      </form>
    </section>
  `;
}

function nextStepItems() {
  return [
    {
      id: "mood",
      urgency: "routine",
      icon: icons.mood,
      title: "Log today’s mood",
      description: "Capture a quick check-in so your weekly pattern stays useful.",
      action: "Do this now →"
    },
    {
      id: "screen",
      urgency: "suggested",
      icon: icons.screening,
      title: "Complete a short screening",
      description: "Use the PHQ-9 style check to reflect on recent symptoms.",
      action: "Do this now →"
    },
    {
      id: "post",
      urgency: "routine",
      icon: icons.posts,
      title: "Review public text safely",
      description: "Analyze only posts or content you are authorized to use.",
      action: "Do this now →"
    },
    {
      id: "crisis",
      urgency: "urgent",
      icon: icons.support,
      title: "Keep crisis support close",
      description: "If anything feels urgent or unsafe, contact support immediately.",
      action: "Do this now →"
    }
  ];
}

const icons = {
  dashboard: `<svg viewBox="0 0 24 24"><path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z"/></svg>`,
  screening: `<svg viewBox="0 0 24 24"><path d="M9.5 16.2 5.8 12.5 4.4 13.9l5.1 5.1L20.2 8.3l-1.4-1.4-9.3 9.3Z"/><path d="M5 3h14a2 2 0 0 1 2 2v5h-2V5H5v14h8v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/></svg>`,
  mood: `<svg viewBox="0 0 24 24"><path d="M4 18h16v2H4v-2Zm1-3 4.2-4.2 3 3L18.5 7H15V5h7v7h-2V8.4l-7.8 8.4-3-3L6.4 16 5 15Z"/></svg>`,
  posts: `<svg viewBox="0 0 24 24"><path d="M4 4h16v12H7.2L4 19.2V4Zm2 2v8.4l.4-.4H18V6H6Zm2 3h8v2H8V9Zm0 3h6v2H8v-2Z"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 14h14v-3.1l-3.1-3.1-3.7 4.4-2.5-2.8L5 18Zm0-2.9 4.9-4.9 2.2 2.5 3.6-4.3L19 11.7V6H5v9.1ZM8.5 9.5A1.5 1.5 0 1 1 8.5 6a1.5 1.5 0 0 1 0 3.5Z"/></svg>`,
  support: `<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.4-9A5.6 5.6 0 0 1 12 5.7 5.6 5.6 0 0 1 21.4 12C19 16.6 12 21 12 21Zm-1-11v3H8v2h3v3h2v-3h3v-2h-3v-3h-2Z"/></svg>`,
  admin: `<svg viewBox="0 0 24 24"><path d="M12 2 4 5.5v6c0 5 3.4 9.7 8 10.5 4.6-.8 8-5.5 8-10.5v-6L12 2Zm0 2.2 6 2.6v4.7c0 3.8-2.4 7.4-6 8.3-3.6-.9-6-4.5-6-8.3V6.8l6-2.6Zm-1 11.3 5-5-1.4-1.4-3.6 3.6-1.6-1.6L8 12.5l3 3Z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.1-8 4.8V21h16v-2.2C20 16.1 16.4 14 12 14Z"/></svg>`
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function init() {
  try {
    const { user } = await api("/api/auth/me");
    state.user = user;
    if (user) {
      await refreshTrend();
      await refreshChat();
      if (["admin", "counselor", "researcher"].includes(user.role)) await refreshAdmin();
    }
  } catch {
    state.user = null;
  }
  render();
}

function setView(view) {
  state.view = view;
  render();
}

function riskClass(value = "") {
  return value.toLowerCase();
}

function disclaimer() {
  return `<div class="notice"><strong>${t("disclaimerStrong")}</strong> ${t("disclaimerText")}</div>`;
}

function motionDisclaimer() {
  const text = `${t("disclaimerStrong")} ${t("disclaimerText")}`;
  const content = `<strong>${escapeHtml(t("disclaimerStrong"))}</strong>&nbsp;&nbsp;${escapeHtml(t("disclaimerText"))}`;
  return `
    <div class="motion-disclaimer" aria-label="${escapeAttr(text)}">
      <div class="motion-track">
        <span>${content}</span>
        <span>${content}</span>
      </div>
    </div>
  `;
}

function render() {
  if (!state.user) return renderAuth();
  applyLanguageMeta();

  const navItems = [
    ["dashboard", t("nav.dashboard")],
    ["screening", t("nav.screening")],
    ["mood", t("nav.mood")],
    ["posts", t("nav.posts")],
    ["image", t("nav.image")],
    ["support", t("nav.support")],
    ["profile", t("nav.profile")]
  ];
  if (["admin", "counselor", "researcher"].includes(state.user.role)) navItems.push(["admin", t("nav.admin")]);

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="mark">MG</div>
          <div>
            <h1>MindGuard AI</h1>
            <p>${t("brandLine")}</p>
          </div>
        </div>
        <nav class="nav">
          ${navItems
            .map(
              ([key, label]) =>
                `<button class="${state.view === key ? "active" : ""}" data-view="${key}"><span class="nav-icon">${icons[key]}</span>${label}</button>`
            )
            .join("")}
        </nav>
        <div class="sidebar-card">
          <strong>${t("nudgeTitle")}</strong>
          <p>${nudgeForToday()}</p>
        </div>
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${escapeHtml((state.user.name || "U").slice(0, 1).toUpperCase())}</div>
          <div>
            <strong>${escapeHtml(state.user.name || "User")}</strong>
            <p>${escapeHtml(state.user.role || "user")}</p>
          </div>
          <button class="btn secondary sidebar-logout" id="logout">${t("logout")}</button>
        </div>
      </aside>
      <main class="main">
        ${motionDisclaimer()}
        <div class="topbar">
          <div>
            <h2>${titleForView()}</h2>
          </div>
          <div class="userbox">
            ${languageSelect()}
          </div>
        </div>
        ${contentForView()}
      </main>
      ${quickActions()}
      ${floatingChat()}
    </div>
  `;

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelector("#logout").addEventListener("click", logout);
  bindLanguage();
  document.querySelector("#chatFab")?.addEventListener("click", () => {
    state.chatOpen = !state.chatOpen;
    render();
  });
  document.querySelector("#floatingChatForm")?.addEventListener("submit", submitChat);
  document.querySelector("#quickFab")?.addEventListener("click", () => {
    state.quickOpen = !state.quickOpen;
    render();
  });
  document.querySelectorAll("[data-quick]").forEach((button) => {
    button.addEventListener("click", () => handleQuickAction(button.dataset.quick));
  });
  document.querySelectorAll("[data-step]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => toggleStep(checkbox.dataset.step));
  });
  document.querySelectorAll("[data-screening-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.screeningMode = button.dataset.screeningMode;
      if (state.screeningMode === "qa") state.classicScreeningComplete = false;
      if (state.screeningMode === "game") state.mindQuestComplete = false;
      render();
    });
  });
  document.querySelectorAll("[data-quest-option]").forEach((input) => {
    input.addEventListener("change", () => {
      state.mindQuestAnswers[input.name] = Number(input.value);
      render();
    });
  });
  document.querySelectorAll("[data-quest-select]").forEach((card) => {
    const selectCard = () => {
      state.mindQuestAnswers[card.dataset.field] = Number(card.dataset.value);
      render();
    };
    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCard();
      }
    });
  });
  document.querySelector("[data-quest-prev]")?.addEventListener("click", () => {
    state.mindQuestIndex = Math.max(0, state.mindQuestIndex - 1);
    state.mindQuestWhyOpen = false;
    render();
  });
  const goNextQuest = () => {
    const quests = mindQuestQuests();
    const current = quests[state.mindQuestIndex];
    if (state.mindQuestAnswers[current.field] === undefined) return;
    if (state.mindQuestIndex >= quests.length - 1) state.mindQuestComplete = true;
    else state.mindQuestIndex += 1;
    state.mindQuestWhyOpen = false;
    render();
  };
  document.querySelector("[data-quest-next]")?.addEventListener("click", goNextQuest);
  document.querySelector(".quest-next-zone")?.addEventListener("click", goNextQuest);
  document.querySelector(".quest-next-zone")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goNextQuest();
    }
  });
  document.querySelectorAll("[data-quest-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mindQuestIndex = Number(button.dataset.questJump);
      state.mindQuestWhyOpen = false;
      render();
    });
  });
  document.querySelector("[data-why-toggle]")?.addEventListener("click", () => {
    state.mindQuestWhyOpen = !state.mindQuestWhyOpen;
    render();
  });
  document.querySelector("[data-quest-reset]")?.addEventListener("click", () => {
    state.mindQuestIndex = 0;
    state.mindQuestComplete = false;
    state.mindQuestWhyOpen = false;
    state.mindQuestAnswers = {};
    render();
  });
  document.querySelector("#screeningSaveForm")?.addEventListener("submit", submitMindQuest);
  bindMoodInteractions();
  bindCurrentView();
  renderMoodChart();
}

function renderAuth() {
  applyLanguageMeta();
  const isSignup = state.authMode === "signup";
  const isReset = state.authMode === "forgot";
  const isGuest = state.authMode === "guest";
  const greeting = isSignup ? "Let’s get started 🌱" : isReset ? "Reset password" : "Welcome back 👋";
  const authSwitchPrompt = isSignup
    ? `<p class="auth-switch-copy">Already have an account? <button type="button" data-auth="login">Sign in →</button></p>`
    : isReset || isGuest
      ? ""
      : `<p class="auth-switch-copy">Don’t have an account? <button type="button" data-auth="signup">Sign up →</button></p>`;
  app.innerHTML = `
    <main class="auth redesigned-auth ${state.authDark ? "auth-dark" : ""}">
      <div class="auth-language-floating">${languageSelect()}</div>
      <button class="auth-theme-toggle" type="button" data-theme-toggle aria-label="Toggle dark mode">${state.authDark ? "☀" : "◐"}</button>
      <section class="auth-card auth-shell ${state.authSuccess ? "auth-fading" : ""}">
        <div class="auth-hero auth-story-panel">
          <div class="neural-bg" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="mood-particles" aria-hidden="true">
            <i>🙂</i><i>🌿</i><i>💭</i><i>✨</i><i>🫶</i>
          </div>
          <div class="auth-editorial-top">
            <div class="auth-wordmark"><span class="shield-logo" aria-hidden="true">🛡️</span><strong><span>MindGuard</span> <em>AI</em></strong></div>
          </div>
          <div class="auth-hero-copy">
            <div class="ai-brain" aria-hidden="true"><span></span><span></span><span></span><strong>AI</strong></div>
            <p class="auth-kicker">AI-powered mental wellness platform</p>
            <h1>Detect Patterns. Support Wellbeing.</h1>
            <p class="auth-tagline">Multimodal AI for mood insights, emotional wellness, and early support.</p>
            <div class="auth-feature-list" aria-label="MindGuard feature highlights">
              <div><span>🧠</span><p><strong>Depression Screening</strong><small>supportive, non-clinical signals</small></p></div>
              <div><span>🤖</span><p><strong>AI Mental Health Companion</strong><small>empathetic support anytime</small></p></div>
              <div><span>📊</span><p><strong>Mood Analytics Dashboard</strong><small>weekly patterns and trends</small></p></div>
              <div><span>🖼️</span><p><strong>Text + Image Emotion Analysis</strong><small>multimodal wellness context</small></p></div>
              <div><span>🔒</span><p><strong>Privacy First</strong><small>consent-based data use</small></p></div>
            </div>
            <div class="auth-stat-row" aria-label="MindGuard platform statistics">
              <span><strong>250K+</strong><small>Posts Analyzed</small></span>
              <span><strong>95%</strong><small>Detection Accuracy</small></span>
              <span><strong>24/7</strong><small>AI Support</small></span>
            </div>
            <div class="auth-proof-row" aria-label="MindGuard care standards">
              <span>🔒 Private by design</span>
              <span>⚕️ Non-clinical</span>
              <span>📞 Crisis resources ready</span>
            </div>
          </div>
          <div class="floating-insight-card card-mood"><small>Mood score</small><strong>7.8</strong><span>Stable today</span></div>
          <div class="floating-insight-card card-trend"><small>Weekly trend</small><strong>↑ 12%</strong><span>Improving</span></div>
          <div class="floating-insight-card card-ai"><small>AI insight</small><strong>Calm pattern</strong><span>Sleep helped mood</span></div>
          <p class="auth-panel-disclaimer">Not a substitute for professional mental health care.</p>
        </div>

        <div class="auth-form auth-form-panel">
          ${state.authSuccess ? `<div class="auth-success-flash">${state.authSuccess}</div>` : ""}
          ${state.resetSent ? `<div class="auth-reset-success">Check your email for a reset link.</div>` : ""}
          <div class="mobile-auth-brand"><div class="shield-logo">🛡️</div><strong>MindGuard AI</strong></div>
          <div class="mobile-feature-chips"><span>🔒 Private</span><span>⚕️ Non-clinical</span><span>📞 Crisis ready</span></div>
          <div class="auth-card-brand">
            <div class="auth-card-logo"><span class="shield-logo">🛡️</span><div><strong>MindGuard AI</strong><small>AI-Powered Mental Wellness Platform</small></div></div>
            <div class="auth-secure-pill">HIPAA-inspired privacy · supportive insight only</div>
          </div>
          <h2>${isGuest ? "Explore MindGuard AI" : greeting}</h2>
          <div class="tabs auth-tabs">
            <button class="${state.authMode === "login" ? "active" : ""}" data-auth="login">Login</button>
            <button class="${state.authMode === "signup" ? "active" : ""}" data-auth="signup">Register</button>
            <button class="${state.authMode === "guest" ? "active" : ""}" data-auth="guest">Continue as Guest</button>
          </div>
          ${isReset ? `<p class="auth-caption">Enter your email and we’ll send password reset instructions.</p>` : ""}
          ${isGuest ? `
            <div class="guest-panel">
              <p>Preview the dashboard, try the screening flow, or open the AI companion without creating an account.</p>
              <button class="auth-submit" type="button" data-guest="dashboard">Explore Demo Dashboard <span>→</span></button>
              <button class="auth-secondary-action" type="button" data-guest="screening">Take Quick Mental Wellness Check</button>
              <button class="auth-secondary-action" type="button" data-auth="signup">Create a secure account</button>
            </div>
          ` : `<form id="authForm" class="form auth-modern-form" novalidate>
            ${isSignup ? authInput("name", "Name", "text", "Your name", "👤") : ""}
            ${authInput("email", "Email", "email", "you@example.com", "✉️")}
            ${!isReset ? authInput("password", "Password", state.showPassword ? "text" : "password", "8+ characters", "🔒", true) : ""}
            ${!isReset ? `<div class="password-strength" aria-label="Password strength"><span></span><span></span><span></span><small>Password strength</small></div>` : ""}
            ${state.authMode === "login" ? `<button class="forgot-inline" type="button" data-auth="forgot">Forgot password?</button>` : ""}
            ${isSignup ? roleCards() : ""}
            ${isSignup ? `<label class="consent-check"><input type="checkbox" id="consentCheck" ${state.authConsent ? "checked" : ""} /> <span>I understand this app provides supportive insights only and is not a substitute for professional mental health care.</span></label>` : ""}
            <button class="auth-submit" ${isSignup && !state.authConsent ? "disabled" : ""}>
              ${state.authLoading ? `<span class="spinner"></span>` : ""}
              ${isSignup ? "Create account" : isReset ? "Send reset link" : "Sign in"} <span>→</span>
            </button>
            ${authSwitchPrompt}
            <div class="auth-divider"><span>Or continue with</span></div>
            <div class="social-row">
              <button type="button" class="social-btn"><span class="brand-icon google-icon">G</span>Google</button>
              <button type="button" class="social-btn"><span class="brand-icon microsoft-icon">M</span>Microsoft</button>
              <button type="button" class="social-btn"><span class="brand-icon github-icon">⌘</span>GitHub</button>
            </div>
            <div class="auth-deep-links">
              <button type="button" data-guest="screening">Take Quick Mental Wellness Check</button>
              <button type="button" data-guest="dashboard">Explore Demo Dashboard</button>
              <button type="button" data-auth="signup">Learn How It Works</button>
            </div>
            <p class="legal-copy">By creating an account you agree to our <a href="#">Privacy Policy</a> and <a href="#">Terms of Use</a>.</p>
            <p id="authMessage" class="small auth-message"></p>
          </form>`}
        </div>
      </section>
      <div class="auth-version-tag">v1.0 · Academic Capstone</div>
    </main>
  `;

  document.querySelectorAll("[data-auth]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.auth;
      state.resetSent = false;
      state.authSuccess = "";
      renderAuth();
    });
  });
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authRole = button.dataset.role;
      renderAuth();
    });
  });
  document.querySelector("#consentCheck")?.addEventListener("change", (event) => {
    state.authConsent = event.target.checked;
    renderAuth();
  });
  document.querySelector("[data-password-toggle]")?.addEventListener("click", () => {
    state.showPassword = !state.showPassword;
    renderAuth();
  });
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    state.authDark = !state.authDark;
    renderAuth();
  });
  document.querySelectorAll("[data-guest]").forEach((button) => {
    button.addEventListener("click", () => enterGuestMode(button.dataset.guest));
  });
  bindAuthValidation();
  bindLanguage();
  document.querySelector("#authForm")?.addEventListener("submit", handleAuth);
}

function enterGuestMode(target = "dashboard") {
  state.user = {
    id: "guest_user",
    name: "Guest",
    role: "user",
    email: "",
    createdAt: new Date().toISOString(),
    consent: { moodHistory: false, research: false, highRiskAlerts: false, imageAnalysis: false }
  };
  state.view = target === "screening" ? "screening" : "dashboard";
  state.trend = { entries: fallbackWeek.map((item) => ({ ...item, createdAt: new Date().toISOString() })) };
  render();
}

function authInput(name, label, type, placeholder, icon, passwordToggle = false) {
  return `
    <div class="auth-field" data-field-wrap="${name}">
      <label for="auth-${name}">${label}</label>
      <div class="auth-input-wrap">
        <span class="field-icon">${icon}</span>
        <input id="auth-${name}" name="${name}" type="${type}" placeholder="${placeholder}" aria-describedby="${name}-error" autocomplete="${name === "password" ? "current-password" : name}" />
        ${passwordToggle ? `<button type="button" class="password-toggle" data-password-toggle aria-label="Show or hide password">${state.showPassword ? "🙈" : "👁️"}</button>` : ""}
        <span class="valid-check" aria-hidden="true">✓</span>
      </div>
      <p class="field-error" id="${name}-error"></p>
    </div>
  `;
}

function roleCards() {
  const roles = [
    ["user", "👤", "Individual", "Track my own wellness"],
    ["admin", "🩺", "Counselor", "Support clients"],
    ["researcher", "🔬", "Researcher", "Study patterns"]
  ];
  return `
    <div class="role-card-group" role="radiogroup" aria-label="Role">
      ${roles.map(([value, icon, title, description]) => `<button type="button" class="role-card ${state.authRole === value ? "selected" : ""}" data-role="${value}" role="radio" aria-checked="${state.authRole === value}"><span>${icon}</span><strong>${title}</strong><small>${description}</small></button>`).join("")}
      <input type="hidden" name="role" value="${state.authRole}" />
    </div>
  `;
}

function languageSelect() {
  return `
    <label class="language-select" aria-label="Language">
      <span class="language-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.1a15.7 15.7 0 0 0-1.1-5 8.05 8.05 0 0 1 4.2 5ZM12 4.1c.7 1 1.4 2.6 1.8 4.9h-3.6c.4-2.3 1.1-3.9 1.8-4.9ZM4.3 13h3.9c.1 1.7.5 3.3 1.1 4.7A8.03 8.03 0 0 1 4.3 13Zm3.9-2H4.3a8.03 8.03 0 0 1 5-4.7A16 16 0 0 0 8.2 11Zm3.8 8.9c-.7-1-1.4-2.6-1.8-4.9h3.6c-.4 2.3-1.1 3.9-1.8 4.9Zm2.2-6.9H9.8a13.7 13.7 0 0 1 0-2h4.4a13.7 13.7 0 0 1 0 2Zm.5 4.7c.6-1.4 1-3 1.1-4.7h3.9a8.03 8.03 0 0 1-5 4.7Z"/></svg></span>
      <select id="languageSelect">
        ${languageOptions.map((language) => `<option value="${language.value}" ${state.language === language.value ? "selected" : ""}>${language.label}</option>`).join("")}
      </select>
    </label>
  `;
}

function bindLanguage() {
  document.querySelectorAll("#languageSelect").forEach((select) => {
    select.addEventListener("change", () => {
      state.language = select.value;
      localStorage.setItem("mindguard-language", state.language);
      render();
    });
  });
}

function applyLanguageMeta() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
}

function titleForView() {
  return {
    dashboard: t("title.dashboard"),
    screening: t("title.screening"),
    mood: t("title.mood"),
    chatbot: t("title.chatbot"),
    posts: t("title.posts"),
    image: t("title.image"),
    support: t("title.support"),
    admin: t("title.admin"),
    profile: t("title.profile")
  }[state.view];
}

function contentForView() {
  return {
    dashboard: dashboardView,
    screening: screeningView,
    mood: moodView,
    chatbot: chatbotView,
    posts: postsView,
    image: imageView,
    support: supportView,
    admin: adminView,
    profile: profileView
  }[state.view]();
}

function dashboardView() {
  const trend = state.trend || { averageMood: 0, trend: "No data yet", points: [] };
  const latestRisk = state.latest.screening?.riskLevel || state.latest.post?.riskLevel || "Low";
  const week = weeklyMoodData();
  const insights = dashboardInsights(week);
  const steps = nextStepItems();
  const completeCount = steps.filter((item) => state.completedSteps.includes(item.id)).length;
  const riskPercent = latestRisk === "High" ? 88 : latestRisk === "Moderate" ? 55 : 24;
  const moodLog = todayMoodLog(week);
  const nextAction = urgentNextAction(latestRisk);
  const journalSummary = weeklyJournalSummary();
  const copingCount = copingToolsUsed();
  const sleepAvg = sleepQualityAverage(week);
  return `
    <div class="grid">
      ${riskBanner(latestRisk)}
      <section class="welcome full">
        <div>
          <p>${greeting()} ☀️</p>
          <h3>Here is your wellness snapshot for the week.</h3>
        </div>
      </section>
      <div class="stat-cards full">
        <section class="panel stat-card metric">
          <span class="small">Current combined risk</span>
          <div class="stat-line">
            <strong>${riskLabel(latestRisk)}</strong>
            <span class="trend-arrow">${latestRisk === "High" ? "↗" : latestRisk === "Moderate" ? "→" : "↘"}</span>
          </div>
          <span class="pill ${riskClass(latestRisk)}">${riskLabel(latestRisk)}</span>
          <div class="mini-progress"><span class="${riskClass(latestRisk)}" style="width:${riskPercent}%"></span></div>
        </section>
        <section class="panel stat-card metric">
          <span class="small">7-day average mood</span>
          <strong>${trend.averageMood || insights.best.mood}/10</strong>
          <span class="trend-label ${String(trend.trend || "Stable").toLowerCase()}"><i></i>${trend.trend === "No data yet" ? "Stable" : trend.trend}</span>
          <div class="sparkline">${week.map((item) => `<span style="height:${item.mood * 4}px"></span>`).join("")}</div>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Today’s mood log</span>
          <strong>${moodLog.hasCheckin ? `${moodLog.emoji} ${moodLog.score}/10` : "Not logged"}</strong>
          <span class="small">${moodLog.hasCheckin ? `Logged at ${moodLog.time}` : "A quick check-in takes under a minute."}</span>
          <button class="btn compact" data-quick="mood">${moodLog.hasCheckin ? "Update" : "Log now"}</button>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Journal entries this week</span>
          <strong>${journalSummary.count}</strong>
          <span class="small">${escapeHtml(journalSummary.preview)}</span>
          <button class="btn compact" data-quick="journal">Write</button>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Coping tools used</span>
          <strong>${copingCount}</strong>
          <span class="small">Breathing and grounding exercises completed this week.</span>
          <button class="btn compact" data-quick="breathing">Start one</button>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Sleep quality avg</span>
          <strong>${sleepAvg}/10</strong>
          <span class="small">From check-ins. Apple Watch sync requires Apple Health connection.</span>
          <button class="btn compact" data-quick="watch">Connect Watch</button>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Next recommended action</span>
          <strong>Log today’s mood</strong>
          <span class="small">${nextAction.description}</span>
          <button class="btn compact" data-quick="${nextAction.action}">Do it →</button>
        </section>
        <section class="panel stat-card metric">
          <span class="small">Therapist connection</span>
          <strong><span class="status-badge amber">Not connected</span></strong>
          <span class="small">Find a counselor or support service near you.</span>
          <button class="btn compact" data-quick="support">Find one</button>
        </section>
      </div>
      <section class="panel">
        <h3><span class="title-icon">${icons.mood}</span>${t("moodTrend")}</h3>
        <div class="chart-wrap">
          <canvas id="moodLineChart" aria-label="Weekly mood line chart from 0 to 10" role="img"></canvas>
        </div>
        <p class="chart-legend"><span></span> Baseline reference at 5</p>
      </section>
      <section class="panel">
        <div class="steps-head">
          <h3><span class="title-icon">${icons.support}</span>${t("nextSteps")}</h3>
          <p>${completeCount} of ${steps.length} steps completed</p>
          <div class="mini-progress"><span class="low" style="width:${(completeCount / steps.length) * 100}%"></span></div>
        </div>
        <div class="action-steps">
          ${steps
            .map(
              (item) => `
                <article class="action-step ${item.urgency}">
                  <label class="step-check"><input type="checkbox" data-step="${item.id}" ${state.completedSteps.includes(item.id) ? "checked" : ""} /></label>
                  <span class="title-icon">${item.icon}</span>
                  <div>
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <button class="link-button" data-quick="${item.id === "crisis" ? "crisis" : item.id === "mood" ? "mood" : item.id === "screen" ? "screening" : "posts"}">${item.action}</button>
                  </div>
                </article>`
            )
            .join("")}
        </div>
      </section>
      <section class="panel full">
        <h3>This week at a glance</h3>
        <div class="insight-grid">
          <article><span>☀️</span><p>Best day</p><strong>${insights.best.day} · ${insights.best.mood}/10</strong></article>
          <article><span>🌧</span><p>Hardest day</p><strong>${insights.hardest.day} · ${insights.hardest.mood}/10</strong></article>
          <article><span>💬</span><p>Common emotion</p><strong>${insights.commonEmotion}</strong></article>
          <article><span>📈</span><p>Risk trend</p><strong>${insights.riskTrend}</strong></article>
        </div>
      </section>
      <section class="panel full">
        <h3>Additional wellness signals</h3>
        <div class="wellness-signal-grid">
          ${advancedDashboardCards(week)
            .map(
              (card) => `
                <article>
                  <p>${card.title}</p>
                  <strong>${card.value}</strong>
                  <span>${card.detail}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function screeningView() {
  return `
    <div class="grid">
      <section class="panel full">
        <div class="mode-switch">
          <button class="${state.screeningMode === "game" ? "active" : ""}" data-screening-mode="game">Gamified mode</button>
          <button class="${state.screeningMode === "qa" ? "active" : ""}" data-screening-mode="qa">Classic mode</button>
        </div>
        <p class="mode-caption">Classic mode shows standard PHQ-9 questions with a 0–3 scale.</p>
      </section>
      ${
        state.screeningMode === "game"
          ? interactiveScreeningView()
          : questionAnswerScreeningView()
      }
      ${state.latest.screening && !state.classicScreeningComplete && !state.mindQuestComplete ? `<section class="panel full" id="screeningResult">${renderAnalysis(state.latest.screening)}</section>` : ""}
    </div>
  `;
}

function questionAnswerScreeningView() {
  if (state.classicScreeningComplete && state.classicAnswers.length) {
    return screeningCompletionCard({
      signal: signalFromAnswers(state.classicAnswers),
      answers: state.classicAnswers,
      title: "Classic screening complete"
    });
  }
  return `
      <section class="panel full">
        <form id="phqForm" class="form">
          <div class="questions">
            ${phq9Questions
              .map(
                (question, index) => `
                <div class="question">
                  <span>${index + 1}. ${question}</span>
                  <select name="q${index}">
                    <option value="0">${t("phqOptions")[0]}</option>
                    <option value="1">${t("phqOptions")[1]}</option>
                    <option value="2">${t("phqOptions")[2]}</option>
                    <option value="3">${t("phqOptions")[3]}</option>
                  </select>
                </div>`
              )
              .join("")}
          </div>
          <button class="btn">${t("calculateRisk")}</button>
        </form>
      </section>
  `;
}

function interactiveScreeningView() {
  const quests = mindQuestQuests();
  const index = Math.min(state.mindQuestIndex, quests.length - 1);
  const quest = quests[index];
  const answeredCount = quests.filter((item) => state.mindQuestAnswers[item.field] !== undefined).length;
  const selected = state.mindQuestAnswers[quest.field];
  const signal = mindQuestSignal();

  if (state.mindQuestComplete) return mindQuestCompletionView(quests, signal);

  return `
    <section class="panel full game-screening">
      <form id="mindQuestForm" class="form">
        <input type="hidden" name="q4" value="0" />
        ${phq9Questions.map((_, idx) => `<input type="hidden" name="q${idx}" value="${Number(state.mindQuestAnswers[`q${idx}`] || 0)}" />`).join("")}
        <div class="game-hero">
          <div>
            <span class="game-kicker">Mind Quest</span>
            <h3>Explore your wellness map</h3>
            <p>Choose tokens across eight mini-quests. MindGuard estimates depression, anxiety, stress, and safety-related signals as supportive insight only.</p>
          </div>
          <div class="game-score-orb">${answeredCount}<br><small>done</small></div>
        </div>

        <div class="quest-progress" aria-label="Quest progress">
          <div class="quest-progress-head">
            <strong>Quest ${index + 1} of ${quests.length}</strong>
            <span>${answeredCount} completed</span>
          </div>
          <div class="quest-dots">
            ${quests
              .map((item, dotIndex) => {
                const done = state.mindQuestAnswers[item.field] !== undefined;
                const current = dotIndex === index;
                return `<button type="button" class="quest-dot quest-tone-${dotIndex + 1} ${done ? "done" : ""} ${current ? "current" : ""}" data-quest-jump="${dotIndex}" aria-label="${item.name}"><span class="quest-dot-icon">${done ? "✓" : item.icon}</span><small>${item.name}</small></button>`;
              })
              .join("")}
          </div>
        </div>

        <div class="quest-play-layout">
          <fieldset class="quest-card active-quest">
            <legend>
              <span class="quest-icon-large">${quest.icon}</span>
              <span><small>${quest.domain}</small>${quest.name}</span>
            </legend>
            <p>${quest.detail}</p>
            <button class="why-link" type="button" data-why-toggle>Why are we asking this?</button>
            ${state.mindQuestWhyOpen ? `<div class="why-note">${quest.insight}</div>` : ""}
            <div class="token-row">
              ${quest.options
                .map(([label, value, text]) => {
                  const isSelected = Number(selected) === value;
                  const hasSelection = selected !== undefined;
                  const severity = value === 0 ? "green" : value === 1 ? "amber" : "red";
                  return `
                    <label class="signal-token ${isSelected ? "selected" : ""} ${hasSelection && !isSelected ? "dimmed" : ""}" data-quest-select data-field="${quest.field}" data-value="${value}" tabindex="0">
                      <input type="radio" name="${quest.field}" value="${value}" data-quest-option="${quest.field}" ${isSelected ? "checked" : ""} />
                      <i class="severity-dot ${severity}"></i>
                      ${isSelected ? `<b class="selected-check">✓</b>` : ""}
                      <strong>${label}</strong>
                      <small>${text}</small>
                      ${isSelected ? `<em>Selected ✓</em>` : ""}
                    </label>`;
                })
                .join("")}
            </div>
          </fieldset>

          <aside class="quest-preview">
            <h3>Preliminary insight</h3>
            <p>Not a score until all quests complete.</p>
            <span class="pill ${riskClass(signal)}">${signal}</span>
            <ul>
              ${quests
                .map((item) => `<li>${item.name.split(" ")[0]} ${state.mindQuestAnswers[item.field] !== undefined ? "✓" : "pending"}</li>`)
                .join("")}
            </ul>
          </aside>
        </div>

        <div class="quest-nav-bar">
          <a class="support-now" href="tel:988">I need support now</a>
          <button class="btn secondary" type="button" data-quest-prev ${index === 0 ? "disabled" : ""}>← Previous quest</button>
          <span>${index + 1} of ${quests.length}</span>
          <div class="quest-next-zone ${selected === undefined ? "is-disabled" : ""}" role="button" tabindex="0">
            <button class="btn quest-next-block ${selected === undefined ? "is-disabled" : ""}" type="button" data-quest-next aria-disabled="${selected === undefined}">${index === quests.length - 1 ? "Finish quest" : "Next quest →"}</button>
          </div>
        </div>
      </form>
    </section>
  `;
}

function mindQuestCompletionView(quests, signal) {
  const answers = mindQuestAnswersArray();
  return `${screeningCompletionCard({ signal, answers, title: "Mind Quest complete" }).replace("</form>", `<button class="btn secondary" type="button" data-quest-reset>Restart quest</button></form>`)}`;
}

function moodView() {
  const draft = state.moodDraft;
  const score = wellnessScore(draft);
  const compared = score - 62;
  const noteIndex = new Date().getDate() % notePlaceholders.length;
  const concerning = /tired|hopeless|can't|cant|worthless/i.test(draft.notes || "");

  if (draft.saved) {
    return `
      <div class="grid mood-page saved-pulse">
        <section class="panel full checkin-confirmation">
          <h3>✅ Check-in saved for ${new Date().toLocaleDateString()}</h3>
          <strong>${score}/100</strong>
          <p>${compared >= 0 ? "+" : ""}${(compared / 10).toFixed(1)} from yesterday</p>
          <span>${copingSuggestion(draft)}</span>
          <div class="actions">
            <button class="btn" data-mood-reset>View full trend →</button>
            <button class="btn secondary" data-quick="chat">Chat about today →</button>
          </div>
        </section>
        ${moodTrendPanel()}
        ${moodHistoryPanel()}
      </div>
    `;
  }

  return `
    <div class="grid mood-page">
      <section class="panel mood-form-panel">
        <form id="moodForm" class="form">
          ${moodSlider("moodScore", "Mood score", "Very low", "Excellent")}
          ${moodSlider("stressScore", "Stress score", "No stress", "Overwhelming")}
          ${moodSlider("sleepQuality", "Sleep quality", "Very poor", "Refreshing")}
          ${moodSlider("energyLevel", "Energy level", "Exhausted", "Energized")}

          <div class="tag-section">
            <h3>What emotions are present today?</h3>
            <div class="pill-grid emotions">
              ${emotionOptions.map((item) => `<button type="button" class="tag-pill ${draft.emotions.includes(item) ? "selected" : ""}" data-emotion="${item}">${item}</button>`).join("")}
            </div>
          </div>

          <div class="tag-section">
            <h3>What affected your mood today?</h3>
            <p>Select up to 3</p>
            <div class="pill-grid triggers">
              ${triggerOptions.map((item) => `<button type="button" class="tag-pill ${draft.triggers.includes(item) ? "selected" : ""}" data-trigger="${item}">${item}</button>`).join("")}
            </div>
          </div>

          <label class="smart-notes">${t("notes")}
            <div class="notes-head"><span>${(draft.notes || "").length} / 500</span><button type="button" class="voice-btn" title="Voice to text">🎙</button></div>
            <textarea name="notes" maxlength="500" placeholder="${notePlaceholders[noteIndex]}">${escapeHtml(draft.notes || "")}</textarea>
          </label>
          ${concerning ? `<div class="notice danger-notice"><strong>It sounds like today was tough.</strong> Would you like to talk to the AI support companion? <button class="link-button" type="button" data-quick="chat">Yes, open chat →</button></div>` : ""}
          <button class="btn mood-save">Save today’s check-in →</button>
        </form>
        <details class="info-accordion">
          <summary>How MindGuard uses your check-in data</summary>
          <p>Your scores help update dashboard patterns, wellness trends, and supportive recommendations. Pattern detection looks at changes over time, selected emotions, and context tags. In this prototype, data is stored locally/on this app server for your session; production data should be encrypted with consent controls. See the full privacy policy for details.</p>
        </details>
      </section>

      <aside class="panel mood-insight-panel">
        <h3>Today's pattern insight</h3>
        <div class="wellness-gauge" style="--score:${score}"><strong>${score}</strong><span>/100</span></div>
        <p><strong>${compared >= 0 ? "↗" : "↘"} ${Math.abs(compared)}%</strong> compared to your 7-day average</p>
        <p><strong>${dominantCluster(draft)}</strong></p>
        <p>${copingSuggestion(draft)}</p>
        <button class="btn compact" type="button" data-full-ai>Get full AI analysis →</button>
        <div id="fullAiInsight" class="ai-full-insight"></div>
      </aside>

      ${moodTrendPanel()}
      ${moodHistoryPanel()}
    </div>
  `;
}

function moodSlider(name, label, low, high) {
  const value = Number(state.moodDraft[name] || 0);
  const tone = sliderTone(name, value);
  return `
    <label class="live-slider ${tone}">
      <span>${label}: <strong>${value}/10 ${moodEmoji(value)}</strong></span>
      <input data-mood-slider="${name}" name="${name}" type="range" min="1" max="10" value="${value}" />
      <small><b>${low}</b><b>${high}</b></small>
    </label>
  `;
}

function moodTrendPanel() {
  return `
    <section class="panel full mood-chart-panel">
      <h3>${t("weeklyMoodTrend")}</h3>
      <div class="mood-legend"><span class="teal"></span>Mood <span class="amber"></span>Stress <span class="blue"></span>Sleep <span class="green"></span>Energy</div>
      <div class="chart-wrap"><canvas id="moodDetailChart" aria-label="Weekly mood, stress, sleep, and energy chart" role="img"></canvas></div>
      <div class="insight-chips"><span>Best day: Wednesday (8.2 avg)</span><span>Watch: Stress peaks on Mondays</span><span>Sleep affects your mood by +1.3 pts</span></div>
    </section>
  `;
}

function moodHistoryPanel() {
  return `
    <section class="panel full history-panel">
      <h3>Check-in history</h3>
      <div class="history-stats"><span>🔥 7 day streak</span><span>23 check-ins logged</span><span>Best: 12 days</span></div>
      <div class="heatmap">${Array.from({ length: 30 }, (_, index) => `<span class="heat-${index % 4}" title="Day ${index + 1}"></span>`).join("")}</div>
    </section>
  `;
}

function chatbotView() {
  return `
    <div class="grid">
      <section class="panel full">
        <div id="chatLog" class="chat">
          ${
            state.chat.length
              ? state.chat.map((item) => `<div class="bubble ${item.sender}">${escapeHtml(item.message)}</div>`).join("")
              : `<div class="bubble assistant">${t("botHello")}</div>`
          }
        </div>
        <form id="chatForm" class="form" style="margin-top:14px">
          <label>${t("typeMessage")}<textarea name="message" placeholder="${t("typeMessage")}"></textarea></label>
          <button class="btn">${t("send")}</button>
        </form>
      </section>
    </div>
  `;
}

function floatingChat() {
  if (!state.chatOpen) return "";
  return `
    <div class="floating-chat ${state.chatOpen ? "open" : ""}">
      <section class="floating-chat-panel" aria-label="MindGuard AI chatbot">
              <div class="floating-chat-head">
                <div>
                  <strong>${t("botTitle")}</strong>
                  <p>${t("botSubtitle")}</p>
                </div>
                <button class="icon-btn" id="chatFab" aria-label="Close chatbot">×</button>
              </div>
              <div class="floating-chat-log">
                ${
                  state.chat.length
                    ? state.chat.map((item) => `<div class="bubble ${item.sender}">${escapeHtml(item.message)}</div>`).join("")
                    : `<div class="bubble assistant">${t("botHello")}</div>`
                }
              </div>
              <form id="floatingChatForm" class="floating-chat-form">
                <input name="message" placeholder="${t("typeMessage")}" autocomplete="off" />
                <button class="btn" aria-label="${t("send")}">${t("send")}</button>
              </form>
            </section>
    </div>
  `;
}

function quickActions() {
  return `
    <div class="quick-actions ${state.quickOpen ? "open" : ""}">
      <div class="quick-menu">
        <button data-quick="mood">Log mood</button>
        <button data-quick="breathing">Start breathing</button>
        <button data-quick="chat">Chat with AI</button>
        <button data-quick="crisis">Crisis support</button>
      </div>
      <button class="quick-fab" id="quickFab" aria-label="Quick actions">+</button>
    </div>
  `;
}

function riskBanner(risk) {
  if (risk === "High") {
    return `
      <section class="risk-banner high full">
        <strong>⚠ Your recent responses suggest you may need support.</strong>
        <div class="actions">
          <button class="btn" data-quick="chat">Talk to AI now</button>
          <a class="btn secondary" href="tel:988">Call 988</a>
        </div>
      </section>
    `;
  }
  if (risk === "Moderate") {
    return `<section class="risk-banner moderate full"><strong>Recent signals suggest extra support may help today.</strong><button class="btn secondary" data-quick="chat">Talk to AI now</button></section>`;
  }
  return "";
}

function renderMoodChart() {
  const detailCanvas = document.querySelector("#moodDetailChart");
  if (detailCanvas && window.Chart) {
    if (moodChart) moodChart.destroy();
    const week = weeklyMultiData();
    const baselinePlugin = {
      id: "baseline-detail",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea) return;
        const y = scales.y.getPixelForValue(5);
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "#9AA8A3";
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.restore();
      }
    };
    moodChart = new Chart(detailCanvas, {
      type: "line",
      data: {
        labels: week.map((item) => item.day),
        datasets: [
          { label: "Mood", data: week.map((item) => item.mood), borderColor: "#4A7C6F", backgroundColor: "rgba(74,124,111,.12)", fill: true, tension: 0.35 },
          { label: "Stress", data: week.map((item) => item.stress), borderColor: "#B7791F", backgroundColor: "transparent", tension: 0.35 },
          { label: "Sleep", data: week.map((item) => item.sleep), borderColor: "#3B6EA8", backgroundColor: "transparent", tension: 0.35 },
          { label: "Energy", data: week.map((item) => item.energy), borderColor: "#2F855A", backgroundColor: "transparent", tension: 0.35 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
        scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 }, grid: { color: "#E5ECE9" } }, x: { grid: { display: false } } }
      },
      plugins: [baselinePlugin]
    });
    return;
  }

  const canvas = document.querySelector("#moodLineChart");
  if (!canvas || !window.Chart) return;
  if (moodChart) moodChart.destroy();
  const week = weeklyMoodData();
  const baselinePlugin = {
    id: "baseline",
    afterDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) return;
      const y = scales.y.getPixelForValue(5);
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#9AA8A3";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
      ctx.restore();
    }
  };

  moodChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: week.map((item) => item.day),
      datasets: [
        {
          label: "Mood score",
          data: week.map((item) => item.mood),
          fill: true,
          tension: 0.36,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderColor(context) {
            const value = context.chart.data.datasets[0].data[context.p0DataIndex ?? 0] || 6;
            if (value < 5) return "#B2354B";
            if (value <= 5.5) return "#B86412";
            return "#4A7C6F";
          },
          backgroundColor: "rgba(74, 124, 111, 0.14)",
          pointBackgroundColor(context) {
            const value = context.raw || 6;
            if (value < 5) return "#B2354B";
            if (value <= 5.5) return "#B86412";
            return "#4A7C6F";
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const item = week[context.dataIndex];
              return `${item.date}: ${item.mood}/10 ${item.emoji}`;
            }
          }
        }
      },
      scales: {
        y: { min: 0, max: 10, ticks: { stepSize: 2 }, grid: { color: "#E5ECE9" } },
        x: { grid: { display: false } }
      }
    },
    plugins: [baselinePlugin]
  });
}

function handleQuickAction(action) {
  if (action === "chat") {
    state.chatOpen = true;
    state.quickOpen = false;
  } else if (action === "crisis") {
    window.location.href = "tel:988";
    return;
  } else if (action === "breathing") {
    state.copingUses.push({ type: "breathing", createdAt: new Date().toISOString() });
    localStorage.setItem("mindguard-coping-uses", JSON.stringify(state.copingUses));
    state.view = "support";
    state.quickOpen = false;
  } else if (action === "journal" || action === "support" || action === "watch") {
    state.view = "support";
    state.quickOpen = false;
  } else {
    state.view = action;
    state.quickOpen = false;
  }
  render();
}

function submitJournal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const text = form.journalText.value.trim();
  if (!text) return;
  state.journalEntries.push({ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() });
  localStorage.setItem("mindguard-journal-entries", JSON.stringify(state.journalEntries));
  render();
}

function toggleStep(stepId) {
  const set = new Set(state.completedSteps);
  if (set.has(stepId)) set.delete(stepId);
  else set.add(stepId);
  state.completedSteps = [...set];
  localStorage.setItem("mindguard-completed-steps", JSON.stringify(state.completedSteps));
  render();
}

function saveMoodDraft() {
  localStorage.setItem("mindguard-mood-draft", JSON.stringify(state.moodDraft));
}

function bindMoodInteractions() {
  document.querySelectorAll("[data-mood-slider]").forEach((input) => {
    input.addEventListener("input", () => {
      state.moodDraft[input.dataset.moodSlider] = Number(input.value);
      state.moodDraft.saved = false;
      saveMoodDraft();
      render();
    });
  });
  document.querySelectorAll("[data-emotion]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.emotion;
      const set = new Set(state.moodDraft.emotions);
      set.has(value) ? set.delete(value) : set.add(value);
      state.moodDraft.emotions = [...set];
      state.moodDraft.saved = false;
      saveMoodDraft();
      render();
    });
  });
  document.querySelectorAll("[data-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.trigger;
      const set = new Set(state.moodDraft.triggers);
      if (set.has(value)) set.delete(value);
      else if (set.size < 3) set.add(value);
      state.moodDraft.triggers = [...set];
      state.moodDraft.saved = false;
      saveMoodDraft();
      render();
    });
  });
  document.querySelector(".smart-notes textarea")?.addEventListener("input", (event) => {
    state.moodDraft.notes = event.target.value;
    state.moodDraft.saved = false;
    saveMoodDraft();
    render();
  });
  document.querySelector("[data-full-ai]")?.addEventListener("click", () => {
    const target = document.querySelector("#fullAiInsight");
    if (target) target.textContent = `I hear a ${dominantCluster(state.moodDraft).toLowerCase()} today. Your check-in suggests a ${wellnessScore(state.moodDraft)}/100 wellness score, so a small supportive action may help more than a big goal. ${copingSuggestion(state.moodDraft)}`;
  });
  document.querySelector("[data-mood-reset]")?.addEventListener("click", () => {
    state.moodDraft.saved = false;
    saveMoodDraft();
    render();
  });
}

function postsView() {
  return `
    <div class="grid">
      <section class="panel">${disclaimer()}</section>
      <section class="panel">
        <div class="notice">${t("publicNotice")}</div>
      </section>
      <section class="panel full">
        <form id="postForm" class="form">
          <label>${t("publicPostText")}<textarea name="text" placeholder="${t("publicPostPlaceholder")}"></textarea></label>
          <button class="btn">${t("analyzePost")}</button>
        </form>
      </section>
      <section class="panel full" id="postResult">${renderAnalysis(state.latest.post)}</section>
    </div>
  `;
}

function imageView() {
  return `
    <div class="grid">
      <section class="panel full">${disclaimer()}</section>
      <section class="panel">
        <form id="imageForm" class="form">
          <label>${t("imageOrScreenshot")}<input name="file" type="file" accept="image/*" /></label>
          <label>${t("visibleText")}<textarea name="ocrText" placeholder="${t("visibleTextPlaceholder")}"></textarea></label>
          <label>${t("visibleTone")}<select name="visualTone"><option value="neutral">${t("neutral")}</option><option value="sad">${t("sadTone")}</option><option value="tense">${t("tenseTone")}</option></select></label>
          <button class="btn">${t("analyzeImage")}</button>
        </form>
      </section>
      <section class="panel" id="imageResult">${renderImage(state.latest.image)}</section>
    </div>
  `;
}

function supportView() {
  return `
    <div class="grid">
      <section class="panel full">
        <h3><span class="title-icon">${icons.posts}</span>Journal Writing</h3>
        <form id="journalForm" class="form">
          <label>Today’s reflection<textarea name="journalText" placeholder="Write what you noticed today, what felt difficult, or one thing you need."></textarea></label>
          <button class="btn compact">Save journal entry</button>
        </form>
        <ul class="list journal-list">
          ${
            state.journalEntries.length
              ? state.journalEntries
                  .slice(-3)
                  .reverse()
                  .map((entry) => `<li><strong>${new Date(entry.createdAt).toLocaleDateString()}</strong><br>${escapeHtml(entry.text)}</li>`)
                  .join("")
              : "<li>No journal entries yet.</li>"
          }
        </ul>
      </section>
      <section class="panel third support-tile breathe">
        <h3><span class="title-icon">${icons.support}</span>${t("breathing")}</h3>
        <p>${t("breathingText")}</p>
        <div class="bar"><span style="width:75%"></span></div>
        <button class="btn compact" data-quick="breathing">Mark used</button>
      </section>
      <section class="panel third support-tile journal">
        <h3><span class="title-icon">${icons.posts}</span>${t("journaling")}</h3>
        <p>${t("journalingText")}</p>
      </section>
      <section class="panel third support-tile activity">
        <h3><span class="title-icon">${icons.mood}</span>${t("activity")}</h3>
        <p>${t("activityText")}</p>
      </section>
      <section class="panel full danger-notice notice">
        <strong>${t("crisis")}</strong> ${t("crisisText")}
      </section>
      <section class="panel">
        <h3>${t("therapy")}</h3>
        <p>${t("therapyText")}</p>
      </section>
      <section class="panel">
        <h3>${t("community")}</h3>
        <p>${t("communityText")}</p>
      </section>
      <section class="panel full watch-panel">
        <h3>Apple Watch / iWatch Sleep Connection</h3>
        <p>In this web prototype, sleep quality comes from the daily check-in. Real Apple Watch sleep syncing requires an iOS companion app using Apple HealthKit permissions, then securely sending consented sleep summaries to MindGuard AI.</p>
        <div class="actions">
          <button class="btn compact" data-quick="watch">Show connection status</button>
          <span class="status-badge amber">Not connected</span>
        </div>
      </section>
    </div>
  `;
}

function adminView() {
  const data = state.latest.admin;
  if (!data) return `<div class="panel full">${t("noData")}</div>`;
  return `
    <div class="grid">
      <section class="panel third metric"><span class="small">Users</span><strong>${data.users}</strong></section>
      <section class="panel third metric"><span class="small">Alerts</span><strong>${data.alerts.length}</strong></section>
      <section class="panel third metric"><span class="small">${t("averageMood")}</span><strong>${data.aggregate.averageMood}</strong></section>
      <section class="panel full">
        <h3>Aggregated Anonymized Analytics</h3>
        <ul class="list">
          <li>PHQ-9 style assessments: ${data.aggregate.assessments}</li>
          <li>Public post analyses: ${data.aggregate.postAnalyses}</li>
          <li>Image analyses: ${data.aggregate.imageAnalyses}</li>
        </ul>
      </section>
      <section class="panel full">
        <h3>High-Risk Alerts</h3>
        <ul class="list">
          ${
            data.alerts.length
              ? data.alerts.map((alert) => `<li>${alert.triggerSource} · ${alert.riskLevel} · ${new Date(alert.createdAt).toLocaleString()}</li>`).join("")
              : "<li>No high-risk alerts recorded.</li>"
          }
        </ul>
      </section>
    </div>
  `;
}

function profileView() {
  return `
    <div class="grid">
      <section class="panel">
        <form id="profileForm" class="form">
          <label>${t("name")}<input name="name" value="${escapeAttr(state.user.name)}" /></label>
          ${consentToggle("moodHistory", "Use mood history for personalization")}
          ${consentToggle("research", "Allow anonymized research analytics")}
          ${consentToggle("highRiskAlerts", "Allow high-risk counselor/admin alerts")}
          ${consentToggle("imageAnalysis", "Allow image analysis")}
          <button class="btn">${t("saveProfile")}</button>
        </form>
      </section>
      <section class="panel">
        <h3>${t("privacyTitle")}</h3>
        <ul class="list">
          ${t("privacyItems").map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;
}

function consentToggle(name, label) {
  return `<label><span><input type="checkbox" name="${name}" ${state.user.consent?.[name] ? "checked" : ""} /> ${label}</span></label>`;
}

function chart(points = []) {
  if (!points.length) return `<p>${t("noMood")}</p>`;
  return `<div class="chart">${points
    .map(
      (point) => `
      <div class="chart-col">
        <div class="chart-bar" title="Mood ${point.mood}/10" style="height:${point.mood * 13}px"></div>
        <span>${point.date}</span>
      </div>`
    )
    .join("")}</div>`;
}

function renderAnalysis(result) {
  if (!result) return `<p>${t("resultsHere")}</p>`;
  return `
    <h3>${t("analysisResult")}</h3>
    <p><span class="pill ${riskClass(result.riskLevel)}">${riskLabel(result.riskLevel)}</span> <strong>${result.label || "PHQ-9 score"}</strong> ${result.confidence ? `· confidence ${result.confidence}` : ""}</p>
    ${result.totalScore !== undefined ? `<p>${t("totalScore")}: <strong>${result.totalScore}</strong></p>` : ""}
    ${result.sentimentScore !== undefined ? `<p>${t("sentimentScore")}: ${result.sentimentScore}</p>` : ""}
    ${
      result.importantPhrases?.length
        ? `<p>${t("importantPhrases")}: ${result.importantPhrases.map((phrase) => `<span class="pill">${escapeHtml(phrase)}</span>`).join(" ")}</p>`
        : ""
    }
    <p>${t("authDisclaimer")}</p>
  `;
}

function renderImage(result) {
  if (!result) return `<p>${t("imageResultsHere")}</p>`;
  return `
    <h3>${t("combinedImage")}</h3>
    <p><span class="pill ${riskClass(result.riskLevel)}">${riskLabel(result.riskLevel)}</span> ${result.combinedPrediction}</p>
    <p>${t("visibleTone")}: ${result.visualTone}. ${t("imageInsightText")}</p>
    <p>${t("explanation")}: ${(result.explanation || []).join(", ") || t("noStrongPhrases")}</p>
  `;
}

function bindCurrentView() {
  const forms = {
    phqForm: submitPhq,
    moodForm: submitMood,
    chatForm: submitChat,
    postForm: submitPost,
    imageForm: submitImage,
    journalForm: submitJournal,
    profileForm: submitProfile
  };
  Object.entries(forms).forEach(([id, handler]) => {
    const form = document.querySelector(`#${id}`);
    if (form) form.addEventListener("submit", handler);
  });
}

function bindAuthValidation() {
  document.querySelectorAll(".auth-field input").forEach((input) => {
    input.addEventListener("input", () => validateAuthField(input));
    validateAuthField(input, false);
  });
}

function validateAuthField(input, show = true) {
  const wrap = input.closest(".auth-field");
  const error = wrap?.querySelector(".field-error");
  let message = "";
  if (input.name === "name" && state.authMode === "signup" && input.value.trim().length < 2) message = "Please enter your name.";
  if (input.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) message = "Enter a valid email address.";
  if (input.name === "password" && state.authMode !== "forgot" && input.value.length < 8) message = "Password must be at least 8 characters.";
  wrap?.classList.toggle("valid", !message && input.value.trim().length > 0);
  wrap?.classList.toggle("invalid", Boolean(message) && show);
  if (error) error.textContent = show ? message : "";
  return !message;
}

function validateAuthForm(form) {
  const valid = [...form.querySelectorAll(".auth-field input")].every((input) => validateAuthField(input));
  const message = document.querySelector("#authMessage");
  if (state.authMode === "signup" && !state.authConsent) {
    if (message) message.textContent = "Please confirm the supportive-insight consent before creating an account.";
    return false;
  }
  return valid;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const message = document.querySelector("#authMessage");
  if (!validateAuthForm(form)) return;
  state.authLoading = true;
  state.authSuccess = "";
  renderAuth();
  try {
    if (state.authMode === "forgot") {
      const data = await api("/api/auth/forgot-password", { method: "POST", body: values });
      state.authLoading = false;
      state.resetSent = true;
      renderAuth();
      return;
    }
    const path = state.authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const { user } = await api(path, { method: "POST", body: values });
    state.authLoading = false;
    state.authSuccess = state.authMode === "signup" ? `Welcome, ${user.name || "friend"} ✨` : `Welcome back, ${user.name || "friend"} ✨`;
    renderAuth();
    await delay(650);
    state.user = user;
    state.authSuccess = "";
    await refreshTrend();
    render();
  } catch (error) {
    state.authLoading = false;
    renderAuth();
    const nextMessage = document.querySelector("#authMessage");
    if (nextMessage) nextMessage.textContent = error.message;
  }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" });
  state.user = null;
  state.chat = [];
  renderAuth();
}

async function submitPhq(event) {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const answers = phq9Questions.map((_, index) => Number(values.get(`q${index}`)));
  state.latest.screening = await api("/api/screening/phq9", { method: "POST", body: { answers } });
  if (state.screeningMode === "qa") {
    state.classicAnswers = answers;
    state.classicScreeningComplete = true;
  }
  render();
}

async function submitMindQuest(event) {
  event.preventDefault();
  const answers = mindQuestAnswersArray();
  state.latest.screening = await api("/api/screening/phq9", { method: "POST", body: { answers } });
  state.mindQuestComplete = true;
  render();
}

async function submitMood(event) {
  event.preventDefault();
  const values = { ...state.moodDraft };
  const data = await api("/api/mood/checkin", { method: "POST", body: values });
  state.trend = data.trend;
  state.moodDraft.saved = true;
  saveMoodDraft();
  render();
}

async function submitPost(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const data = await api("/api/analysis/post", { method: "POST", body: values });
  state.latest.post = data.analysis;
  render();
}

async function submitImage(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const data = await api("/api/analysis/image", { method: "POST", body: values });
  state.latest.image = data.analysis;
  render();
}

async function submitChat(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  if (!values.message.trim()) return;
  event.currentTarget.reset();
  state.chatOpen = true;
  state.chat.push({ sender: "user", message: values.message });
  state.chat.push({ sender: "assistant", message: "I’m listening..." });
  render();
  try {
    const data = await api("/api/chat/message", { method: "POST", body: values });
    state.chat = state.chat.slice(0, -1).concat({ sender: "assistant", message: data.reply });
  } catch (error) {
    state.chat = state.chat.slice(0, -1).concat({
      sender: "assistant",
      message: "I’m having trouble responding right now. Please try again in a moment. If this feels urgent, call or text 988 in the U.S."
    });
  }
  state.chatOpen = true;
  render();
}

async function submitProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const consent = {
    moodHistory: form.moodHistory.checked,
    research: form.research.checked,
    highRiskAlerts: form.highRiskAlerts.checked,
    imageAnalysis: form.imageAnalysis.checked
  };
  const { user } = await api("/api/users/me", { method: "PATCH", body: { name: form.name.value, consent } });
  state.user = user;
  render();
}

async function refreshTrend() {
  state.trend = await api("/api/mood/trends").catch(() => null);
}

async function refreshChat() {
  const data = await api("/api/chat/messages").catch(() => ({ messages: [] }));
  state.chat = data.messages || [];
}

async function refreshAdmin() {
  state.latest.admin = await api("/api/admin/dashboard").catch(() => null);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

init();

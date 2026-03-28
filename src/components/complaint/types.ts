export type VoiceState = "idle" | "listening" | "processing" | "understood";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: { id: string; label: string; icon?: string }[];
  timestamp: Date;
}

export type WizardStep = "category" | "subcategory" | "details" | "confirm" | "success";

export interface ComplaintData {
  category: string;
  categoryLabel: string;
  subcategory: string;
  description: string;
  whenOccurred?: string;
  amountInvolved?: string;
}

export const CATEGORIES = [
  { id: "payments", label: "Payments", labelHi: "भुगतान" },
  { id: "upi", label: "UPI", labelHi: "यूपीआई" },
  { id: "card", label: "Card", labelHi: "कार्ड" },
  { id: "loan", label: "Loan", labelHi: "ऋण" },
  { id: "account", label: "Account", labelHi: "खाता" },
  { id: "mobile_banking", label: "Mobile Banking", labelHi: "मोबाइल बैंकिंग" },
] as const;

export const SUBCATEGORIES: Record<string, { id: string; label: string; labelHi: string }[]> = {
  payments: [
    { id: "payment_failed", label: "Payment failed", labelHi: "भुगतान विफल" },
    { id: "money_debited", label: "Money debited but not credited", labelHi: "पैसा कटा लेकिन जमा नहीं हुआ" },
    { id: "unauthorized", label: "Unauthorized transaction", labelHi: "अनधिकृत लेनदेन" },
    { id: "delayed", label: "Delayed payment", labelHi: "विलंबित भुगतान" },
  ],
  upi: [
    { id: "upi_failed", label: "UPI transaction failed", labelHi: "UPI लेनदेन विफल" },
    { id: "wrong_upi", label: "Wrong UPI ID debited", labelHi: "गलत UPI ID से पैसा कटा" },
    { id: "upi_pin", label: "UPI PIN not working", labelHi: "UPI PIN काम नहीं कर रहा" },
    { id: "refund_pending", label: "Refund not received", labelHi: "रिफंड नहीं मिला" },
  ],
  card: [
    { id: "card_blocked", label: "Card blocked", labelHi: "कार्ड ब्लॉक" },
    { id: "fraudulent", label: "Fraudulent transaction", labelHi: "धोखाधड़ी लेनदेन" },
    { id: "emi_issue", label: "EMI issue", labelHi: "EMI समस्या" },
    { id: "card_not_delivered", label: "Card not delivered", labelHi: "कार्ड नहीं मिला" },
  ],
  loan: [
    { id: "emi_overcharged", label: "EMI overcharged", labelHi: "EMI अधिक कटी" },
    { id: "loan_not_approved", label: "Loan not approved", labelHi: "ऋण स्वीकृत नहीं" },
    { id: "wrong_interest", label: "Wrong interest rate", labelHi: "गलत ब्याज दर" },
    { id: "foreclosure", label: "Foreclosure issue", labelHi: "पूर्व भुगतान समस्या" },
  ],
  account: [
    { id: "account_frozen", label: "Account frozen", labelHi: "खाता फ्रीज" },
    { id: "wrong_debit", label: "Wrong debit", labelHi: "गलत डेबिट" },
    { id: "kyc_issue", label: "KYC issue", labelHi: "KYC समस्या" },
    { id: "account_delay", label: "Account opening delay", labelHi: "खाता खोलने में देरी" },
  ],
  mobile_banking: [
    { id: "app_not_working", label: "App not working", labelHi: "ऐप काम नहीं कर रहा" },
    { id: "otp_not_received", label: "OTP not received", labelHi: "OTP नहीं मिला" },
    { id: "login_failed", label: "Login failed", labelHi: "लॉगिन विफल" },
    { id: "feature_unavailable", label: "Feature unavailable", labelHi: "सुविधा उपलब्ध नहीं" },
  ],
};

export const UI_TEXT = {
  en: {
    title: "File a Complaint",
    subtitle: "Your secure grievance channel",
    voicePrompt: "Tap the microphone to speak your complaint",
    orType: "or type your complaint below",
    askCategory: "What type of issue are you facing?",
    askSubcategory: "Could you tell me more about what happened?",
    askDescription: "Please describe your issue in detail. You can type or use voice input.",
    askWhen: "When did this issue occur?",
    askAmount: "Was any amount involved? If yes, how much?",
    confirmTitle: "Review Your Complaint",
    confirmSubmit: "Submit Complaint",
    confirmEdit: "Edit Details",
    submitting: "Submitting...",
    successTitle: "Complaint Registered Successfully",
    successMessage: "Your complaint has been filed and is being processed by the concerned department.",
    refId: "Reference ID",
    department: "Assigned Department",
    resolution: "Expected Resolution",
    fileAnother: "File Another Complaint",
    secureBadge: "Secure Complaint Channel",
    privacyNote: "Your data is protected under RBI guidelines. Only authorized personnel can access your complaint details.",
    resolutionPreview: "Expected resolution within 48 hours",
    listening: "Listening...",
    processing: "Processing...",
    understood: "Understood",
    speakNow: "Speak now in Hindi or English",
    stop: "Stop",
    voiceInput: "Voice Input",
    back: "Back",
    skip: "Skip",
    yes: "Yes",
    no: "No",
    category: "Category",
    issue: "Issue",
    description: "Description",
    when: "When",
    amount: "Amount",
  },
  hi: {
    title: "शिकायत दर्ज करें",
    subtitle: "आपका सुरक्षित शिकायत माध्यम",
    voicePrompt: "शिकायत बोलने के लिए माइक्रोफोन दबाएं",
    orType: "या नीचे अपनी शिकायत टाइप करें",
    askCategory: "आपको किस प्रकार की समस्या हो रही है?",
    askSubcategory: "कृपया बताएं कि क्या हुआ?",
    askDescription: "कृपया अपनी समस्या का विस्तार से वर्णन करें। आप टाइप कर सकते हैं या आवाज़ का उपयोग कर सकते हैं।",
    askWhen: "यह समस्या कब हुई?",
    askAmount: "क्या कोई राशि शामिल थी? यदि हां, तो कितनी?",
    confirmTitle: "अपनी शिकायत की समीक्षा करें",
    confirmSubmit: "शिकायत दर्ज करें",
    confirmEdit: "विवरण संपादित करें",
    submitting: "जमा हो रहा है...",
    successTitle: "शिकायत सफलतापूर्वक दर्ज हुई",
    successMessage: "आपकी शिकायत दर्ज हो गई है और संबंधित विभाग द्वारा प्रक्रिया में है।",
    refId: "संदर्भ आईडी",
    department: "विभाग",
    resolution: "अपेक्षित समाधान",
    fileAnother: "एक और शिकायत दर्ज करें",
    secureBadge: "सुरक्षित शिकायत माध्यम",
    privacyNote: "आपका डेटा RBI दिशानिर्देशों के तहत सुरक्षित है। केवल अधिकृत कर्मचारी ही आपकी शिकायत तक पहुंच सकते हैं।",
    resolutionPreview: "48 घंटों के भीतर समाधान अपेक्षित",
    listening: "सुन रहे हैं...",
    processing: "प्रक्रिया हो रही है...",
    understood: "समझ गए",
    speakNow: "हिंदी या अंग्रेज़ी में बोलें",
    stop: "रोकें",
    voiceInput: "आवाज़ इनपुट",
    back: "पीछे",
    skip: "छोड़ें",
    yes: "हां",
    no: "नहीं",
    category: "श्रेणी",
    issue: "समस्या",
    description: "विवरण",
    when: "कब",
    amount: "राशि",
  },
};

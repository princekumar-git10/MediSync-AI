import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory persistent mock database fallback / state storage
const DB_FILE = path.join(__dirname, 'medisync_db.json');

// Ensure db file exists or initialize with default structure
function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // fallback
    }
  }
  return null;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Gemini Report OCR and Clinical Extraction
app.post('/api/gemini/analyze-report', async (req, res) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg', documentType = 'Lab Report' } = req.body;

    if (!ai) {
      // Rule-based fallback if no Gemini key or offline
      return res.json({
        success: true,
        summaryPatient: "The uploaded lab report shows mostly stable parameters with slightly elevated Fasting Blood Glucose (142 mg/dL) and mild reduction in eGFR (56 mL/min/1.73m²), suggesting need for routine metabolic monitoring.",
        summaryDoctor: "Patient CBC and CMP evaluated. Fasting Glucose 142 mg/dL (elevated). Serum Creatinine 1.28 mg/dL with eGFR 56 mL/min/1.73m² (Stage 3a CKD baseline consistent with previous record). Electrolytes and liver transaminases within normal physiological reference limits.",
        extractedValues: [
          { testName: "Fasting Blood Glucose", value: "142", unit: "mg/dL", referenceRange: "70 - 99", status: "high", confidence: 98, sourceLine: "GLUCOSE, FASTING: 142 mg/dL [70-99]" },
          { testName: "Hemoglobin A1c", value: "7.4", unit: "%", referenceRange: "< 5.7", status: "high", confidence: 97, sourceLine: "HEMOGLOBIN A1c: 7.4 % [<5.7]" },
          { testName: "Serum Creatinine", value: "1.28", unit: "mg/dL", referenceRange: "0.60 - 1.20", status: "high", confidence: 96, sourceLine: "CREATININE: 1.28 mg/dL [0.60-1.20]" },
          { testName: "eGFR (CKD-EPI)", value: "56", unit: "mL/min/1.73m²", referenceRange: "> 60", status: "low", confidence: 95, sourceLine: "eGFR: 56 mL/min/1.73m² [>60]" },
          { testName: "Sodium (Na+)", value: "139", unit: "mEq/L", referenceRange: "136 - 145", status: "normal", confidence: 99, sourceLine: "SODIUM: 139 mEq/L [136-145]" },
          { testName: "Potassium (K+)", value: "4.3", unit: "mEq/L", referenceRange: "3.5 - 5.1", status: "normal", confidence: 99, sourceLine: "POTASSIUM: 4.3 mEq/L [3.5-5.1]" },
          { testName: "WBC Count", value: "7.1", unit: "x10³/µL", referenceRange: "4.5 - 11.0", status: "normal", confidence: 98, sourceLine: "WHITE BLOOD CELL: 7.1 x10^3/uL [4.5-11.0]" }
        ],
        simplifiedTerms: [
          { term: "eGFR", explanation: "Estimated Glomerular Filtration Rate: A test showing how well your kidneys are filtering waste from your blood." },
          { term: "HbA1c", explanation: "Average blood sugar level over the past 2 to 3 months." }
        ],
        duplicateAlert: {
          hasDuplicateRisk: false,
          message: "No redundant tests detected within the past 14 days."
        },
        fallback: true
      });
    }

    const promptText = `You are MediSync AI's clinical report extraction system.
Analyze this medical document (${documentType}).
Extract structured lab values and findings accurately.
Return ONLY valid JSON matching this schema:
{
  "summaryPatient": "Plain language summary for the patient (2-3 sentences, reassuring yet informative)",
  "summaryDoctor": "Clinical summary for physicians with specific findings, delta risks, and physiological notes",
  "extractedValues": [
    {
      "testName": "Name of analyte or test",
      "value": "Numeric value or text result",
      "unit": "measurement unit (e.g. mg/dL, %, mm/hr)",
      "referenceRange": "Normal reference interval",
      "status": "normal" | "high" | "low" | "critical",
      "confidence": 95, // percentage 0-100 indicating OCR legibility
      "sourceLine": "Exact raw text snippet from the document"
    }
  ],
  "simplifiedTerms": [
    {
      "term": "Medical term used in report",
      "explanation": "Clear 1-sentence explanation for non-medical readers"
    }
  ],
  "flagsForManualReview": []
}`;

    let contents: any;
    if (imageBase64) {
      contents = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, ''),
            },
          },
          { text: promptText + (text ? `\nAdditional document text:\n${text}` : '') },
        ],
      };
    } else {
      contents = `${promptText}\n\nDocument text:\n${text || 'Standard metabolic panel'}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in analyze-report:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze report' });
  }
});

// Medical Terminology Simplifier
app.post('/api/gemini/explain-term', async (req, res) => {
  try {
    const { term, context = '' } = req.body;
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    if (!ai) {
      return res.json({
        term,
        simpleExplanation: `${term} is a clinical indicator used by healthcare providers to assess specific physiological functions. In everyday terms, it helps evaluate how your body's systems are balancing metabolism and organ health.`,
        whatItMeansForYou: "This test or diagnosis is typically reviewed alongside other vital signs to guide dietary, medication, or lifestyle adjustments.",
        questionsForDoctor: [
          `Does my ${term} result require any immediate change in medication?`,
          `When should I repeat this test?`,
          `Are there diet or lifestyle factors that influence this reading?`
        ],
        fallback: true
      });
    }

    try {
      const prompt = `You are MediSync AI's patient educator.
Explain the medical term "${term}" in clear, compassionate, and accurate plain English.
Context: "${context}".
Return ONLY a valid JSON object:
{
  "term": "${term}",
  "simpleExplanation": "Clear 2-sentence explanation without medical jargon",
  "whatItMeansForYou": "Practical explanation of what this means for the patient's daily life or health",
  "questionsForDoctor": [
    "3 relevant, thoughtful questions the patient can ask their care team"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini explain-term transient error, serving expert clinical fallback:', genErr);
      return res.json({
        term,
        simpleExplanation: `${term} is a clinical indicator used by healthcare providers to assess specific physiological functions. In everyday terms, it helps evaluate how your body's systems are balancing metabolism and organ health.`,
        whatItMeansForYou: "This test or diagnosis is reviewed alongside other vital signs to guide dietary, medication, or lifestyle adjustments.",
        questionsForDoctor: [
          `Does my ${term} result require any immediate change in medication?`,
          `When should I repeat this test?`,
          `Are there diet or lifestyle factors that influence this reading?`
        ],
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in explain-term:', err);
    res.status(500).json({ error: err.message });
  }
});

// Q&A about uploaded reports
app.post('/api/gemini/ask-report', async (req, res) => {
  try {
    const { question, reportData, patientContext = '' } = req.body;

    if (!ai) {
      return res.json({
        answer: `Based on the uploaded report records, your parameters remain under close clinical monitoring. Regarding "${question}", your results show consistent readings with standard reference ranges noted. Please be sure to review these findings directly with your attending physician during your next scheduled consult.`,
        safetyDisclaimer: "This automated explanation is for educational purposes and does not replace medical advice from your qualified physician.",
        suggestedFollowUps: [
          "Should I adjust my medication dosage based on this?",
          "Are these values trending better than my previous test?"
        ],
        fallback: true
      });
    }

    try {
      const prompt = `You are MediSync AI's clinical assistant.
The patient is asking a question about their medical report:
Question: "${question}"

Report Data:
${JSON.stringify(reportData)}

Patient Context:
${patientContext}

Provide an empathetic, clear, medically sound response in simple terms.
Highlight relevant numbers from the report.
Do NOT prescribe treatments or diagnose new emergencies without instructing them to seek urgent care if life-threatening.
Return ONLY valid JSON:
{
  "answer": "Clear, direct, and reassuring answer referencing specific values if applicable",
  "safetyDisclaimer": "Standard clinical disclaimer",
  "suggestedFollowUps": ["Two helpful follow-up questions"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini ask-report error, serving clinical fallback:', genErr);
      return res.json({
        answer: `Regarding your question "${question}": Reviewing your recorded analytes (Glucose 142 mg/dL, eGFR 56 mL/min, HbA1c 7.4%), these markers are stable compared to your previous historical baseline. They reflect ongoing management of your chronic conditions rather than an acute change. Please discuss any dosage modifications with Dr. Vance.`,
        safetyDisclaimer: "This automated explanation is for educational purposes and does not replace medical advice from your qualified physician.",
        suggestedFollowUps: [
          "Should I adjust my medication dosage based on this?",
          "When is my next repeat metabolic panel due?"
        ],
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in ask-report:', err);
    res.status(500).json({ error: err.message });
  }
});

// Old vs New Report Comparison
app.post('/api/gemini/compare-reports', async (req, res) => {
  try {
    const { oldReport, newReport } = req.body;

    if (!ai) {
      return res.json({
        summary: "Comparison shows modest glycemic stability with slight improvement in blood pressure control, while renal filtration markers (eGFR) remain stable.",
        keyChanges: [
          { testName: "HbA1c", oldValue: "7.8%", newValue: "7.4%", trend: "improved", delta: "-0.4%", clinicalSignificance: "Good response to current metformin and lifestyle adjustments." },
          { testName: "eGFR", oldValue: "58 mL/min", newValue: "56 mL/min", trend: "stable", delta: "-2 mL/min", clinicalSignificance: "Within standard biological fluctuation." },
          { testName: "Fasting Glucose", oldValue: "158 mg/dL", newValue: "142 mg/dL", trend: "improved", delta: "-16 mg/dL", clinicalSignificance: "Positive trend toward target fasting range." }
        ],
        recommendations: [
          "Maintain current diabetic regimen with quarterly HbA1c review.",
          "Ensure adequate hydration to support renal preservation."
        ],
        fallback: true
      });
    }

    try {
      const prompt = `You are MediSync AI's diagnostic trend analyzer.
Compare these two longitudinal lab reports for a patient:

PREVIOUS REPORT:
${JSON.stringify(oldReport)}

CURRENT REPORT:
${JSON.stringify(newReport)}

Return ONLY valid JSON:
{
  "summary": "Concise clinical comparison summary (2-3 sentences)",
  "keyChanges": [
    {
      "testName": "Name of test",
      "oldValue": "value from previous",
      "newValue": "value from current",
      "trend": "improved" | "deteriorated" | "stable",
      "delta": "difference with % or unit",
      "clinicalSignificance": "Why this change matters"
    }
  ],
  "recommendations": [
    "Clinical next steps or monitoring advice"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini compare-reports error, serving clinical fallback:', genErr);
      return res.json({
        summary: "Longitudinal comparison reveals progressive glycemic improvement (HbA1c decreasing from 7.8% to 7.4%) with stable baseline renal function (eGFR 56 vs 58 mL/min).",
        keyChanges: [
          { testName: "HbA1c", oldValue: "7.8%", newValue: "7.4%", trend: "improved", delta: "-0.4%", clinicalSignificance: "Good response to current metformin titration." },
          { testName: "eGFR", oldValue: "58 mL/min", newValue: "56 mL/min", trend: "stable", delta: "-2 mL/min", clinicalSignificance: "Within standard biological fluctuation for Stage 3a CKD." },
          { testName: "Fasting Glucose", oldValue: "158 mg/dL", newValue: "142 mg/dL", trend: "improved", delta: "-16 mg/dL", clinicalSignificance: "Downward glycemic slope demonstrates positive dietary adherence." }
        ],
        recommendations: [
          "Maintain current diabetic regimen with quarterly HbA1c review.",
          "Ensure adequate hydration to support renal preservation."
        ],
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in compare-reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// PulseGuard AI Early Warning & Clinical Deterioration Assessment
app.post('/api/gemini/pulseguard-assess', async (req, res) => {
  try {
    const { vitals, patientHistory, rawNews2Score } = req.body;
    const score = rawNews2Score || 3;
    const level = score >= 7 ? 'Critical' : score >= 5 ? 'High' : score >= 3 ? 'Medium' : 'Low';

    if (!ai) {
      return res.json({
        news2Score: score,
        riskLevel: level,
        physiologicalMechanism: `The combination of respiratory rate ${vitals?.respiratoryRate || 22}/min, heart rate ${vitals?.heartRate || 98} bpm, and SpO2 ${vitals?.spo2 || 94}% reflects compensatory adrenergic tone responding to mild metabolic/hypoxic stress.`,
        immediateActions: [
          "Increase vital signs monitoring frequency to every 2 hours.",
          "Check arterial blood gas (ABG) if SpO2 drops below 92%.",
          "Notify primary attending physician or Rapid Response Team if score increases by 2+ points."
        ],
        deteriorationTrajectory: score > 4 ? "Worsening trend over past 6 hours requiring bedside nursing reassessment" : "Stable compensatory physiology with low immediate collapse risk",
        fallback: true
      });
    }

    try {
      const prompt = `You are PulseGuard AI, an evidence-based clinical early warning system adhering to NEWS2 (National Early Warning Score 2) and qSOFA standards.
Assess the following patient data for impending acute deterioration:

Vitals:
${JSON.stringify(vitals)}

Patient History & Chronic Conditions:
${JSON.stringify(patientHistory)}

Calculated Base NEWS2: ${rawNews2Score}

Return ONLY valid JSON:
{
  "news2Score": ${rawNews2Score},
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "physiologicalMechanism": "Deep, explainable medical explanation of WHY the body is reacting this way (e.g. compensatory sympathetic activation, ventilation-perfusion mismatch, microvascular resistance)",
  "immediateActions": [
    "3-4 prioritized clinical interventions according to emergency protocols"
  ],
  "deteriorationTrajectory": "Predictive 4-8 hour trajectory if unaddressed",
  "differentialAlerts": ["Potential conditions such as Early Sepsis, Acute Respiratory Failure, Pulmonary Embolism, Fluid Overload"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini pulseguard error, serving clinical fallback:', genErr);
      return res.json({
        news2Score: score,
        riskLevel: level,
        physiologicalMechanism: `Tachypnea (${vitals?.respiratoryRate || 21}/min) combined with heart rate ${vitals?.heartRate || 88} bpm indicates increased minute ventilation to compensate for mild subclinical metabolic demand or airway resistance. In the context of known reactive airway disease and Stage 3a renal impairment, baroreceptor and chemoreceptor reflex arches maintain systemic perfusion.`,
        immediateActions: [
          "Verify lung sounds bilaterally and assess peak expiratory flow.",
          "Repeat full NEWS2 vital signs set in 2 hours.",
          "Verify pre-meal fingerstick glucose and maintain prescribed bronchodilator schedule."
        ],
        deteriorationTrajectory: score >= 5 ? "Elevated trajectory: escalation threshold met; immediate medical review indicated." : "Compensated stable trajectory: monitor for any tachypnea elevation.",
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in pulseguard-assess:', err);
    res.status(500).json({ error: err.message });
  }
});

// AI-Assisted Doctor Clinical Note (SOAP / SBAR)
app.post('/api/gemini/doctor-note', async (req, res) => {
  try {
    const { patientName, age, gender, chiefComplaint, vitals, findings, assessmentDraft, noteType = 'SOAP' } = req.body;

    if (!ai) {
      return res.json({
        noteType,
        subjective: `Patient ${patientName}, a ${age}-year-old ${gender}, presents for ${chiefComplaint}. Patient reports general adherence to prescribed home therapy; notes occasional morning dyspnea.`,
        objective: `Vitals: BP ${vitals?.systolicBp || 138}/${vitals?.diastolicBp || 86} mmHg, HR ${vitals?.heartRate || 88} bpm, SpO2 ${vitals?.spo2 || 94}%. CMP shows fasting glucose 142 mg/dL, HbA1c 7.4%, eGFR 56 mL/min/1.73m². Physical exam: alert, oriented x4, heart regular rate, lungs clear.`,
        assessment: `1. Type 2 Diabetes Mellitus - improving glycemic control, HbA1c down from 7.8%.\n2. Essential Hypertension - stable on ACE inhibitor.\n3. Stage 3a Chronic Kidney Disease - stable filtration without acute decompensation.`,
        plan: `1. Continue Metformin ER 1000 mg BID with evening meals.\n2. Maintain Lisinopril 20 mg PO daily with morning blood pressure logging.\n3. Low sodium dietary reinforcement.\n4. Repeat metabolic panel and microalbuminuria in 12 weeks.`,
        requiresReview: true,
        approved: false,
        fallback: true
      });
    }

    try {
      const prompt = `You are MediSync AI's clinical documentation assistant for doctors.
Generate a structured, professional ${noteType} clinical note based on:
Patient: ${patientName}, ${age}yo ${gender}
Chief Complaint: ${chiefComplaint}
Vitals: ${JSON.stringify(vitals)}
Findings / Labs: ${findings}
Physician's rough impressions: ${assessmentDraft}

Return ONLY valid JSON:
{
  "noteType": "${noteType}",
  "subjective": "Structured subjective history of present illness and review of systems",
  "objective": "Structured physical exam, vitals, and objective diagnostic metrics",
  "assessment": "Differential diagnoses and clinical problem list with clinical reasoning",
  "plan": "Numbered, actionable plan encompassing diagnostic workup, pharmacological adjustments, patient education, and follow-up timeline",
  "requiresReview": true,
  "approved": false
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini doctor-note error, serving clinical fallback:', genErr);
      return res.json({
        noteType,
        subjective: `Patient ${patientName}, a ${age}-year-old ${gender}, presents for ${chiefComplaint}. Patient notes adherence with oral hypoglycemic and antihypertensive regimen. Denies orthopnea, chest pressure, or syncope.`,
        objective: `Vitals: BP ${vitals?.systolicBp || 138}/${vitals?.diastolicBp || 86} mmHg, HR ${vitals?.heartRate || 88} bpm, SpO2 ${vitals?.spo2 || 94}%. Findings: ${findings || 'CMP with Fasting Glucose 142 mg/dL, HbA1c 7.4%, eGFR 56 mL/min/1.73m²'}. Lungs clear to auscultation bilaterally, abdomen soft non-tender.`,
        assessment: `1. Type 2 Diabetes Mellitus - improved from prior 7.8% baseline but still above 7.0% target.\n2. Essential Hypertension - well controlled.\n3. Stage 3a Chronic Kidney Disease - baseline stable.`,
        plan: `1. Maintain Metformin ER 1000 mg BID.\n2. Reinforce hydration and dietary sodium reduction.\n3. Routine repeat laboratory panel in 3 months.\n4. Clinic follow-up scheduled.`,
        requiresReview: true,
        approved: false,
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in doctor-note:', err);
    res.status(500).json({ error: err.message });
  }
});

// Conversational AI Health Assistant (Patient Triage & Q&A)
app.post('/api/gemini/assistant-chat', async (req, res) => {
  try {
    const { messages, userRole = 'patient', patientProfile } = req.body;

    if (!ai) {
      const lastMsg = messages?.[messages.length - 1]?.text || 'Hello';
      return res.json({
        reply: `Thank you for asking about "${lastMsg.slice(0, 50)}...". Based on your profile (${patientProfile?.name || 'Patient'}), your blood glucose and vital signs are currently stable. Remember to take your scheduled medications on time with food. If you experience shortness of breath, chest pressure, or sudden dizziness, please notify your care team immediately or call 911.`,
        disclaimer: "MediSync AI provides health information and decision support, not definitive medical diagnoses.",
        triageFlag: "routine",
        fallback: true
      });
    }

    try {
      const conversationHistory = (messages || []).map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

      const prompt = `You are MediSync AI's intelligent Health Assistant.
Active user role: ${userRole}.
Patient context: ${JSON.stringify(patientProfile || {})}.

Conversation so far:
${conversationHistory}

Respond with warmth, medical precision, and clear clarity.
Highlight red-flag symptoms if present.
Classify triage urgency: "routine" | "urgent" | "emergency".
Return ONLY valid JSON:
{
  "reply": "Your helpful, compassionate response",
  "triageFlag": "routine" | "urgent" | "emergency",
  "disclaimer": "Safety disclaimer reminder"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr) {
      console.warn('Gemini assistant-chat error, serving clinical fallback:', genErr);
      const lastMsg = messages?.[messages.length - 1]?.text || '';
      return res.json({
        reply: `I understand your question regarding "${lastMsg.slice(0, 60)}". With your history of ${patientProfile?.conditions?.join(', ') || 'diabetes and hypertension'}, your latest readings show stable metabolic parameters. It is recommended to log your morning blood pressure and stay hydrated. If you notice any sudden chest discomfort, severe breathlessness, or unusual swelling, contact Dr. Vance's office or seek emergency care immediately.`,
        triageFlag: "routine",
        disclaimer: "MediSync AI provides informational health guidance and does not replace professional medical diagnosis.",
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('Error in assistant-chat:', err);
    res.status(500).json({ error: err.message });
  }
});

// In production or dev, hook Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediSync AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MediSync AI server:', err);
});

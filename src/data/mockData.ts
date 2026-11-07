import { Patient, MedicalRecordDoc, PulseGuardAssessment, CareTask, SbarHandoff, CaregiverDailyLog, Appointment, HospitalBed, AuditLogEntry } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-101',
    mrn: 'MRN-78921-EL',
    name: 'Elena Rostova',
    dateOfBirth: '1968-04-12',
    age: 58,
    gender: 'Female',
    bloodType: 'A+',
    heightCm: 165,
    weightKg: 78.5,
    bmi: 28.8,
    phone: '+1 (555) 234-8901',
    email: 'elena.rostova@healthmail.net',
    address: '428 Birchwood Avenue, Suite 3B, Metro City',
    roomBed: 'Ward 4B - Bed 12',
    ward: 'General Medicine',
    primaryPhysician: 'Dr. Marcus Vance, MD (Cardiology / Internal Med)',
    caregiverId: 'cg-201',
    caregiverName: 'David Rostova (Son / Primary Caregiver)',
    insuranceProvider: 'Metro BlueCross PPO',
    insurancePolicyNumber: 'MBC-984410294-01',
    offlineCached: true,
    emergencyContact: {
      name: 'David Rostova',
      relation: 'Son',
      phone: '+1 (555) 492-3118',
      email: 'david.rostova@designmail.com'
    },
    allergies: [
      { id: 'alg-1', allergen: 'Penicillin VK', severity: 'severe', reaction: 'Anaphylactoid urticaria and facial angioedema', diagnosedDate: '2015-08-14' },
      { id: 'alg-2', allergen: 'Sulfa Drugs (Sulfamethoxazole)', severity: 'moderate', reaction: 'Diffuse maculopapular rash', diagnosedDate: '2018-02-11' },
      { id: 'alg-3', allergen: 'Shellfish', severity: 'moderate', reaction: 'Gastrointestinal cramping and localized erythema', diagnosedDate: '2004-06-20' }
    ],
    chronicConditions: [
      { id: 'cond-1', name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9', diagnosedDate: '2016-09-15', status: 'managed', severity: 'moderate', notes: 'Target HbA1c < 7.0%. Currently on Metformin + Empagliflozin' },
      { id: 'cond-2', name: 'Essential Hypertension', icd10: 'I10', diagnosedDate: '2014-03-22', status: 'managed', severity: 'mild', notes: 'Baseline BP 134/84 mmHg on Lisinopril 20mg daily' },
      { id: 'cond-3', name: 'Moderate Persistent Asthma', icd10: 'J45.40', diagnosedDate: '2008-11-05', status: 'active', severity: 'moderate', notes: 'Triggered by seasonal cold air. Prescribed Fluticasone/Salmeterol maintenance' },
      { id: 'cond-4', name: 'Stage 3a Chronic Kidney Disease', icd10: 'N18.31', diagnosedDate: '2023-01-19', status: 'managed', severity: 'mild', notes: 'eGFR fluctuates between 52-58 mL/min/1.73m². Requires annual microalbuminuria tracking' }
    ],
    activeMedications: [
      {
        id: 'med-1',
        name: 'Metformin Hydrochloride ER',
        dosage: '1000 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        prescribedBy: 'Dr. Marcus Vance',
        startDate: '2021-04-10',
        status: 'active',
        instructions: 'Take with morning and evening meals to reduce gastric upset.',
        takenToday: true,
        scheduledTimes: ['08:00', '20:00']
      },
      {
        id: 'med-2',
        name: 'Lisinopril',
        dosage: '20 mg',
        frequency: 'Once daily',
        route: 'Oral',
        prescribedBy: 'Dr. Marcus Vance',
        startDate: '2019-11-02',
        status: 'active',
        instructions: 'Take every morning with full glass of water. Monitor for dry cough.',
        takenToday: true,
        scheduledTimes: ['08:00']
      },
      {
        id: 'med-3',
        name: 'Empagliflozin (Jardiance)',
        dosage: '10 mg',
        frequency: 'Once daily',
        route: 'Oral',
        prescribedBy: 'Dr. Marcus Vance',
        startDate: '2023-05-18',
        status: 'active',
        instructions: 'Take in the morning. Drink plenty of water throughout the day.',
        takenToday: true,
        scheduledTimes: ['08:00']
      },
      {
        id: 'med-4',
        name: 'Fluticasone / Salmeterol (Advair Diskus 250/50)',
        dosage: '1 inhalation',
        frequency: 'Twice daily',
        route: 'Inhalation',
        prescribedBy: 'Dr. Helen Keller',
        startDate: '2022-01-14',
        status: 'active',
        instructions: 'Rinse mouth thoroughly with water after each inhalation.',
        takenToday: false,
        scheduledTimes: ['08:00', '20:00']
      },
      {
        id: 'med-5',
        name: 'Atorvastatin Calcium',
        dosage: '20 mg',
        frequency: 'Once nightly',
        route: 'Oral',
        prescribedBy: 'Dr. Marcus Vance',
        startDate: '2020-07-28',
        status: 'active',
        instructions: 'Take at bedtime for optimal cholesterol synthesis inhibition.',
        takenToday: false,
        scheduledTimes: ['21:00']
      }
    ],
    surgeries: [
      { id: 'surg-1', procedureName: 'Laparoscopic Cholecystectomy', date: '2017-05-14', hospital: 'St. Jude Memorial Hospital', surgeon: 'Dr. Robert Chen, FACS', notes: 'Uncomplicated gallstone excision. Full recovery.' },
      { id: 'surg-2', procedureName: 'Right Carpal Tunnel Release', date: '2021-10-09', hospital: 'Metro Orthopedic Institute', surgeon: 'Dr. Alisha Patel', notes: 'Complete symptom resolution; sensation restored.' }
    ],
    currentVitals: {
      id: 'vit-latest-101',
      timestamp: '2026-11-06T09:30:00Z',
      respiratoryRate: 21,
      spo2: 94,
      onSupplementalOxygen: false,
      systolicBp: 138,
      diastolicBp: 86,
      heartRate: 88,
      temperature: 37.4,
      consciousness: 'Alert',
      bloodGlucose: 142,
      news2Score: 3,
      recordedBy: 'Nurse Sarah Jenkins, RN',
      role: 'nurse',
      synced: true
    },
    pulseGuardStatus: {
      news2: 3,
      riskLevel: 'Medium',
      lastAssessed: '2026-11-06T09:30:00Z'
    }
  },
  {
    id: 'pat-102',
    mrn: 'MRN-44219-AP',
    name: 'Arthur Pendelton',
    dateOfBirth: '1954-08-29',
    age: 72,
    gender: 'Male',
    bloodType: 'O+',
    heightCm: 178,
    weightKg: 89.0,
    bmi: 28.1,
    phone: '+1 (555) 388-1204',
    email: 'arthur.pendelton@postnet.org',
    address: '810 Heritage Pines Way, Oakridge',
    roomBed: 'Step-Down Unit - Bed 04',
    ward: 'Step-Down',
    primaryPhysician: 'Dr. Marcus Vance, MD (Cardiology)',
    caregiverId: 'cg-202',
    caregiverName: 'Martha Pendelton (Spouse)',
    insuranceProvider: 'Medicare Part B + United Senior Care',
    insurancePolicyNumber: 'MED-771920-A',
    offlineCached: true,
    emergencyContact: {
      name: 'Martha Pendelton',
      relation: 'Spouse',
      phone: '+1 (555) 388-1205',
      email: 'martha.pendelton@postnet.org'
    },
    allergies: [
      { id: 'alg-4', allergen: 'Aspirin (ASA)', severity: 'severe', reaction: 'Bronchospasm and severe wheezing', diagnosedDate: '2010-04-18' },
      { id: 'alg-5', allergen: 'IV Contrast Dye (Iodinated)', severity: 'moderate', reaction: 'Generalized pruritus and flushing', diagnosedDate: '2016-11-30' }
    ],
    chronicConditions: [
      { id: 'cond-5', name: 'Congestive Heart Failure (NYHA Class III)', icd10: 'I50.9', diagnosedDate: '2020-03-10', status: 'active', severity: 'severe', notes: 'Reduced EF 35%. Prone to orthopnea and peripheral edema.' },
      { id: 'cond-6', name: 'Permanent Atrial Fibrillation', icd10: 'I48.2', diagnosedDate: '2018-06-25', status: 'managed', severity: 'moderate', notes: 'Anticoagulated with Apixaban 5mg BID.' },
      { id: 'cond-7', name: 'Chronic Obstructive Pulmonary Disease', icd10: 'J44.9', diagnosedDate: '2015-01-14', status: 'active', severity: 'moderate', notes: 'Ex-smoker (40 pack years, quit 2012).' }
    ],
    activeMedications: [
      { id: 'med-6', name: 'Apixaban (Eliquis)', dosage: '5 mg', frequency: 'Twice daily', route: 'Oral', prescribedBy: 'Dr. Marcus Vance', startDate: '2020-03-15', status: 'active', instructions: 'Strict adherence required for stroke prevention in AFib.', takenToday: true, scheduledTimes: ['08:00', '20:00'] },
      { id: 'med-7', name: 'Furosemide (Lasix)', dosage: '40 mg', frequency: 'Daily morning', route: 'Oral', prescribedBy: 'Dr. Marcus Vance', startDate: '2022-08-01', status: 'active', instructions: 'Take in morning to prevent nighttime nocturia.', takenToday: true, scheduledTimes: ['08:00'] },
      { id: 'med-8', name: 'Carvedilol', dosage: '12.5 mg', frequency: 'Twice daily', route: 'Oral', prescribedBy: 'Dr. Marcus Vance', startDate: '2021-02-19', status: 'active', instructions: 'Take with food to slow absorption rate and minimize orthostasis.', takenToday: true, scheduledTimes: ['08:00', '20:00'] }
    ],
    surgeries: [
      { id: 'surg-3', procedureName: 'Biventricular Pacemaker/ICD Implantation', date: '2021-03-22', hospital: 'Metro Heart Hospital', surgeon: 'Dr. Katherine Wu', notes: 'Dual-chamber CRT-D placement. Lead impedance normal.' }
    ],
    currentVitals: {
      id: 'vit-latest-102',
      timestamp: '2026-11-06T10:15:00Z',
      respiratoryRate: 26, // +3
      spo2: 91, // +3 (Scale 1)
      onSupplementalOxygen: true, // +2
      systolicBp: 104, // +1
      diastolicBp: 68,
      heartRate: 114, // +2
      temperature: 38.2, // +1
      consciousness: 'Alert', // 0
      bloodGlucose: 128,
      news2Score: 12, // CRITICAL!
      recordedBy: 'Nurse Sarah Jenkins, RN',
      role: 'nurse',
      synced: true
    },
    pulseGuardStatus: {
      news2: 12,
      riskLevel: 'Critical',
      lastAssessed: '2026-11-06T10:15:00Z'
    }
  },
  {
    id: 'pat-103',
    mrn: 'MRN-33108-ML',
    name: 'Maya Lin',
    dateOfBirth: '1992-06-18',
    age: 34,
    gender: 'Female',
    bloodType: 'B+',
    heightCm: 170,
    weightKg: 62.0,
    bmi: 21.5,
    phone: '+1 (555) 774-9022',
    email: 'maya.lin@studiocreative.org',
    address: '1540 Highland Terrace, Loft 5',
    roomBed: 'Surgical Post-Op - Bed 02',
    ward: 'Surgical Post-Op',
    primaryPhysician: 'Dr. Sarah Higgins, MD (General Surgery)',
    insuranceProvider: 'Aetna Open Choice',
    insurancePolicyNumber: 'AET-401928-8',
    offlineCached: true,
    emergencyContact: {
      name: 'Kenneth Lin',
      relation: 'Brother',
      phone: '+1 (555) 774-9023',
      email: 'kenneth.lin@techcorp.io'
    },
    allergies: [
      { id: 'alg-6', allergen: 'Codeine', severity: 'moderate', reaction: 'Nausea, severe emesis, and dizziness', diagnosedDate: '2019-05-10' }
    ],
    chronicConditions: [
      { id: 'cond-8', name: 'Mild Migraine with Aura', icd10: 'G43.109', diagnosedDate: '2018-09-02', status: 'managed', severity: 'mild', notes: 'Sumatriptan PRN for acute attacks.' }
    ],
    activeMedications: [
      { id: 'med-9', name: 'Cefazolin IV (Post-Op Day 1)', dosage: '1 g', frequency: 'q8h', route: 'Intravenous', prescribedBy: 'Dr. Sarah Higgins', startDate: '2026-11-05', status: 'active', instructions: 'Surgical prophylactic course, discontinue at 24h post-op.', takenToday: true, scheduledTimes: ['06:00', '14:00', '22:00'] },
      { id: 'med-10', name: 'Acetaminophen / Oxycodone (Percocet 5/325)', dosage: '1 tablet', frequency: 'q6h PRN', route: 'Oral', prescribedBy: 'Dr. Sarah Higgins', startDate: '2026-11-05', status: 'active', instructions: 'For acute surgical incisional pain > 4/10.', takenToday: false, scheduledTimes: ['12:00', '18:00'] }
    ],
    surgeries: [
      { id: 'surg-4', procedureName: 'Emergency Laparoscopic Appendectomy', date: '2026-11-05', hospital: 'Metro General Hospital', surgeon: 'Dr. Sarah Higgins, MD', notes: 'Suppurative unruptured appendicitis. Clear margins.' }
    ],
    currentVitals: {
      id: 'vit-latest-103',
      timestamp: '2026-11-06T08:00:00Z',
      respiratoryRate: 15,
      spo2: 99,
      onSupplementalOxygen: false,
      systolicBp: 118,
      diastolicBp: 76,
      heartRate: 72,
      temperature: 36.9,
      consciousness: 'Alert',
      bloodGlucose: 96,
      news2Score: 0,
      recordedBy: 'Nurse Sarah Jenkins, RN',
      role: 'nurse',
      synced: true
    },
    pulseGuardStatus: {
      news2: 0,
      riskLevel: 'Low',
      lastAssessed: '2026-11-06T08:00:00Z'
    }
  },
  {
    id: 'pat-104',
    mrn: 'MRN-88192-CM',
    name: 'Carlos Mendez',
    dateOfBirth: '1981-12-03',
    age: 45,
    gender: 'Male',
    bloodType: 'O-',
    heightCm: 175,
    weightKg: 82.0,
    bmi: 26.8,
    phone: '+1 (555) 912-4431',
    email: 'carlos.mendez@logistics.net',
    address: '670 Palm Grove Drive, Apartment 12',
    roomBed: 'Ward 3A - Bed 08',
    ward: 'General Medicine',
    primaryPhysician: 'Dr. Alistair Finch, MD (Gastroenterology)',
    insuranceProvider: 'Cigna HealthSpring',
    insurancePolicyNumber: 'CIG-8820491-02',
    offlineCached: true,
    emergencyContact: {
      name: 'Sofia Mendez',
      relation: 'Spouse',
      phone: '+1 (555) 912-4432',
      email: 'sofia.mendez@logistics.net'
    },
    allergies: [
      { id: 'alg-7', allergen: 'Latex', severity: 'moderate', reaction: 'Contact dermatitis and localized edema', diagnosedDate: '2012-07-19' }
    ],
    chronicConditions: [
      { id: 'cond-9', name: 'Acute Interstitial Pancreatitis', icd10: 'K85.90', diagnosedDate: '2026-11-04', status: 'active', severity: 'severe', notes: 'Triggered by biliary microcalculi. NPO, aggressive fluid resuscitation.' },
      { id: 'cond-10', name: 'Hypertriglyceridemia', icd10: 'E78.1', diagnosedDate: '2022-04-11', status: 'managed', severity: 'moderate', notes: 'Triglycerides historically > 350 mg/dL.' }
    ],
    activeMedications: [
      { id: 'med-11', name: 'Lactated Ringer IV Infusion', dosage: '175 mL/hr', frequency: 'Continuous', route: 'Intravenous', prescribedBy: 'Dr. Alistair Finch', startDate: '2026-11-04', status: 'active', instructions: 'Monitor urine output hourly (> 0.5 mL/kg/hr target).', takenToday: true, scheduledTimes: ['Continuous'] },
      { id: 'med-12', name: 'Hydromorphone (Dilaudid)', dosage: '0.5 mg IV', frequency: 'q3h PRN', route: 'Intravenous', prescribedBy: 'Dr. Alistair Finch', startDate: '2026-11-04', status: 'active', instructions: 'For breakthrough epigastric pain.', takenToday: true, scheduledTimes: ['09:00', '15:00'] }
    ],
    surgeries: [],
    currentVitals: {
      id: 'vit-latest-104',
      timestamp: '2026-11-06T09:00:00Z',
      respiratoryRate: 22, // +2
      spo2: 95, // +1
      onSupplementalOxygen: false, // 0
      systolicBp: 112, // 0
      diastolicBp: 74,
      heartRate: 102, // +1
      temperature: 37.9, // 0
      consciousness: 'Alert', // 0
      bloodGlucose: 154,
      news2Score: 4, // Medium
      recordedBy: 'Nurse James Murphy, RN',
      role: 'nurse',
      synced: true
    },
    pulseGuardStatus: {
      news2: 4,
      riskLevel: 'Medium',
      lastAssessed: '2026-11-06T09:00:00Z'
    }
  },
  {
    id: 'pat-105',
    mrn: 'MRN-55913-FA',
    name: 'Fatima Al-Zahra',
    dateOfBirth: '1964-03-21',
    age: 62,
    gender: 'Female',
    bloodType: 'AB+',
    heightCm: 160,
    weightKg: 71.0,
    bmi: 27.7,
    phone: '+1 (555) 603-7819',
    email: 'fatima.alzahra@globalhealth.org',
    address: '904 Cedar Crest Boulevard, Unit 4',
    roomBed: 'Ward 2C - Bed 15',
    ward: 'General Medicine',
    primaryPhysician: 'Dr. Marcus Vance, MD (Pulmonology)',
    insuranceProvider: 'Kaiser Foundation Health',
    insurancePolicyNumber: 'KF-2940182-3',
    offlineCached: false,
    emergencyContact: {
      name: 'Tariq Al-Zahra',
      relation: 'Daughter',
      phone: '+1 (555) 603-7820',
      email: 'tariq.alzahra@globalhealth.org'
    },
    allergies: [
      { id: 'alg-8', allergen: 'Morphine', severity: 'severe', reaction: 'Severe bronchospasm and hypotension', diagnosedDate: '2011-09-04' }
    ],
    chronicConditions: [
      { id: 'cond-11', name: 'COPD Exacerbation with Hypercapnia', icd10: 'J44.1', diagnosedDate: '2026-11-03', status: 'active', severity: 'moderate', notes: 'Target SpO2 88-92% (Scale 2 protocol). Avoid over-oxygenation.' }
    ],
    activeMedications: [
      { id: 'med-13', name: 'Ipratropium / Albuterol (DuoNeb)', dosage: '3 mL nebulized', frequency: 'q4h', route: 'Inhalation', prescribedBy: 'Dr. Marcus Vance', startDate: '2026-11-03', status: 'active', instructions: 'Administer via mouthpiece or face mask.', takenToday: true, scheduledTimes: ['08:00', '12:00', '16:00', '20:00'] },
      { id: 'med-14', name: 'Prednisone', dosage: '40 mg', frequency: 'Daily morning', route: 'Oral', prescribedBy: 'Dr. Marcus Vance', startDate: '2026-11-03', status: 'active', instructions: '5-day short burst for acute COPD flare.', takenToday: true, scheduledTimes: ['08:00'] }
    ],
    surgeries: [],
    currentVitals: {
      id: 'vit-latest-105',
      timestamp: '2026-11-06T08:45:00Z',
      respiratoryRate: 23,
      spo2: 90,
      onSupplementalOxygen: true,
      systolicBp: 142,
      diastolicBp: 88,
      heartRate: 94,
      temperature: 37.1,
      consciousness: 'Alert',
      news2Score: 5,
      recordedBy: 'Nurse Sarah Jenkins, RN',
      role: 'nurse',
      synced: true
    },
    pulseGuardStatus: {
      news2: 5,
      riskLevel: 'High',
      lastAssessed: '2026-11-06T08:45:00Z'
    }
  }
];

export const INITIAL_RECORDS: MedicalRecordDoc[] = [
  {
    id: 'rec-001',
    patientId: 'pat-101',
    title: 'Comprehensive Metabolic & Lipid Panel',
    category: 'Laboratory',
    documentDate: '2026-11-05',
    uploadedAt: '2026-11-05T14:20:00Z',
    facility: 'Metro Central Diagnostic Laboratory',
    doctorName: 'Dr. Marcus Vance, MD',
    fileType: 'pdf',
    fileSize: '1.4 MB',
    originalFileName: 'CMP_Lipid_Panel_Rostova_Nov2026.pdf',
    summaryPatient: 'Your test results show that your kidney function is stable, and blood electrolytes (sodium and potassium) are in healthy balance. Your blood sugar is slightly higher than desired at 142 mg/dL, so keeping consistent with your meal timing and medication is important.',
    summaryDoctor: 'Comprehensive metabolic panel reveals fasting plasma glucose of 142 mg/dL (elevated). Serum creatinine 1.28 mg/dL with eGFR 56 mL/min/1.73m² (consistent with baseline Stage 3a CKD). Lipid panel: Total cholesterol 194 mg/dL, LDL-C 108 mg/dL, HDL-C 48 mg/dL, Triglycerides 190 mg/dL. Hepatic transaminases AST 24 U/L, ALT 28 U/L within normal limits.',
    tags: ['Metabolic Panel', 'Kidney Function', 'Diabetes', 'Lipids'],
    isDuplicateRisk: false,
    status: 'verified',
    ocrConfidence: 99,
    extractedValues: [
      { id: 'ev-1', testName: 'Fasting Blood Glucose', value: '142', unit: 'mg/dL', referenceRange: '70 - 99', status: 'high', confidence: 99, sourceLine: 'GLUCOSE, FASTING: 142 mg/dL [Reference: 70 - 99 mg/dL]' },
      { id: 'ev-2', testName: 'Hemoglobin A1c', value: '7.4', unit: '%', referenceRange: '< 5.7', status: 'high', confidence: 98, sourceLine: 'HEMOGLOBIN A1c: 7.4 % [Target < 7.0%]' },
      { id: 'ev-3', testName: 'Serum Creatinine', value: '1.28', unit: 'mg/dL', referenceRange: '0.60 - 1.20', status: 'high', confidence: 99, sourceLine: 'CREATININE: 1.28 mg/dL [0.60 - 1.20 mg/dL]' },
      { id: 'ev-4', testName: 'eGFR (CKD-EPI)', value: '56', unit: 'mL/min/1.73m²', referenceRange: '> 60', status: 'low', confidence: 97, sourceLine: 'eGFR: 56 mL/min/1.73m² [Stage 3a CKD]' },
      { id: 'ev-5', testName: 'Sodium (Na+)', value: '139', unit: 'mEq/L', referenceRange: '136 - 145', status: 'normal', confidence: 99, sourceLine: 'SODIUM: 139 mEq/L [136 - 145 mEq/L]' },
      { id: 'ev-6', testName: 'Potassium (K+)', value: '4.3', unit: 'mEq/L', referenceRange: '3.5 - 5.1', status: 'normal', confidence: 99, sourceLine: 'POTASSIUM: 4.3 mEq/L [3.5 - 5.1 mEq/L]' },
      { id: 'ev-7', testName: 'Blood Urea Nitrogen (BUN)', value: '22', unit: 'mg/dL', referenceRange: '7 - 20', status: 'high', confidence: 98, sourceLine: 'BUN: 22 mg/dL [7 - 20 mg/dL]' },
      { id: 'ev-8', testName: 'Total Cholesterol', value: '194', unit: 'mg/dL', referenceRange: '< 200', status: 'normal', confidence: 99, sourceLine: 'CHOLESTEROL, TOTAL: 194 mg/dL [< 200 mg/dL]' },
      { id: 'ev-9', testName: 'LDL Cholesterol', value: '108', unit: 'mg/dL', referenceRange: '< 100', status: 'high', confidence: 98, sourceLine: 'LDL CALCULATED: 108 mg/dL [< 100 mg/dL]' },
      { id: 'ev-10', testName: 'Triglycerides', value: '190', unit: 'mg/dL', referenceRange: '< 150', status: 'high', confidence: 99, sourceLine: 'TRIGLYCERIDES: 190 mg/dL [< 150 mg/dL]' }
    ],
    simplifiedTerms: [
      { term: 'eGFR', explanation: 'Estimated Glomerular Filtration Rate: A gauge of kidney efficiency. Normal is over 60; yours at 56 indicates mild, stable chronic kidney filtration reduction.' },
      { term: 'HbA1c', explanation: 'A 3-month rolling average of your blood glucose levels. At 7.4%, it is slightly above target.' },
      { term: 'BUN & Creatinine', explanation: 'Waste products that healthy kidneys filter out. Slight elevations reflect mild kidney workload.' }
    ],
    rawContentSnippet: `METRO CENTRAL DIAGNOSTIC LABORATORY\nPATIENT: Elena Rostova | DOB: 04/12/1968 | MRN: 78921-EL\nORDERING MD: Dr. Marcus Vance, MD\nCOLLECTION DATE: 11/05/2026 07:15 AM\n\nCOMPREHENSIVE METABOLIC PANEL\nGLUCOSE, FASTING: 142 mg/dL [H] (Ref: 70 - 99)\nHEMOGLOBIN A1c: 7.4 % [H] (Ref: < 5.7)\nCREATININE: 1.28 mg/dL [H] (Ref: 0.60 - 1.20)\neGFR: 56 mL/min/1.73m2 [L] (Ref: > 60)\nSODIUM: 139 mEq/L (Ref: 136 - 145)\nPOTASSIUM: 4.3 mEq/L (Ref: 3.5 - 5.1)\nBUN: 22 mg/dL [H] (Ref: 7 - 20)\n\nLIPID PANEL\nCHOLESTEROL TOTAL: 194 mg/dL (Ref: < 200)\nLDL CHOLESTEROL: 108 mg/dL [H] (Ref: < 100)\nTRIGLYCERIDES: 190 mg/dL [H] (Ref: < 150)`
  },
  {
    id: 'rec-002',
    patientId: 'pat-101',
    title: 'Historic Lab Panel (3 Months Prior)',
    category: 'Laboratory',
    documentDate: '2026-08-10',
    uploadedAt: '2026-08-11T10:00:00Z',
    facility: 'Metro Central Diagnostic Laboratory',
    doctorName: 'Dr. Marcus Vance, MD',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    originalFileName: 'CMP_Lipid_Panel_Rostova_Aug2026.pdf',
    summaryPatient: 'Historical baseline lab report from August 2026 showing HbA1c at 7.8% and Fasting Blood Glucose at 158 mg/dL.',
    summaryDoctor: 'Baseline metabolic parameters prior to empagliflozin titration. HbA1c 7.8%, Fasting Glucose 158 mg/dL, Creatinine 1.25 mg/dL, eGFR 58 mL/min/1.73m².',
    tags: ['Metabolic Panel', 'Historical Baseline'],
    isDuplicateRisk: false,
    status: 'verified',
    ocrConfidence: 99,
    extractedValues: [
      { id: 'ev-11', testName: 'Fasting Blood Glucose', value: '158', unit: 'mg/dL', referenceRange: '70 - 99', status: 'high', confidence: 99, sourceLine: 'GLUCOSE, FASTING: 158 mg/dL [70-99]' },
      { id: 'ev-12', testName: 'Hemoglobin A1c', value: '7.8', unit: '%', referenceRange: '< 5.7', status: 'high', confidence: 98, sourceLine: 'HEMOGLOBIN A1c: 7.8 % [<5.7]' },
      { id: 'ev-13', testName: 'Serum Creatinine', value: '1.25', unit: 'mg/dL', referenceRange: '0.60 - 1.20', status: 'high', confidence: 99, sourceLine: 'CREATININE: 1.25 mg/dL [0.60-1.20]' },
      { id: 'ev-14', testName: 'eGFR (CKD-EPI)', value: '58', unit: 'mL/min/1.73m²', referenceRange: '> 60', status: 'low', confidence: 97, sourceLine: 'eGFR: 58 mL/min/1.73m² [>60]' }
    ],
    simplifiedTerms: [
      { term: 'HbA1c Delta', explanation: 'Comparison shows an improvement from 7.8% in August to 7.4% in November, demonstrating therapy success.' }
    ]
  },
  {
    id: 'rec-003',
    patientId: 'pat-101',
    title: 'Duplicate Ordered Metabolic Panel (Alert)',
    category: 'Laboratory',
    documentDate: '2026-11-06',
    uploadedAt: '2026-11-06T08:10:00Z',
    facility: 'St. Jude Outpatient Clinic',
    fileType: 'pdf',
    fileSize: '0.9 MB',
    originalFileName: 'Clinic_Recheck_CMP.pdf',
    summaryPatient: 'Duplicate test alert: A complete metabolic panel was already performed less than 24 hours ago at Metro Central Diagnostic Lab.',
    summaryDoctor: 'DUPLICATE TEST WARNING: Comprehensive metabolic panel ordered 24 hours post-index CMP. No acute shift in renal status indicated. Recommendation: Cancel duplicate order to spare patient venipuncture and healthcare expenditure.',
    tags: ['Duplicate Alert', 'Safety Warning', 'Laboratory'],
    isDuplicateRisk: true,
    duplicateNotes: 'Identical CMP and electrolyte battery ordered within 24 hours of existing verified record rec-001.',
    status: 'pending_review',
    ocrConfidence: 96,
    extractedValues: [
      { id: 'ev-15', testName: 'Fasting Blood Glucose', value: '140', unit: 'mg/dL', referenceRange: '70 - 99', status: 'high', confidence: 96, sourceLine: 'GLUCOSE: 140 mg/dL' },
      { id: 'ev-16', testName: 'Serum Creatinine', value: '1.27', unit: 'mg/dL', referenceRange: '0.60 - 1.20', status: 'high', confidence: 95, sourceLine: 'CREATININE: 1.27 mg/dL' }
    ],
    simplifiedTerms: [
      { term: 'Duplicate Test Alert', explanation: 'MediSync AI detected this test was done yesterday. You usually do not need to repeat this test so soon.' }
    ]
  },
  {
    id: 'rec-004',
    patientId: 'pat-101',
    title: 'Old Handwritten Paper Record (Digitized)',
    category: 'Paper Scan',
    documentDate: '2019-04-18',
    uploadedAt: '2026-11-06T09:00:00Z',
    facility: 'Dr. Gregory House Family Practice',
    doctorName: 'Dr. Gregory House, MD',
    fileType: 'scan',
    fileSize: '3.1 MB',
    originalFileName: 'Scanned_Paper_Clinic_Visit_2019.jpg',
    summaryPatient: 'Old handwritten clinic notes digitized into your electronic record. Documents your initial blood pressure reading and medication initiation.',
    summaryDoctor: 'Historical clinic note from 2019 digitized via OCR. Records initial essential hypertension diagnosis, initiation of Lisinopril 10mg daily, and confirmed allergy to Penicillin.',
    tags: ['Paper Scan', 'OCR Digitization', 'Historical'],
    isDuplicateRisk: false,
    status: 'verified',
    ocrConfidence: 89,
    extractedValues: [
      { id: 'ev-17', testName: 'Resting Blood Pressure', value: '148/92', unit: 'mmHg', referenceRange: '< 120/80', status: 'high', confidence: 88, sourceLine: 'BP seated right arm: 148/92 mmHg' },
      { id: 'ev-18', testName: 'Heart Rate (Resting)', value: '78', unit: 'bpm', referenceRange: '60 - 100', status: 'normal', confidence: 91, sourceLine: 'P: 78 bpm regular' },
      { id: 'ev-19', testName: 'Weight (Paper Record)', value: '82.1', unit: 'kg', referenceRange: 'N/A', status: 'normal', confidence: 85, sourceLine: 'Wt: 82.1 kg (mild obesity)' }
    ],
    simplifiedTerms: [
      { term: 'OCR Paper Digitization', explanation: 'MediSync AI converted your old physical paper document into searchable digital text so no history is lost.' }
    ],
    rawContentSnippet: `PHYSICAL PAPER CHART #88219\nDate: 04/18/2019 | Patient: Elena Rostova\nSubjective: Pt presents with mild occipital morning headaches. Denies blurred vision.\nVitals: BP seated right arm: 148/92 mmHg | P: 78 bpm regular | Wt: 82.1 kg\nImpression: Stage 1 Essential Hypertension.\nPlan: Start Lisinopril 10mg PO daily. Low sodium diet. F/U 4 weeks.`
  },
  {
    id: 'rec-005',
    patientId: 'pat-102',
    title: 'High-Sensitivity Cardiac Troponin & BNP',
    category: 'Laboratory',
    documentDate: '2026-11-06',
    uploadedAt: '2026-11-06T10:05:00Z',
    facility: 'Metro Heart Institute Rapid Diagnostics',
    doctorName: 'Dr. Marcus Vance, MD',
    fileType: 'pdf',
    fileSize: '1.1 MB',
    originalFileName: 'Troponin_BNP_Arthur_Pendelton.pdf',
    summaryPatient: 'Urgent cardiac blood marker test. Shows elevated stress on the heart muscles requiring immediate clinical attention and medication adjustments.',
    summaryDoctor: 'CRITICAL VALUE ALERT: High-sensitivity Cardiac Troponin I (hs-cTnI) elevated at 64 ng/L (ref < 14 ng/L). NT-proBNP 4,820 pg/mL (severely elevated, reflecting acute decompensated congestive heart failure). Patient is symptomatic with tachypnea and tachycardia.',
    tags: ['Cardiology', 'Critical Alert', 'Heart Failure'],
    isDuplicateRisk: false,
    status: 'verified',
    ocrConfidence: 99,
    extractedValues: [
      { id: 'ev-20', testName: 'hs-Cardiac Troponin I', value: '64', unit: 'ng/L', referenceRange: '< 14', status: 'critical', confidence: 99, sourceLine: 'hs-cTnI: 64 ng/L [CRITICAL HIGH - Ref < 14 ng/L]' },
      { id: 'ev-21', testName: 'NT-proBNP', value: '4820', unit: 'pg/mL', referenceRange: '< 450', status: 'critical', confidence: 98, sourceLine: 'NT-proBNP: 4,820 pg/mL [Ref < 450 pg/mL in <75yo]' },
      { id: 'ev-22', testName: 'Serum Potassium', value: '3.6', unit: 'mEq/L', referenceRange: '3.5 - 5.1', status: 'normal', confidence: 99, sourceLine: 'POTASSIUM: 3.6 mEq/L' }
    ],
    simplifiedTerms: [
      { term: 'Troponin I', explanation: 'A protein released when heart muscle cells experience stress or injury.' },
      { term: 'NT-proBNP', explanation: 'A hormone produced by heart chambers when under excess pressure or fluid stretch.' }
    ]
  }
];

export const INITIAL_VITALS_HISTORY: Record<string, any[]> = {
  'pat-101': [
    { time: '04:00', rr: 18, spo2: 96, hr: 74, bp: '130/82', temp: 36.8, news2: 0 },
    { time: '06:00', rr: 18, spo2: 96, hr: 76, bp: '132/84', temp: 36.9, news2: 0 },
    { time: '08:00', rr: 19, spo2: 95, hr: 82, bp: '136/85', temp: 37.1, news2: 1 },
    { time: '09:30', rr: 21, spo2: 94, hr: 88, bp: '138/86', temp: 37.4, news2: 3 }
  ],
  'pat-102': [
    { time: '02:00', rr: 18, spo2: 95, hr: 82, bp: '128/78', temp: 37.0, news2: 1 },
    { time: '04:00', rr: 20, spo2: 94, hr: 88, bp: '122/75', temp: 37.2, news2: 2 },
    { time: '06:00', rr: 22, spo2: 93, hr: 96, bp: '116/72', temp: 37.5, news2: 4 },
    { time: '08:00', rr: 24, spo2: 92, hr: 104, bp: '110/70', temp: 37.9, news2: 7 },
    { time: '10:15', rr: 26, spo2: 91, hr: 114, bp: '104/68', temp: 38.2, news2: 12 }
  ]
};

export const INITIAL_CARE_TASKS: CareTask[] = [
  {
    id: 'task-1',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    roomBed: 'Ward 4B - Bed 12',
    title: 'Pre-lunch capillary blood glucose & insulin check',
    description: 'Check fingerstick blood glucose before noon meal. If > 180 mg/dL, apply sliding scale as per protocol.',
    category: 'medication',
    dueTime: '11:45',
    priority: 'urgent',
    assignedTo: 'Nurse Sarah Jenkins, RN',
    assignedRole: 'nurse',
    completed: false
  },
  {
    id: 'task-2',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    roomBed: 'Ward 4B - Bed 12',
    title: 'Repeat NEWS2 vital sign escalation check',
    description: 'Recheck respiratory rate and pulse oximetry. Current score is 3. Report any elevation > 4 immediately.',
    category: 'vitals',
    dueTime: '13:30',
    priority: 'routine',
    assignedTo: 'Nurse Sarah Jenkins, RN',
    assignedRole: 'nurse',
    completed: false
  },
  {
    id: 'task-3',
    patientId: 'pat-102',
    patientName: 'Arthur Pendelton',
    roomBed: 'Step-Down Unit - Bed 04',
    title: 'CRITICAL: Rapid Response Escalation Review',
    description: 'Patient NEWS2 score triggered 12 with elevated hs-Troponin. Rapid Response Team notified. Titrate supplemental oxygen to maintain SpO2 92-96%.',
    category: 'vitals',
    dueTime: '10:30',
    priority: 'stat',
    assignedTo: 'Dr. Marcus Vance, MD',
    assignedRole: 'doctor',
    completed: false
  },
  {
    id: 'task-4',
    patientId: 'pat-103',
    patientName: 'Maya Lin',
    roomBed: 'Surgical Post-Op - Bed 02',
    title: 'Post-op surgical wound dressing evaluation',
    description: 'Inspect right lower quadrant laparoscopic port dressings for hematoma, erythema, or purulent exudate.',
    category: 'wound_care',
    dueTime: '14:00',
    priority: 'routine',
    assignedTo: 'Nurse Sarah Jenkins, RN',
    assignedRole: 'nurse',
    completed: true,
    completedAt: '2026-11-06T09:15:00Z',
    completedBy: 'Nurse Sarah Jenkins, RN',
    notes: 'Incision sites clean, intact, minimal serosanguinous drainage.'
  },
  {
    id: 'task-5',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    roomBed: 'Ward 4B - Bed 12',
    title: 'Caregiver Daily Dietary Sodium Counseling',
    description: 'Review low-sodium food list with David Rostova (Caregiver) before weekend discharge planning.',
    category: 'handoff',
    dueTime: '15:00',
    priority: 'routine',
    assignedTo: 'David Rostova (Caregiver)',
    assignedRole: 'caregiver',
    completed: false
  }
];

export const INITIAL_SBAR_HANDOFFS: SbarHandoff[] = [
  {
    id: 'sbar-1',
    patientId: 'pat-101',
    outgoingStaff: 'Nurse Chloe Evans, RN (Night Shift)',
    incomingStaff: 'Nurse Sarah Jenkins, RN (Day Shift)',
    timestamp: '2026-11-06T07:00:00Z',
    shift: 'Night to Day',
    situation: 'Elena Rostova is a 58-year-old female admitted with mild asthma exacerbation and uncontrolled hyperglycemia.',
    background: 'History of T2DM, HTN, asthma, stage 3a CKD. Currently on oral hypoglycemics and bronchodilator inhalers.',
    assessment: 'Vitals stable overnight, though respiratory rate slightly trending up from 18 to 21/min this morning. Blood sugar was 142 mg/dL fasting.',
    recommendation: 'Reassess lung sounds after 08:00 nebulizer treatment, verify pre-lunch blood sugar, and confirm repeat CMP order cancellation due to duplicate alert.',
    acknowledgedByIncoming: true
  },
  {
    id: 'sbar-2',
    patientId: 'pat-102',
    outgoingStaff: 'Nurse Sarah Jenkins, RN',
    incomingStaff: 'Dr. Marcus Vance, MD (Attending)',
    timestamp: '2026-11-06T10:20:00Z',
    shift: 'Day to Evening',
    situation: 'Arthur Pendelton has experienced acute clinical deterioration with severe shortness of breath, diaphoresis, and NEWS2 score rising to 12.',
    background: '72yo male with severe systolic heart failure (EF 35%), AFib on Eliquis, and COPD.',
    assessment: 'HR 114 bpm, RR 26/min, SpO2 91% on room air placed on 3L nasal cannula. New hs-Troponin I elevated at 64 ng/L and NT-proBNP at 4,820 pg/mL.',
    recommendation: 'Immediate bedside cardiology evaluation. Order STAT 12-lead ECG, bedside echocardiogram, and evaluate for IV Furosemide or ICU transfer.',
    acknowledgedByIncoming: true
  }
];

export const INITIAL_CAREGIVER_LOGS: CaregiverDailyLog[] = [
  {
    id: 'cg-log-1',
    patientId: 'pat-101',
    date: '2026-11-06',
    time: '08:30 AM',
    caregiverName: 'David Rostova',
    medicationsTaken: true,
    medicationPhotoUrl: 'med_verification_nov6.jpg',
    mealIntake: 'full',
    fluidIntakeOz: 24,
    bloodSugar: 142,
    morningBp: '138/86',
    mobilityStatus: 'independent',
    moodRating: 'cheerful',
    notes: 'Elena took morning Metformin and Lisinopril on time with oatmeal and unsweetened tea. Walked hallway for 15 minutes.'
  },
  {
    id: 'cg-log-2',
    patientId: 'pat-101',
    date: '2026-11-05',
    time: '08:15 AM',
    caregiverName: 'David Rostova',
    medicationsTaken: true,
    mealIntake: 'partial',
    fluidIntakeOz: 32,
    bloodSugar: 148,
    morningBp: '136/84',
    mobilityStatus: 'independent',
    moodRating: 'calm',
    notes: 'Slight morning cough, resolved after drinking warm water. All morning tablets confirmed taken.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    doctorName: 'Dr. Marcus Vance, MD',
    specialty: 'Internal Medicine & Cardiology',
    date: '2026-11-12',
    time: '10:00 AM',
    durationMinutes: 30,
    type: 'In-Person',
    location: 'Metro Clinic, Room 302',
    status: 'upcoming',
    purpose: 'Quarterly Diabetes & Renal Health Comprehensive Review',
    preparationNotes: 'Bring morning blood glucose logbook and latest medication boxes.'
  },
  {
    id: 'apt-2',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    doctorName: 'Dr. Marcus Vance, MD',
    specialty: 'Cardiology Telehealth',
    date: '2026-11-20',
    time: '02:30 PM',
    durationMinutes: 20,
    type: 'Telemedicine Video',
    location: 'Secure MediSync Telehealth Room',
    status: 'upcoming',
    telemedUrl: 'https://telehealth.medisync.ai/room/elena-rostova-nov20',
    purpose: 'Blood Pressure & Home Vitals Tele-consultation',
    preparationNotes: 'Have home blood pressure cuff ready for live reading verification.'
  },
  {
    id: 'apt-3',
    patientId: 'pat-102',
    patientName: 'Arthur Pendelton',
    doctorName: 'Dr. Marcus Vance, MD',
    specialty: 'Heart Failure Clinic',
    date: '2026-11-08',
    time: '09:00 AM',
    durationMinutes: 45,
    type: 'In-Person',
    location: 'Cardiovascular Care Pavilion, Suite A',
    status: 'upcoming',
    purpose: 'Post-Deterioration Echocardiogram and Inotrope Review',
    preparationNotes: 'Wheelchair transport arranged from Ward.'
  }
];

export const INITIAL_HOSPITAL_BEDS: HospitalBed[] = [
  { id: 'bed-1', ward: 'ICU', bedNumber: 'ICU-01', status: 'occupied', patientId: 'pat-99', patientName: 'John Doe (Trauma)', patientNews2: 14, assignedNurse: 'Nurse Rachel Adams, BSN' },
  { id: 'bed-2', ward: 'ICU', bedNumber: 'ICU-02', status: 'available' },
  { id: 'bed-3', ward: 'Step-Down', bedNumber: 'SD-04', status: 'occupied', patientId: 'pat-102', patientName: 'Arthur Pendelton', patientNews2: 12, assignedNurse: 'Nurse Sarah Jenkins, RN' },
  { id: 'bed-4', ward: 'Step-Down', bedNumber: 'SD-05', status: 'available' },
  { id: 'bed-5', ward: 'General Medicine', bedNumber: 'GM-12', status: 'occupied', patientId: 'pat-101', patientName: 'Elena Rostova', patientNews2: 3, assignedNurse: 'Nurse Sarah Jenkins, RN' },
  { id: 'bed-6', ward: 'General Medicine', bedNumber: 'GM-14', status: 'occupied', patientId: 'pat-104', patientName: 'Carlos Mendez', patientNews2: 4, assignedNurse: 'Nurse James Murphy, RN' },
  { id: 'bed-7', ward: 'General Medicine', bedNumber: 'GM-15', status: 'occupied', patientId: 'pat-105', patientName: 'Fatima Al-Zahra', patientNews2: 5, assignedNurse: 'Nurse Sarah Jenkins, RN' },
  { id: 'bed-8', ward: 'General Medicine', bedNumber: 'GM-16', status: 'cleaning' },
  { id: 'bed-9', ward: 'Surgical Post-Op', bedNumber: 'SPO-02', status: 'occupied', patientId: 'pat-103', patientName: 'Maya Lin', patientNews2: 0, assignedNurse: 'Nurse Lisa Chang, RN' },
  { id: 'bed-10', ward: 'Surgical Post-Op', bedNumber: 'SPO-03', status: 'available' }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-11-06T10:15:30Z',
    userId: 'usr-nurse-1',
    userName: 'Nurse Sarah Jenkins, RN',
    userRole: 'nurse',
    action: 'RECORD_VITALS',
    resourceType: 'VitalSignReading',
    resourceId: 'vit-latest-102',
    patientId: 'pat-102',
    patientName: 'Arthur Pendelton',
    details: 'NEWS2 Score 12 entered: RR 26, SpO2 91% on O2, SBP 104, HR 114, Temp 38.2C. Escalation triggered.',
    ipAddress: '10.24.18.102 (Hospital Secure Intranet)'
  },
  {
    id: 'aud-002',
    timestamp: '2026-11-06T09:32:10Z',
    userId: 'usr-nurse-1',
    userName: 'Nurse Sarah Jenkins, RN',
    userRole: 'nurse',
    action: 'RECORD_VITALS',
    resourceType: 'VitalSignReading',
    resourceId: 'vit-latest-101',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    details: 'NEWS2 Score 3 entered: RR 21, SpO2 94%, SBP 138, HR 88, Temp 37.4C.',
    ipAddress: '10.24.18.102 (Hospital Secure Intranet)'
  },
  {
    id: 'aud-003',
    timestamp: '2026-11-06T08:12:44Z',
    userId: 'usr-doc-1',
    userName: 'Dr. Marcus Vance, MD',
    userRole: 'doctor',
    action: 'VIEW_RECORD',
    resourceType: 'MedicalRecordDoc',
    resourceId: 'rec-003',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    details: 'Reviewed duplicate test alert. Flagged redundant CMP order for cancellation.',
    ipAddress: '10.24.16.55 (Cardiology Workstation)'
  },
  {
    id: 'aud-004',
    timestamp: '2026-11-06T07:10:00Z',
    userId: 'usr-nurse-1',
    userName: 'Nurse Sarah Jenkins, RN',
    userRole: 'nurse',
    action: 'APPROVE_NOTE',
    resourceType: 'SbarHandoff',
    resourceId: 'sbar-1',
    patientId: 'pat-101',
    patientName: 'Elena Rostova',
    details: 'Shift handoff acknowledged and accepted for Ward 4B.',
    ipAddress: '10.24.18.102 (Hospital Secure Intranet)'
  }
];

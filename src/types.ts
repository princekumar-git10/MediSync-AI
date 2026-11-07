export type UserRole = 'patient' | 'doctor' | 'nurse' | 'caregiver' | 'admin';

export type NetworkStatus = 'online' | 'offline' | 'poor';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
  takenToday?: boolean;
  scheduledTimes: string[];
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  reaction: string;
  diagnosedDate: string;
}

export interface SurgeryHistory {
  id: string;
  procedureName: string;
  date: string;
  hospital: string;
  surgeon: string;
  notes: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  icd10: string;
  diagnosedDate: string;
  status: 'active' | 'managed' | 'resolved';
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

export interface VitalSignReading {
  id: string;
  timestamp: string;
  respiratoryRate: number; // breaths/min (normal 12-20)
  spo2: number; // percentage (normal 95-100)
  onSupplementalOxygen: boolean;
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  heartRate: number; // bpm (normal 60-100)
  temperature: number; // Celsius (e.g. 37.0)
  consciousness: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive'; // ACVPU
  bloodGlucose?: number; // mg/dL
  news2Score: number;
  recordedBy: string;
  role: string;
  synced: boolean;
}

export interface ExtractedLabValue {
  id: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  confidence: number; // 0-100%
  sourceLine: string; // Exact trace back to document
  flaggedForReview?: boolean;
}

export interface MedicalRecordDoc {
  id: string;
  patientId: string;
  title: string;
  category: 'Laboratory' | 'Imaging' | 'Discharge Summary' | 'Prescription' | 'Cardiology' | 'Pathology' | 'Paper Scan';
  documentDate: string;
  uploadedAt: string;
  facility: string;
  doctorName?: string;
  fileType: 'pdf' | 'image' | 'scan';
  fileSize: string;
  originalFileName: string;
  summaryPatient: string;
  summaryDoctor: string;
  extractedValues: ExtractedLabValue[];
  simplifiedTerms: Array<{ term: string; explanation: string }>;
  tags: string[];
  isDuplicateRisk?: boolean;
  duplicateNotes?: string;
  status: 'verified' | 'pending_review' | 'manual_override';
  ocrConfidence: number; // Average OCR confidence
  rawContentSnippet?: string;
}

export interface PulseGuardAssessment {
  id: string;
  patientId: string;
  timestamp: string;
  news2Score: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  physiologicalMechanism: string;
  immediateActions: string[];
  deteriorationTrajectory: string;
  differentialAlerts?: string[];
  vitalsSnapshot: {
    rr: number;
    spo2: number;
    o2: boolean;
    bp: string;
    hr: number;
    temp: number;
    avpu: string;
  };
  reviewedByDoctor?: boolean;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  noteType: 'SOAP' | 'Progress' | 'Discharge' | 'Handoff';
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: 'draft' | 'pending_approval' | 'approved';
  approvedBy?: string;
  approvedAt?: string;
  synced: boolean;
}

export interface CareTask {
  id: string;
  patientId: string;
  patientName: string;
  roomBed: string;
  title: string;
  description: string;
  category: 'vitals' | 'medication' | 'lab_draw' | 'wound_care' | 'physio' | 'handoff';
  dueTime: string;
  priority: 'routine' | 'urgent' | 'stat';
  assignedTo: string;
  assignedRole: 'nurse' | 'doctor' | 'caregiver';
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  status: 'due' | 'given' | 'held' | 'refused';
  administeredTime?: string;
  administeredBy?: string;
  notes?: string;
}

export interface SbarHandoff {
  id: string;
  patientId: string;
  outgoingStaff: string;
  incomingStaff: string;
  timestamp: string;
  shift: 'Day to Evening' | 'Evening to Night' | 'Night to Day';
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  acknowledgedByIncoming: boolean;
}

export interface CaregiverDailyLog {
  id: string;
  patientId: string;
  date: string;
  time: string;
  caregiverName: string;
  medicationsTaken: boolean;
  medicationPhotoUrl?: string;
  mealIntake: 'none' | 'partial' | 'full' | 'excess';
  fluidIntakeOz: number;
  bloodSugar?: number;
  morningBp?: string;
  mobilityStatus: 'independent' | 'with_walker' | 'bedbound' | 'wheelchair';
  moodRating: 'cheerful' | 'calm' | 'anxious' | 'confused' | 'lethargic';
  notes: string;
  sosAlertTriggered?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'In-Person' | 'Telemedicine Video' | 'Follow-up Lab' | 'Caregiver Review';
  location: string;
  status: 'upcoming' | 'completed' | 'in_progress' | 'cancelled';
  telemedUrl?: string;
  purpose: string;
  preparationNotes: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  avatarUrl?: string;
  dateOfBirth: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodType: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  phone: string;
  email: string;
  address: string;
  roomBed?: string;
  ward?: string;
  primaryPhysician: string;
  emergencyContact: EmergencyContact;
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  activeMedications: Medication[];
  surgeries: SurgeryHistory[];
  currentVitals: VitalSignReading;
  pulseGuardStatus: {
    news2: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    lastAssessed: string;
  };
  caregiverId?: string;
  caregiverName?: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  offlineCached: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'VIEW_RECORD' | 'UPLOAD_REPORT' | 'APPROVE_NOTE' | 'RECORD_VITALS' | 'DISCHARGE' | 'EXPORT_DATA' | 'EMERGENCY_OVERRIDE';
  resourceType: string;
  resourceId: string;
  patientId: string;
  patientName: string;
  details: string;
  ipAddress: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  timestamp: string;
  actionType: 'VITALS_LOG' | 'CLINICAL_NOTE' | 'CARE_TASK' | 'MAR_UPDATE' | 'DOCUMENT_UPLOAD' | 'CAREGIVER_LOG';
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

export interface HospitalBed {
  id: string;
  ward: 'ICU' | 'Step-Down' | 'General Medicine' | 'Surgical Post-Op' | 'Emergency';
  bedNumber: string;
  status: 'occupied' | 'available' | 'cleaning' | 'maintenance';
  patientId?: string;
  patientName?: string;
  patientNews2?: number;
  assignedNurse?: string;
}

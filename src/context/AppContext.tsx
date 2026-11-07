import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  NetworkStatus,
  Patient,
  MedicalRecordDoc,
  VitalSignReading,
  CareTask,
  SbarHandoff,
  CaregiverDailyLog,
  Appointment,
  HospitalBed,
  AuditLogEntry,
  OfflineSyncQueueItem,
  ClinicalNote,
  PulseGuardAssessment,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_RECORDS,
  INITIAL_CARE_TASKS,
  INITIAL_SBAR_HANDOFFS,
  INITIAL_CAREGIVER_LOGS,
  INITIAL_APPOINTMENTS,
  INITIAL_HOSPITAL_BEDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VITALS_HISTORY,
} from '../data/mockData';
import { calculateNEWS2 } from '../utils/news2';

interface AppContextType {
  // Roles & Network
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;
  syncQueue: OfflineSyncQueueItem[];
  triggerManualSync: () => Promise<void>;
  isSyncing: boolean;

  // Active Patient
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  selectedPatient: Patient;
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'mrn' | 'currentVitals' | 'pulseGuardStatus' | 'offlineCached'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;

  // Records & Documents
  records: MedicalRecordDoc[];
  patientRecords: MedicalRecordDoc[];
  addRecord: (record: Omit<MedicalRecordDoc, 'id' | 'uploadedAt'>) => Promise<MedicalRecordDoc>;
  updateRecord: (id: string, updates: Partial<MedicalRecordDoc>) => void;
  deleteRecord: (id: string) => void;

  // Vitals & PulseGuard
  recordVitals: (patientId: string, vitals: Partial<VitalSignReading>) => Promise<VitalSignReading>;
  vitalsHistory: Record<string, any[]>;
  pulseGuardAssessments: PulseGuardAssessment[];
  addPulseGuardAssessment: (assessment: PulseGuardAssessment) => void;

  // Care Coordination & Handoffs
  careTasks: CareTask[];
  toggleTaskCompletion: (taskId: string, notes?: string) => void;
  addCareTask: (task: Omit<CareTask, 'id'>) => void;
  sbarHandoffs: SbarHandoff[];
  addSbarHandoff: (handoff: Omit<SbarHandoff, 'id' | 'timestamp' | 'acknowledgedByIncoming'>) => void;
  acknowledgeHandoff: (handoffId: string) => void;

  // Clinical Notes
  clinicalNotes: ClinicalNote[];
  addClinicalNote: (note: Omit<ClinicalNote, 'id' | 'timestamp' | 'synced'>) => void;
  approveClinicalNote: (noteId: string) => void;

  // Caregiver Portal
  caregiverLogs: CaregiverDailyLog[];
  addCaregiverLog: (log: Omit<CaregiverDailyLog, 'id' | 'date' | 'time'>) => void;
  triggerEmergencySos: (patientId: string, reason: string) => void;
  sosAlert: { active: boolean; message: string; timestamp: string } | null;
  dismissSosAlert: () => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  // Hospital Admin
  hospitalBeds: HospitalBed[];
  updateBedStatus: (bedId: string, updates: Partial<HospitalBed>) => void;

  // Audit Log
  auditLogs: AuditLogEntry[];
  logAuditEvent: (action: AuditLogEntry['action'], resourceType: string, resourceId: string, details: string) => void;

  // Notification Toast
  toastMessage: { type: 'success' | 'info' | 'warning' | 'error'; message: string } | null;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'medisync_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Role & Network
  const [currentRole, setCurrentRoleState] = useState<UserRole>('patient');
  const [networkStatus, setNetworkStatusState] = useState<NetworkStatus>('online');
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}sync_queue`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // 2. Data states with LocalStorage persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}patients`);
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-101');

  const [records, setRecords] = useState<MedicalRecordDoc[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}records`);
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [vitalsHistory, setVitalsHistory] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}vitals_history`);
      return saved ? JSON.parse(saved) : INITIAL_VITALS_HISTORY;
    } catch {
      return INITIAL_VITALS_HISTORY;
    }
  });

  const [pulseGuardAssessments, setPulseGuardAssessments] = useState<PulseGuardAssessment[]>([]);

  const [careTasks, setCareTasks] = useState<CareTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}care_tasks`);
      return saved ? JSON.parse(saved) : INITIAL_CARE_TASKS;
    } catch {
      return INITIAL_CARE_TASKS;
    }
  });

  const [sbarHandoffs, setSbarHandoffs] = useState<SbarHandoff[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}sbar_handoffs`);
      return saved ? JSON.parse(saved) : INITIAL_SBAR_HANDOFFS;
    } catch {
      return INITIAL_SBAR_HANDOFFS;
    }
  });

  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([
    {
      id: 'cn-1',
      patientId: 'pat-101',
      authorName: 'Dr. Marcus Vance, MD',
      authorRole: 'doctor',
      timestamp: '2026-11-05T16:00:00Z',
      noteType: 'SOAP',
      chiefComplaint: 'Quarterly review of T2DM and hypertension.',
      subjective: 'Patient reports feeling well overall, slight evening fatigue. Denies chest pain, orthopnea, or polyuria. Reports good adherence with metformin and lisinopril.',
      objective: 'BP 138/86 mmHg, HR 88 regular, SpO2 94% on room air. Lungs clear to auscultation. CMP shows fasting glucose 142 mg/dL, HbA1c 7.4%, eGFR 56 mL/min/1.73m².',
      assessment: '1. Type 2 Diabetes Mellitus - improved from prior 7.8% but still above 7.0% target.\n2. Essential Hypertension - acceptable control.\n3. Stage 3a CKD - stable.',
      plan: '1. Maintain Metformin 1000mg BID.\n2. Continue Empagliflozin 10mg daily.\n3. Recommend low-sodium dietary reinforcement.\n4. Repeat metabolic panel in 3 months.',
      status: 'approved',
      approvedBy: 'Dr. Marcus Vance, MD',
      approvedAt: '2026-11-05T16:15:00Z',
      synced: true,
    },
  ]);

  const [caregiverLogs, setCaregiverLogs] = useState<CaregiverDailyLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}caregiver_logs`);
      return saved ? JSON.parse(saved) : INITIAL_CAREGIVER_LOGS;
    } catch {
      return INITIAL_CAREGIVER_LOGS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}appointments`);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [hospitalBeds, setHospitalBeds] = useState<HospitalBed[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}hospital_beds`);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITAL_BEDS;
    } catch {
      return INITIAL_HOSPITAL_BEDS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}audit_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [sosAlert, setSosAlert] = useState<{ active: boolean; message: string; timestamp: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'warning' | 'error'; message: string } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}patients`, JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}records`, JSON.stringify(records));
  }, [records]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}care_tasks`, JSON.stringify(careTasks));
  }, [careTasks]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sbar_handoffs`, JSON.stringify(sbarHandoffs));
  }, [sbarHandoffs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}caregiver_logs`, JSON.stringify(caregiverLogs));
  }, [caregiverLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}appointments`, JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}hospital_beds`, JSON.stringify(hospitalBeds));
  }, [hospitalBeds]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sync_queue`, JSON.stringify(syncQueue));
  }, [syncQueue]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}vitals_history`, JSON.stringify(vitalsHistory));
  }, [vitalsHistory]);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  const logAuditEvent = (action: AuditLogEntry['action'], resourceType: string, resourceId: string, details: string) => {
    const curPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const roleNames: Record<UserRole, string> = {
      patient: 'Elena Rostova (Patient)',
      doctor: 'Dr. Marcus Vance, MD (Attending)',
      nurse: 'Nurse Sarah Jenkins, RN (Staff Nurse)',
      caregiver: 'David Rostova (Family Caregiver)',
      admin: 'Amanda Cole (Hospital Operations Admin)',
    };

    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: `usr-${currentRole}`,
      userName: roleNames[currentRole],
      userRole: currentRole,
      action,
      resourceType,
      resourceId,
      patientId: curPatient?.id || 'sys',
      patientName: curPatient?.name || 'System Wide',
      details,
      ipAddress: '10.24.18.102 (MediSync Cryptographic Enclave)',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientRecords = records.filter((r) => r.patientId === selectedPatientId);

  // Manual or Auto-Sync Offline Queue
  const triggerManualSync = async () => {
    if (syncQueue.length === 0) {
      showToast('info', 'Offline sync queue is clear. All data is synchronized.');
      return;
    }
    setIsSyncing(true);
    showToast('info', `Syncing ${syncQueue.length} queued offline records with cloud server...`);

    // Simulate batch network processing
    await new Promise((resolve) => setTimeout(resolve, 1400));

    setSyncQueue([]);
    setIsSyncing(false);
    showToast('success', 'All offline changes successfully synchronized with encrypted hospital database!');
    logAuditEvent('EXPORT_DATA', 'SyncQueue', 'queue', 'Synchronized pending offline transactions.');
  };

  const setNetworkStatus = (status: NetworkStatus) => {
    setNetworkStatusState(status);
    if (status === 'online' && syncQueue.length > 0) {
      triggerManualSync();
    } else if (status === 'offline') {
      showToast('warning', 'Switched to Offline Mode. All edits are saved locally and queued for automatic sync.');
    } else if (status === 'poor') {
      showToast('info', 'Simulating degraded connection (2G / High Latency). Critical vitals prioritized.');
    }
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    showToast('info', `Switched active role to ${role.toUpperCase()}`);
    logAuditEvent('VIEW_RECORD', 'RoleSwitch', role, `User switched perspective to ${role}`);
  };

  // 3. Record Vitals & Calculate NEWS2
  const recordVitals = async (patientId: string, vitalsData: Partial<VitalSignReading>): Promise<VitalSignReading> => {
    const news2Calc = calculateNEWS2(vitalsData);
    const newVital: VitalSignReading = {
      id: `vit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      respiratoryRate: vitalsData.respiratoryRate ?? 16,
      spo2: vitalsData.spo2 ?? 98,
      onSupplementalOxygen: vitalsData.onSupplementalOxygen ?? false,
      systolicBp: vitalsData.systolicBp ?? 120,
      diastolicBp: vitalsData.diastolicBp ?? 80,
      heartRate: vitalsData.heartRate ?? 72,
      temperature: vitalsData.temperature ?? 36.8,
      consciousness: vitalsData.consciousness ?? 'Alert',
      bloodGlucose: vitalsData.bloodGlucose,
      news2Score: news2Calc.totalScore,
      recordedBy: currentRole === 'nurse' ? 'Nurse Sarah Jenkins, RN' : currentRole === 'doctor' ? 'Dr. Marcus Vance, MD' : 'David Rostova (Caregiver)',
      role: currentRole,
      synced: networkStatus === 'online',
    };

    // Update patient current vitals & pulseGuard status
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            currentVitals: newVital,
            pulseGuardStatus: {
              news2: news2Calc.totalScore,
              riskLevel: news2Calc.riskTier,
              lastAssessed: newVital.timestamp,
            },
          };
        }
        return p;
      })
    );

    // Update vitals trend history
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVitalsHistory((prev) => {
      const cur = prev[patientId] || [];
      const updated = [
        ...cur,
        {
          time: timeLabel,
          rr: newVital.respiratoryRate,
          spo2: newVital.spo2,
          hr: newVital.heartRate,
          bp: `${newVital.systolicBp}/${newVital.diastolicBp}`,
          temp: newVital.temperature,
          news2: newVital.news2Score,
        },
      ];
      return { ...prev, [patientId]: updated.slice(-10) };
    });

    // Check if offline
    if (networkStatus !== 'online') {
      const queueItem: OfflineSyncQueueItem = {
        id: `queue-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actionType: 'VITALS_LOG',
        payload: { patientId, vitals: newVital },
        status: 'pending',
        retryCount: 0,
      };
      setSyncQueue((q) => [...q, queueItem]);
      showToast('warning', `Vitals saved locally (Offline). NEWS2 Score: ${news2Calc.totalScore} (${news2Calc.riskTier} Risk)`);
    } else {
      showToast(
        news2Calc.totalScore >= 7 ? 'error' : news2Calc.totalScore >= 5 ? 'warning' : 'success',
        `Vitals recorded. NEWS2 Score: ${news2Calc.totalScore} (${news2Calc.riskTier} Risk)`
      );
    }

    logAuditEvent(
      'RECORD_VITALS',
      'VitalSignReading',
      newVital.id,
      `NEWS2: ${news2Calc.totalScore} | HR: ${newVital.heartRate} | BP: ${newVital.systolicBp}/${newVital.diastolicBp} | RR: ${newVital.respiratoryRate} | SpO2: ${newVital.spo2}%`
    );

    return newVital;
  };

  // 4. Add Record
  const addRecord = async (recordData: Omit<MedicalRecordDoc, 'id' | 'uploadedAt'>): Promise<MedicalRecordDoc> => {
    // Duplicate detection check against existing records for this patient
    const existingSameCat = records.filter(
      (r) => r.patientId === recordData.patientId && r.title.toLowerCase().trim() === recordData.title.toLowerCase().trim()
    );
    const isDuplicate = existingSameCat.length > 0;

    const newRecord: MedicalRecordDoc = {
      ...recordData,
      id: `rec-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      isDuplicateRisk: isDuplicate || recordData.isDuplicateRisk,
      duplicateNotes: isDuplicate ? `A similar ${recordData.category} document was uploaded recently (${existingSameCat[0].documentDate}). Verify before duplicate ordering.` : recordData.duplicateNotes,
    };

    setRecords((prev) => [newRecord, ...prev]);

    if (networkStatus !== 'online') {
      const queueItem: OfflineSyncQueueItem = {
        id: `queue-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actionType: 'DOCUMENT_UPLOAD',
        payload: newRecord,
        status: 'pending',
        retryCount: 0,
      };
      setSyncQueue((q) => [...q, queueItem]);
      showToast('warning', `Record stored locally (Offline). Pending sync queue count: ${syncQueue.length + 1}`);
    } else {
      showToast('success', `Record "${newRecord.title}" successfully indexed and clinical values extracted!`);
    }

    logAuditEvent('UPLOAD_REPORT', 'MedicalRecordDoc', newRecord.id, `Uploaded ${newRecord.title} (${newRecord.category}) - ${newRecord.extractedValues?.length || 0} lab markers extracted`);

    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<MedicalRecordDoc>) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    logAuditEvent('VIEW_RECORD', 'MedicalRecordDoc', id, `Updated record details for ${id}`);
    showToast('success', 'Document updated successfully');
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    logAuditEvent('VIEW_RECORD', 'MedicalRecordDoc', id, `Deleted record ${id}`);
    showToast('info', 'Document removed from patient record');
  };

  // 5. Patient Management
  const addPatient = (patientData: Omit<Patient, 'id' | 'mrn' | 'currentVitals' | 'pulseGuardStatus' | 'offlineCached'>) => {
    const id = `pat-${Date.now()}`;
    const initials = patientData.name.split(' ').map((n) => n[0]).join('').toUpperCase();
    const mrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}-${initials}`;

    const defaultVitals: VitalSignReading = {
      id: `vit-init-${Date.now()}`,
      timestamp: new Date().toISOString(),
      respiratoryRate: 16,
      spo2: 98,
      onSupplementalOxygen: false,
      systolicBp: 120,
      diastolicBp: 80,
      heartRate: 72,
      temperature: 36.8,
      consciousness: 'Alert',
      news2Score: 0,
      recordedBy: 'Admissions Desk',
      role: 'admin',
      synced: true,
    };

    const newPatient: Patient = {
      ...patientData,
      id,
      mrn,
      currentVitals: defaultVitals,
      pulseGuardStatus: {
        news2: 0,
        riskLevel: 'Low',
        lastAssessed: new Date().toISOString(),
      },
      offlineCached: true,
    };

    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(id);
    showToast('success', `Registered patient ${newPatient.name} (MRN: ${mrn})`);
    logAuditEvent('RECORD_VITALS', 'Patient', id, `Registered new patient ${newPatient.name}`);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('success', 'Patient profile updated');
  };

  // 6. Care Tasks
  const toggleTaskCompletion = (taskId: string, notes?: string) => {
    setCareTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            completedBy: nextCompleted ? (currentRole === 'nurse' ? 'Nurse Sarah Jenkins, RN' : 'Dr. Marcus Vance, MD') : undefined,
            notes: notes || t.notes,
          };
        }
        return t;
      })
    );
    showToast('success', 'Care coordination task status updated');
    logAuditEvent('APPROVE_NOTE', 'CareTask', taskId, `Task ${taskId} toggled completion`);
  };

  const addCareTask = (taskData: Omit<CareTask, 'id'>) => {
    const newTask: CareTask = { ...taskData, id: `task-${Date.now()}` };
    setCareTasks((prev) => [newTask, ...prev]);
    showToast('success', `Added care task: "${newTask.title}"`);
  };

  // 7. SBAR Handoffs
  const addSbarHandoff = (handoffData: Omit<SbarHandoff, 'id' | 'timestamp' | 'acknowledgedByIncoming'>) => {
    const newHandoff: SbarHandoff = {
      ...handoffData,
      id: `sbar-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledgedByIncoming: false,
    };
    setSbarHandoffs((prev) => [newHandoff, ...prev]);
    showToast('success', 'SBAR clinical handoff submitted successfully');
    logAuditEvent('APPROVE_NOTE', 'SbarHandoff', newHandoff.id, `Shift handoff created by ${newHandoff.outgoingStaff}`);
  };

  const acknowledgeHandoff = (handoffId: string) => {
    setSbarHandoffs((prev) => prev.map((h) => (h.id === handoffId ? { ...h, acknowledgedByIncoming: true } : h)));
    showToast('success', 'Handoff acknowledged and accepted');
    logAuditEvent('APPROVE_NOTE', 'SbarHandoff', handoffId, 'Shift handoff acknowledged');
  };

  // 8. Clinical Notes (Doctor Approval)
  const addClinicalNote = (noteData: Omit<ClinicalNote, 'id' | 'timestamp' | 'synced'>) => {
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      synced: networkStatus === 'online',
    };
    setClinicalNotes((prev) => [newNote, ...prev]);
    showToast('success', 'Clinical documentation saved as draft. Ready for physician signature.');
  };

  const approveClinicalNote = (noteId: string) => {
    setClinicalNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              status: 'approved',
              approvedBy: 'Dr. Marcus Vance, MD',
              approvedAt: new Date().toISOString(),
            }
          : n
      )
    );
    showToast('success', 'Clinical note approved and signed into medical record!');
    logAuditEvent('APPROVE_NOTE', 'ClinicalNote', noteId, 'Physician reviewed and signed clinical note');
  };

  // 9. Caregiver Portal & Emergency SOS
  const addCaregiverLog = (logData: Omit<CaregiverDailyLog, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const newLog: CaregiverDailyLog = {
      ...logData,
      id: `cg-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setCaregiverLogs((prev) => [newLog, ...prev]);
    showToast('success', 'Daily care log recorded and shared with care team');
    logAuditEvent('RECORD_VITALS', 'CaregiverDailyLog', newLog.id, `Caregiver logged vitals & medication compliance`);
  };

  const triggerEmergencySos = (patientId: string, reason: string) => {
    const curP = patients.find((p) => p.id === patientId) || selectedPatient;
    const alertData = {
      active: true,
      message: `EMERGENCY SOS ALERT for ${curP.name}: ${reason}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSosAlert(alertData);
    showToast('error', `CRITICAL SOS: Alert dispatched to hospital rapid team and caregiver contact ${curP.emergencyContact.name}!`);
    logAuditEvent('EMERGENCY_OVERRIDE', 'SOS', patientId, `Caregiver or patient pressed Emergency SOS: ${reason}`);
  };

  const dismissSosAlert = () => setSosAlert(null);

  // 10. Appointments
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'status'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      status: 'upcoming',
    };
    setAppointments((prev) => [newApt, ...prev]);
    showToast('success', `Appointment scheduled for ${newApt.date} at ${newApt.time}`);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    showToast('info', `Appointment status updated to ${status}`);
  };

  // 11. Hospital Bed Allocation
  const updateBedStatus = (bedId: string, updates: Partial<HospitalBed>) => {
    setHospitalBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, ...updates } : b)));
    showToast('success', 'Ward bed management updated');
  };

  // 12. PulseGuard Assessment
  const addPulseGuardAssessment = (assessment: PulseGuardAssessment) => {
    setPulseGuardAssessments((prev) => [assessment, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        networkStatus,
        setNetworkStatus,
        syncQueue,
        triggerManualSync,
        isSyncing,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,
        patients,
        addPatient,
        updatePatient,
        records,
        patientRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        recordVitals,
        vitalsHistory,
        pulseGuardAssessments,
        addPulseGuardAssessment,
        careTasks,
        toggleTaskCompletion,
        addCareTask,
        sbarHandoffs,
        addSbarHandoff,
        acknowledgeHandoff,
        clinicalNotes,
        addClinicalNote,
        approveClinicalNote,
        caregiverLogs,
        addCaregiverLog,
        triggerEmergencySos,
        sosAlert,
        dismissSosAlert,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        hospitalBeds,
        updateBedStatus,
        auditLogs,
        logAuditEvent,
        toastMessage,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

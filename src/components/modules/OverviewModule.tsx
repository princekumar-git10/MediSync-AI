import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Heart,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  TrendingUp,
  Pill,
  Users,
  Building2,
  ArrowRight,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ActiveModule } from '../Sidebar';

interface OverviewModuleProps {
  onNavigate: (module: ActiveModule) => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ onNavigate }) => {
  const {
    currentRole,
    selectedPatient,
    patients,
    setSelectedPatientId,
    records,
    patientRecords,
    careTasks,
    toggleTaskCompletion,
    appointments,
    sbarHandoffs,
    hospitalBeds,
    clinicalNotes,
  } = useApp();

  const news2 = selectedPatient.pulseGuardStatus.news2;
  const criticalPatients = patients.filter((p) => p.pulseGuardStatus.news2 >= 5);
  const pendingNotes = clinicalNotes.filter((n) => n.status !== 'approved');
  const pendingTasks = careTasks.filter((t) => !t.completed);
  const myAppointments = appointments.filter((a) => a.patientId === selectedPatient.id);

  // Render role-specific overview
  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Perspective Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="capitalize">Active Perspective: {currentRole}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {currentRole === 'patient' && `Welcome back, ${selectedPatient.name.split(' ')[0]}`}
            {currentRole === 'doctor' && `Clinical Ward Overview — Dr. Marcus Vance, MD`}
            {currentRole === 'nurse' && `Bedside Care Operations — Nurse Sarah Jenkins, RN`}
            {currentRole === 'caregiver' && `Caregiver Command Center — David Rostova`}
            {currentRole === 'admin' && `Hospital Resource & Operations Management`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentRole === 'patient' && `Your personal electronic health record is continuously monitored by PulseGuard AI.`}
            {currentRole === 'doctor' && `${patients.length} admitted patients under active observation. ${criticalPatients.length} early warning escalations active.`}
            {currentRole === 'nurse' && `${pendingTasks.length} pending bedside nursing interventions scheduled for this shift.`}
            {currentRole === 'caregiver' && `Monitoring care routines, medication adherence, and vital stability for ${selectedPatient.name}.`}
            {currentRole === 'admin' && `Live telemetry stream active across ICU, Step-Down, and General Medicine wards.`}
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('pulseguard')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>PulseGuard AI ({selectedPatient.pulseGuardStatus.riskLevel})</span>
          </button>
          <button
            onClick={() => onNavigate('records')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>View Medical Records</span>
          </button>
        </div>
      </div>

      {/* Early Warning Alert Banner if current patient or any ward patient is elevated */}
      {news2 >= 5 && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
          news2 >= 7 ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${news2 >= 7 ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <p className="font-bold text-sm">
                PulseGuard Early Warning Alert: {selectedPatient.name} (NEWS2 Score: {news2})
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                Current vitals indicate physiological stress. Respiratory rate {selectedPatient.currentVitals.respiratoryRate}/min, SpO2 {selectedPatient.currentVitals.spo2}%, Heart Rate {selectedPatient.currentVitals.heartRate} bpm.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pulseguard')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white shadow-2xs hover:bg-slate-50 text-slate-900 border border-slate-200 flex items-center space-x-1 flex-shrink-0"
          >
            <span>Assess Patient</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Vitals & NEWS2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Early Warning Score</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{news2}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              news2 >= 7 ? 'bg-rose-100 text-rose-800' :
              news2 >= 5 ? 'bg-amber-100 text-amber-800' :
              news2 >= 3 ? 'bg-teal-100 text-teal-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {selectedPatient.pulseGuardStatus.riskLevel} Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            BP: {selectedPatient.currentVitals.systolicBp}/{selectedPatient.currentVitals.diastolicBp} • SpO2: {selectedPatient.currentVitals.spo2}%
          </p>
        </div>

        {/* Metric 2: Active Medications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Active Medications</span>
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {selectedPatient.activeMedications.length}
            </span>
            <span className="text-xs text-slate-500">prescriptions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {selectedPatient.activeMedications.filter((m) => m.takenToday).length} taken today
          </p>
        </div>

        {/* Metric 3: Medical Documents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Indexed Records</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {patientRecords.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">OCR Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Latest: {patientRecords[0]?.documentDate || 'N/A'}
          </p>
        </div>

        {/* Metric 4: Care Tasks & Follow-ups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-medium">Pending Care Tasks</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {careTasks.filter((t) => t.patientId === selectedPatient.id && !t.completed).length}
            </span>
            <span className="text-xs text-amber-600 font-medium">Due Today</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {myAppointments.length} upcoming appointments
          </p>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide): Active Care & Vitals Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section A: Today's Clinical Schedule & Medication Administration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Scheduled Medication Administration</h3>
                <p className="text-xs text-slate-500">Adherence verification and dosage tracker</p>
              </div>
              <button
                onClick={() => onNavigate('coordination')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>View Full MAR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedPatient.activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${med.takenToday ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{med.name} <span className="text-slate-500 font-normal">({med.dosage})</span></p>
                      <p className="text-[11px] text-slate-500">{med.frequency} • {med.instructions}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {med.scheduledTimes.join(', ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      med.takenToday ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {med.takenToday ? 'Taken' : 'Due'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Clinical Care Tasks & Interventions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bedside Care Tasks & Coordination</h3>
                <p className="text-xs text-slate-500">Live nursing checklists and doctor instructions</p>
              </div>
              <button
                onClick={() => onNavigate('coordination')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Manage Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {careTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    task.completed ? 'bg-slate-50/60 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`mt-0.5 p-1 rounded-md transition ${
                        task.completed ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                      <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-400">
                        <span>Due: {task.dueTime}</span>
                        <span>•</span>
                        <span>Assigned to: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    task.priority === 'stat' ? 'bg-rose-100 text-rose-800' :
                    task.priority === 'urgent' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Doctor/Admin multi-patient list if in clinical role */}
          {(currentRole === 'doctor' || currentRole === 'admin' || currentRole === 'nurse') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admitted Ward Patients Census</h3>
                  <p className="text-xs text-slate-500">Prioritized by PulseGuard deterioration risk</p>
                </div>
                <button
                  onClick={() => onNavigate('patients')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                >
                  <span>All Patients</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-2.5">Patient</th>
                      <th className="py-2.5">Room / Bed</th>
                      <th className="py-2.5">Primary Condition</th>
                      <th className="py-2.5">NEWS2 Score</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 font-semibold text-slate-900">
                          {p.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{p.mrn}</span>
                        </td>
                        <td className="py-2.5 text-slate-600">{p.roomBed || 'Outpatient'}</td>
                        <td className="py-2.5 text-slate-600">
                          {p.chronicConditions[0]?.name || 'Routine Checkup'}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.pulseGuardStatus.news2 >= 7 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            p.pulseGuardStatus.news2 >= 5 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            p.pulseGuardStatus.news2 >= 3 ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            NEWS2: {p.pulseGuardStatus.news2} ({p.pulseGuardStatus.riskLevel})
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              onNavigate('pulseguard');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold transition"
                          >
                            Open Chart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (1 Col wide): Patient Health Card & Quick Links */}
        <div className="space-y-6">
          
          {/* Patient Quick Profile & Allergies */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                {selectedPatient.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500">{selectedPatient.mrn} • Blood {selectedPatient.bloodType}</p>
              </div>
            </div>

            <div className="py-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Age / Gender:</span>
                <span className="font-semibold text-slate-900">{selectedPatient.age} yo / {selectedPatient.gender}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>BMI:</span>
                <span className="font-semibold text-slate-900">{selectedPatient.bmi} ({selectedPatient.weightKg} kg)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Primary MD:</span>
                <span className="font-semibold text-slate-900 text-right">{selectedPatient.primaryPhysician.split(',')[0]}</span>
              </div>
            </div>

            {/* Allergies Highlight */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Known Allergies ({selectedPatient.allergies.length})</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient.allergies.map((alg) => (
                  <span
                    key={alg.id}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                    title={alg.reaction}
                  >
                    {alg.allergen}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical Memory Card Shortcut */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('records')}
                className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Download Medical Memory Card</span>
              </button>
            </div>
          </div>

          {/* SBAR Shift Handoff Preview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Latest Shift Handoff</h4>
              <span className="text-[10px] text-slate-400 font-mono">SBAR Protocol</span>
            </div>
            {sbarHandoffs[0] ? (
              <div className="text-xs space-y-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  {sbarHandoffs[0].outgoingStaff} → {sbarHandoffs[0].incomingStaff}
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                  <p><span className="font-bold text-slate-900">S:</span> {sbarHandoffs[0].situation}</p>
                  <p><span className="font-bold text-slate-900">R:</span> {sbarHandoffs[0].recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No shift handoffs logged for this ward.</p>
            )}
            <button
              onClick={() => onNavigate('coordination')}
              className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Shift Handoff Log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Upcoming Appointment Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Next Consult</h4>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            {myAppointments[0] ? (
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-slate-900">{myAppointments[0].purpose}</p>
                <p className="text-slate-600">{myAppointments[0].doctorName} ({myAppointments[0].specialty})</p>
                <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit">
                  {myAppointments[0].date} at {myAppointments[0].time}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No scheduled appointments.</p>
            )}
            <button
              onClick={() => onNavigate('appointments')}
              className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>Schedule or Join Video</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

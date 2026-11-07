import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Activity,
  Heart,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  Pill,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PatientsModuleProps {
  onNavigateToRecords: () => void;
  onNavigateToPulseGuard: () => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  onNavigateToRecords,
  onNavigateToPulseGuard,
}) => {
  const { patients, selectedPatientId, setSelectedPatientId, addPatient, selectedPatient } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    dateOfBirth: '1975-01-01',
    age: 51,
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    bloodType: 'O+',
    heightCm: 168,
    weightKg: 70,
    bmi: 24.8,
    phone: '',
    email: '',
    address: '',
    ward: 'General Medicine',
    roomBed: 'Bed 01',
    primaryPhysician: 'Dr. Marcus Vance, MD',
    insuranceProvider: 'Metro BlueCross',
    insurancePolicyNumber: 'POL-123456',
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
    chronicConditions: [
      { id: 'cond-new', name: 'Hypertension', icd10: 'I10', diagnosedDate: '2024-01-01', status: 'managed' as const, severity: 'mild' as const, notes: 'Initial intake' },
    ],
    allergies: [
      { id: 'alg-new', allergen: 'None Known', severity: 'mild' as const, reaction: 'None', diagnosedDate: '2024-01-01' },
    ],
    activeMedications: [],
    surgeries: [],
  });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chronicConditions.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWard = selectedWardFilter === 'all' || p.ward === selectedWardFilter;
    const matchesRisk = selectedRiskFilter === 'all' || p.pulseGuardStatus.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesWard && matchesRisk;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;

    addPatient({
      ...newPatient,
      bmi: Number((newPatient.weightKg / Math.pow(newPatient.heightCm / 100, 2)).toFixed(1)),
    });

    setIsRegisterModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Registration Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Directory & Clinical Census</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage comprehensive electronic health profiles, medical history, and early warning status
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, MRN, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-500 flex items-center space-x-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Ward:</span>
          </span>
          <select
            value={selectedWardFilter}
            onChange={(e) => setSelectedWardFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="all">All Wards</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Step-Down">Step-Down Unit</option>
            <option value="Surgical Post-Op">Surgical Post-Op</option>
            <option value="ICU">Intensive Care Unit</option>
          </select>

          <span className="text-xs text-slate-500 flex items-center space-x-1 flex-shrink-0 ml-2">
            <span>Risk Tier:</span>
          </span>
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
          >
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical (Immediate Esc.)</option>
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          const isSelected = patient.id === selectedPatientId;
          const news2 = patient.pulseGuardStatus.news2;

          return (
            <div
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              className={`bg-white rounded-2xl p-5 border transition cursor-pointer relative ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}

              {/* Patient Header */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200 flex-shrink-0">
                  {patient.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="pr-12">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{patient.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{patient.mrn}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {patient.age}yo {patient.gender} • Blood {patient.bloodType}
                  </p>
                </div>
              </div>

              {/* Ward & NEWS2 Badge */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs my-2">
                <span className="text-slate-600 font-medium">{patient.ward || 'Outpatient'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    news2 >= 7
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : news2 >= 5
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : news2 >= 3
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  NEWS2: {news2} ({patient.pulseGuardStatus.riskLevel})
                </span>
              </div>

              {/* Chronic Conditions */}
              <div className="my-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Diagnoses
                </p>
                <div className="flex flex-wrap gap-1">
                  {patient.chronicConditions.slice(0, 2).map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      {c.name}
                    </span>
                  ))}
                  {patient.chronicConditions.length > 2 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                      +{patient.chronicConditions.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPatientId(patient.id);
                    onNavigateToRecords();
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Medical Records
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPatientId(patient.id);
                    onNavigateToPulseGuard();
                  }}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                >
                  <span>PulseGuard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Patient Detailed View Panel */}
      {selectedPatient && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Full Electronic Health Profile
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedPatient.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedPatient.mrn} • Primary Attending: {selectedPatient.primaryPhysician}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onNavigateToRecords}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
              >
                Access Clinical Documents
              </button>
              <button
                onClick={onNavigateToPulseGuard}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                PulseGuard Monitor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Demographics & Contacts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Demographics & Contact</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <p><span className="font-semibold text-slate-900">DOB:</span> {selectedPatient.dateOfBirth} ({selectedPatient.age} years old)</p>
                <p><span className="font-semibold text-slate-900">Gender / Blood:</span> {selectedPatient.gender} / {selectedPatient.bloodType}</p>
                <p><span className="font-semibold text-slate-900">Phone:</span> {selectedPatient.phone}</p>
                <p><span className="font-semibold text-slate-900">Email:</span> {selectedPatient.email}</p>
                <p><span className="font-semibold text-slate-900">Address:</span> {selectedPatient.address}</p>
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <p className="font-semibold text-slate-900">Emergency Contact:</p>
                  <p>{selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation}) - {selectedPatient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Chronic Conditions & Diagnoses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Documented Chronic Conditions</span>
              </h4>
              <div className="space-y-2">
                {selectedPatient.chronicConditions.map((cond) => (
                  <div key={cond.id} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{cond.name}</span>
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        ICD-10: {cond.icd10}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{cond.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies & Surgical History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Allergies & Surgeries</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                  <p className="font-bold text-rose-900 mb-1">Drug & Environmental Allergies:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-800">
                    {selectedPatient.allergies.map((a) => (
                      <li key={a.id}>
                        <span className="font-semibold">{a.allergen}</span> ({a.severity}) - {a.reaction}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 mb-1">Prior Surgical Interventions:</p>
                  {selectedPatient.surgeries.length > 0 ? (
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      {selectedPatient.surgeries.map((s) => (
                        <li key={s.id} className="border-b border-slate-200/60 pb-1 last:border-0">
                          <span className="font-semibold text-slate-800">{s.procedureName}</span> ({s.date})
                          <p className="text-[10px] text-slate-500">{s.hospital} • {s.surgeon}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400">No prior surgeries on file.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">Register New Patient</h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => {
                      const dob = new Date(e.target.value);
                      const diff = Date.now() - dob.getTime();
                      const age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
                      setNewPatient({ ...newPatient, dateOfBirth: e.target.value, age });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e: any) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward</label>
                  <select
                    value={newPatient.ward}
                    onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Step-Down">Step-Down Unit</option>
                    <option value="Surgical Post-Op">Surgical Post-Op</option>
                    <option value="ICU">ICU</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={newPatient.emergencyContact.name}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        emergencyContact: { ...newPatient.emergencyContact, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Sarah Smith (Spouse)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs"
                >
                  Confirm & Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

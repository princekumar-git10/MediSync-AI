import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Coffee,
  Droplet,
  Activity,
  Plus,
  Smile,
  Clock,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const CaregiverPortalModule: React.FC = () => {
  const {
    selectedPatient,
    caregiverLogs,
    addCaregiverLog,
    triggerEmergencySos,
    showToast,
  } = useApp();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // New Log State
  const [medsTaken, setMedsTaken] = useState(true);
  const [meal, setMeal] = useState<'none' | 'partial' | 'full' | 'excess'>('full');
  const [fluidOz, setFluidOz] = useState<number>(32);
  const [bloodSugar, setBloodSugar] = useState<number>(138);
  const [morningBp, setMorningBp] = useState('134/84');
  const [mobility, setMobility] = useState<'independent' | 'with_walker' | 'bedbound' | 'wheelchair'>('independent');
  const [mood, setMood] = useState<'cheerful' | 'calm' | 'anxious' | 'confused' | 'lethargic'>('cheerful');
  const [notes, setNotes] = useState('Took breakfast and morning medications comfortably. Walked garden for 20 minutes.');
  const [photoVerified, setPhotoVerified] = useState(false);

  const patientLogs = caregiverLogs.filter((l) => l.patientId === selectedPatient.id);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCaregiverLog({
      patientId: selectedPatient.id,
      caregiverName: 'David Rostova (Caregiver)',
      medicationsTaken: medsTaken,
      medicationPhotoUrl: photoVerified ? 'photo_verified_adherence.jpg' : undefined,
      mealIntake: meal,
      fluidIntakeOz: fluidOz,
      bloodSugar,
      morningBp,
      mobilityStatus: mobility,
      moodRating: mood,
      notes,
    });

    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Family Caregiver Command Portal</h2>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
              Primary Caregiver: David Rostova
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily nutrition, medication verification, vital checks, and direct emergency SOS link for {selectedPatient.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Care Entry</span>
          </button>
          <button
            onClick={() => triggerEmergencySos(selectedPatient.id, 'Caregiver triggered one-touch emergency distress call')}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Instant SOS</span>
          </button>
        </div>
      </div>

      {/* 3 Status Glance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Today's Med Adherence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">100%</div>
          <p className="text-[11px] text-emerald-700 mt-1">Morning Metformin & Lisinopril confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Hydration & Nutrition</span>
            <Droplet className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">32 oz</div>
          <p className="text-[11px] text-slate-500 mt-1">Goal: 64 oz / Full meal intake logged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Morning Blood Sugar</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">138 mg/dL</div>
          <p className="text-[11px] text-slate-500 mt-1">BP: 134/84 mmHg (Acceptable range)</p>
        </div>

      </div>

      {/* Caregiver Daily Logs List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Caregiver Daily Logbook History
        </h3>

        <div className="space-y-3">
          {patientLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2 hover:bg-slate-50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{log.caregiverName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {log.date} at {log.time}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Meds Confirmed: {log.medicationsTaken ? 'Yes' : 'No'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 capitalize">
                    Mood: {log.moodRating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 text-[11px] font-mono py-1">
                <div><span>Blood Sugar: </span><strong className="text-slate-900">{log.bloodSugar || 'N/A'} mg/dL</strong></div>
                <div><span>Morning BP: </span><strong className="text-slate-900">{log.morningBp || 'N/A'}</strong></div>
                <div><span>Fluid: </span><strong className="text-slate-900">{log.fluidIntakeOz} oz</strong></div>
                <div><span>Meal Intake: </span><strong className="text-slate-900 capitalize">{log.mealIntake}</strong></div>
              </div>

              <p className="text-slate-700 italic border-t border-slate-200/60 pt-2 text-[11px]">
                "{log.notes}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Log Daily Home Care Observations</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Medication Adherence Check</span>
                  <p className="text-[11px] text-slate-500">Were all morning prescribed tablets taken?</p>
                </div>
                <input
                  type="checkbox"
                  checked={medsTaken}
                  onChange={(e) => setMedsTaken(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-bold text-emerald-950">Photo Verification (Optional)</span>
                    <p className="text-[11px] text-emerald-800">Verify pill organizer pill count with photo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoVerified(!photoVerified);
                    showToast('info', photoVerified ? 'Photo removed' : 'Photo adherence verified');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    photoVerified ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-300 text-emerald-800'
                  }`}
                >
                  {photoVerified ? 'Verified ✓' : 'Snap Photo'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Morning Blood Pressure</label>
                  <input
                    type="text"
                    value={morningBp}
                    onChange={(e) => setMorningBp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fluid Intake (Ounces)</label>
                  <input
                    type="number"
                    value={fluidOz}
                    onChange={(e) => setFluidOz(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meal Nutrition</label>
                  <select
                    value={meal}
                    onChange={(e: any) => setMeal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="none">None / Skipped</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full Meal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Caregiver Notes / Diary</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

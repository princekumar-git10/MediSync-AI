import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, PhoneCall, MapPin, X, ShieldAlert, HeartPulse } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { selectedPatient, triggerEmergencySos } = useApp();
  const [reason, setReason] = useState('Severe shortness of breath & chest tightness');
  const [customReason, setCustomReason] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickReasons = [
    'Severe acute shortness of breath / wheezing',
    'Sudden chest pain, palpitations, or dizziness',
    'Fall with trauma or inability to ambulate',
    'Sudden acute confusion or speech slurring',
    'Blood glucose < 50 mg/dL (Severe Hypoglycemia)',
  ];

  const handleTrigger = () => {
    const finalReason = customReason.trim() ? customReason : reason;
    triggerEmergencySos(selectedPatient.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-700 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Emergency SOS Dispatch</h3>
              <p className="text-xs text-rose-100">Immediate Clinical & Caregiver Alert</p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Patient Details Confirmation */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Patient in Distress</p>
              <p className="text-sm font-bold text-slate-900">{selectedPatient.name}</p>
              <p className="text-[11px] text-slate-500">
                MRN: {selectedPatient.mrn} • {selectedPatient.ward || 'Home Care'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Primary Contact</p>
              <p className="text-xs font-semibold text-slate-800">{selectedPatient.emergencyContact.name}</p>
              <p className="text-xs font-mono text-emerald-600">{selectedPatient.emergencyContact.phone}</p>
            </div>
          </div>

          {/* Quick select emergency reasons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Primary Clinical Trigger
            </label>
            <div className="space-y-1.5">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition ${
                    reason === r && !customReason
                      ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Describe Emergency Situation
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. Patient found unresponsive on floor, breathing heavily..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Broadcast Protocol Dispatched:</span>
            </div>
            <p className="text-[11px] text-amber-800 pl-5">
              1. Dispatches SMS & telemetry push to {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.phone}).
            </p>
            <p className="text-[11px] text-amber-800 pl-5">
              2. Triggers audio-visual priority alarm on Ward Nursing Console and attending Physician pager.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTrigger}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-2 transition shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 animate-bounce" />
              <span>BROADCAST EMERGENCY SOS NOW</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  CalendarCheck,
  Video,
  Clock,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  X,
  PhoneCall,
  User,
  ExternalLink,
} from 'lucide-react';

export const AppointmentsModule: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    selectedPatient,
    showToast,
  } = useApp();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [activeTelemedRoom, setActiveTelemedRoom] = useState<Appointment | null>(null);

  // Form State
  const [doctorName, setDoctorName] = useState('Dr. Marcus Vance, MD');
  const [specialty, setSpecialty] = useState('Cardiology & Internal Medicine');
  const [aptDate, setAptDate] = useState('2026-11-25');
  const [aptTime, setAptTime] = useState('11:00 AM');
  const [aptType, setAptType] = useState<Appointment['type']>('Telemedicine Video');
  const [purpose, setPurpose] = useState('Routine Hypertension & Glycemic Follow-up');
  const [preparationNotes, setPreparationNotes] = useState('Have home blood pressure log and blood glucose meter ready.');

  const patientAppointments = appointments.filter((a) => a.patientId === selectedPatient.id);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName,
      specialty,
      date: aptDate,
      time: aptTime,
      durationMinutes: 30,
      type: aptType,
      location: aptType === 'Telemedicine Video' ? 'Secure MediSync Telehealth Room' : 'Metro Clinic, Suite 402',
      purpose,
      preparationNotes,
      telemedUrl: aptType === 'Telemedicine Video' ? `https://telemed.medisync.ai/room/${selectedPatient.mrn}` : undefined,
    });

    setIsBookModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointments & Follow-up Scheduling</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate in-person consultations, lab rechecks, and encrypted telemedicine video visits
          </p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patientAppointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  apt.type === 'Telemedicine Video' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {apt.type}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {apt.date} • {apt.time}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900">{apt.purpose}</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {apt.doctorName} ({apt.specialty})
              </p>

              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{apt.location}</span>
                </div>
                {apt.preparationNotes && (
                  <p className="text-[11px] text-slate-400 italic mt-1">Prep: {apt.preparationNotes}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase ${
                apt.status === 'completed' ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                Status: {apt.status}
              </span>

              {apt.type === 'Telemedicine Video' && apt.status !== 'completed' && (
                <button
                  onClick={() => setActiveTelemedRoom(apt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Consult</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Telemedicine Video Simulation Modal */}
      {activeTelemedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden text-white flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                <h3 className="font-bold text-sm">Secure Telehealth Encrypted Feed</h3>
                <span className="text-xs text-slate-400 font-mono">256-bit AES</span>
              </div>
              <button
                onClick={() => setActiveTelemedRoom(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Streams */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
              
              {/* Doctor Video Stream Simulation */}
              <div className="bg-slate-800 rounded-2xl flex flex-col justify-between p-4 relative overflow-hidden border border-slate-700">
                <span className="absolute top-3 left-3 bg-slate-900/70 text-slate-200 text-[10px] px-2 py-0.5 rounded font-semibold">
                  Dr. Marcus Vance, MD (Attending)
                </span>
                <div className="my-auto text-center text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-2 flex items-center justify-center font-bold text-lg text-emerald-400">
                    MV
                  </div>
                  <p className="text-xs">Physician Camera Stream Active</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-400 font-mono">
                  <span>HD 1080p • 60fps</span>
                  <span>Audio Latency 14ms</span>
                </div>
              </div>

              {/* Patient Video Stream Simulation */}
              <div className="bg-slate-800 rounded-2xl flex flex-col justify-between p-4 relative overflow-hidden border border-slate-700">
                <span className="absolute top-3 left-3 bg-slate-900/70 text-slate-200 text-[10px] px-2 py-0.5 rounded font-semibold">
                  {selectedPatient.name} (Patient View)
                </span>
                <div className="my-auto text-center text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-2 flex items-center justify-center font-bold text-lg text-sky-400">
                    {selectedPatient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-xs">Patient Camera Stream Active</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Microphone: Muted</span>
                  <span>NEWS2: {selectedPatient.pulseGuardStatus.news2}</span>
                </div>
              </div>

            </div>

            {/* Controls */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Purpose: {activeTelemedRoom.purpose}</span>
              <button
                onClick={() => {
                  updateAppointmentStatus(activeTelemedRoom.id, 'completed');
                  setActiveTelemedRoom(null);
                  showToast('success', 'Telemedicine video consult concluded.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
              >
                End Consultation Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Schedule Clinical Appointment</h3>
              <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Type</label>
                  <select
                    value={aptType}
                    onChange={(e: any) => setAptType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="In-Person">In-Person Clinic Visit</option>
                    <option value="Telemedicine Video">Telemedicine Video Consult</option>
                    <option value="Follow-up Lab">Follow-up Lab Check</option>
                    <option value="Caregiver Review">Caregiver Family Review</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Physician</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preparation Instructions</label>
                <input
                  type="text"
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

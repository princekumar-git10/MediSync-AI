import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, NetworkStatus } from '../types';
import {
  Activity,
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  Bell,
  AlertTriangle,
  Search,
  User,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Building2,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenSosModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenSosModal }) => {
  const {
    currentRole,
    setCurrentRole,
    networkStatus,
    setNetworkStatus,
    syncQueue,
    triggerManualSync,
    isSyncing,
    selectedPatient,
    patients,
    setSelectedPatientId,
    sosAlert,
    dismissSosAlert,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [patientMenuOpen, setPatientMenuOpen] = useState(false);
  const [networkMenuOpen, setNetworkMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const roleMeta: Record<UserRole, { label: string; title: string; icon: React.ReactNode; color: string }> = {
    patient: {
      label: 'Patient',
      title: 'Elena Rostova (Self)',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    doctor: {
      label: 'Physician',
      title: 'Dr. Marcus Vance, MD',
      icon: <Stethoscope className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    nurse: {
      label: 'Registered Nurse',
      title: 'Nurse Sarah Jenkins, RN',
      icon: <Activity className="w-4 h-4 text-sky-600" />,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    caregiver: {
      label: 'Family Caregiver',
      title: 'David Rostova (Son)',
      icon: <HeartHandshake className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    admin: {
      label: 'Hospital Admin',
      title: 'Amanda Cole (Operations)',
      icon: <Building2 className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  return (
    <>
      {/* SOS Alert Banner */}
      {sosAlert && (
        <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between shadow-md z-50 animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
            <span className="font-semibold text-sm tracking-wide">{sosAlert.message}</span>
            <span className="text-xs bg-rose-700 px-2 py-0.5 rounded font-mono">{sosAlert.timestamp}</span>
          </div>
          <button
            onClick={dismissSosAlert}
            className="text-white/80 hover:text-white hover:bg-rose-700/50 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">MediSync<span className="text-emerald-600">.ai</span></span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Offline-Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Connected Care & Early Warning</p>
            </div>
          </div>

          {/* Quick Patient Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setPatientMenuOpen(!patientMenuOpen);
                setRoleMenuOpen(false);
                setNetworkMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {selectedPatient?.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>{selectedPatient?.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{selectedPatient?.mrn}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span>{selectedPatient?.age}yo {selectedPatient?.gender}</span>
                  <span className={`inline-flex items-center px-1 rounded text-[9px] font-bold ${
                    selectedPatient?.pulseGuardStatus.news2 >= 7 ? 'bg-rose-100 text-rose-700' :
                    selectedPatient?.pulseGuardStatus.news2 >= 5 ? 'bg-amber-100 text-amber-800' :
                    selectedPatient?.pulseGuardStatus.news2 >= 3 ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    NEWS2: {selectedPatient?.pulseGuardStatus.news2}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {patientMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Patient Record
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setPatientMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                        p.id === selectedPatient?.id ? 'bg-emerald-50/70 border-l-3 border-emerald-500' : ''
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.age}yo • {p.ward || 'Outpatient'} • {p.bloodType}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.pulseGuardStatus.news2 >= 7 ? 'bg-rose-100 text-rose-700' :
                        p.pulseGuardStatus.news2 >= 5 ? 'bg-amber-100 text-amber-800' :
                        p.pulseGuardStatus.news2 >= 3 ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        NEWS2: {p.pulseGuardStatus.news2}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls: Global Search, Network Simulator, Sync Queue, SOS, Role Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Quick Search (Records, Medications, Labs)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Offline/Online Network Simulation Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setNetworkMenuOpen(!networkMenuOpen);
                  setRoleMenuOpen(false);
                  setPatientMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                  networkStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
                    : networkStatus === 'poor'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/60'
                }`}
                title="Simulate network connectivity states"
              >
                {networkStatus === 'online' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                ) : networkStatus === 'poor' ? (
                  <CloudLightning className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span className="capitalize hidden md:inline">{networkStatus}</span>
              </button>

              {networkMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Connection Mode
                  </div>
                  <button
                    onClick={() => {
                      setNetworkStatus('online');
                      setNetworkMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      networkStatus === 'online' ? 'text-emerald-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p>Online (High Speed)</p>
                        <p className="text-[10px] text-slate-400">Full Cloud & Gemini Sync</p>
                      </div>
                    </div>
                    {networkStatus === 'online' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setNetworkStatus('poor');
                      setNetworkMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      networkStatus === 'poor' ? 'text-amber-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <CloudLightning className="w-4 h-4 text-amber-600" />
                      <div>
                        <p>Poor Network (2G / High Latency)</p>
                        <p className="text-[10px] text-slate-400">Prioritize Critical Vitals</p>
                      </div>
                    </div>
                    {networkStatus === 'poor' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setNetworkStatus('offline');
                      setNetworkMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      networkStatus === 'offline' ? 'text-rose-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <WifiOff className="w-4 h-4 text-rose-600" />
                      <div>
                        <p>Offline (Local Storage Only)</p>
                        <p className="text-[10px] text-slate-400">Queue actions locally</p>
                      </div>
                    </div>
                    {networkStatus === 'offline' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Offline Sync Queue indicator & manual trigger */}
            {syncQueue.length > 0 && (
              <button
                onClick={triggerManualSync}
                disabled={isSyncing}
                className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-medium transition cursor-pointer"
                title={`${syncQueue.length} unsynced offline changes. Click to sync now.`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="font-mono">{syncQueue.length} Queued</span>
              </button>
            )}

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSosModal}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">SOS</span>
            </button>

            {/* Active User Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleMenuOpen(!roleMenuOpen);
                  setPatientMenuOpen(false);
                  setNetworkMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${roleMeta[currentRole].color}`}
              >
                {roleMeta[currentRole].icon}
                <span className="hidden lg:inline">{roleMeta[currentRole].title}</span>
                <span className="lg:hidden capitalize">{currentRole}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch User Perspective
                  </div>
                  {(['patient', 'doctor', 'nurse', 'caregiver', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setCurrentRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        currentRole === r ? 'bg-slate-50 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded bg-slate-100">{roleMeta[r].icon}</div>
                        <div>
                          <p className="text-slate-900 font-medium capitalize">{r}</p>
                          <p className="text-[11px] text-slate-500">{roleMeta[r].title}</p>
                        </div>
                      </div>
                      {currentRole === r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                  <div className="px-3 pt-2 mt-1 border-t border-slate-100 text-[10px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Role-Based Access Control Active</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

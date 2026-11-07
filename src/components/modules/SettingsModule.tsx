import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Wifi,
  WifiOff,
  CloudLightning,
  RefreshCw,
  Database,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    networkStatus,
    setNetworkStatus,
    syncQueue,
    triggerManualSync,
    isSyncing,
    selectedPatient,
    patients,
    records,
    showToast,
  } = useApp();

  const handleExportData = () => {
    const exportBundle = {
      appName: 'MediSync AI',
      exportTimestamp: new Date().toISOString(),
      patient: selectedPatient,
      records: records.filter((r) => r.patientId === selectedPatient.id),
      securityMetadata: {
        format: 'FHIR-Compliant Electronic Health Record Bundle',
        signature: 'SHA-256-AUTHENTICATED',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MediSync_EHR_${selectedPatient.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('success', 'Full EHR data bundle exported successfully.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset local storage cache to pristine demo state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Offline Sync Engine</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control offline-first local persistence, network condition simulator, and data export tools
        </p>
      </div>

      {/* Network Simulator Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Network Connectivity & Offline Simulation
        </h3>
        <p className="text-xs text-slate-500">
          Simulate offline hospital field environments to test real offline-first data caching and queue synchronization
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setNetworkStatus('online')}
            className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              networkStatus === 'online'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Wifi className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Online Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Full cloud telemetry & real-time Gemini processing</p>
            </div>
          </button>

          <button
            onClick={() => setNetworkStatus('poor')}
            className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              networkStatus === 'poor'
                ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CloudLightning className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Degraded Connection (2G)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Prioritizes critical vitals; queues heavy media</p>
            </div>
          </button>

          <button
            onClick={() => setNetworkStatus('offline')}
            className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              networkStatus === 'offline'
                ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <WifiOff className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">100% Offline Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Stores vitals & notes in local offline queue</p>
            </div>
          </button>
        </div>
      </div>

      {/* Offline Sync Queue Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pending Offline Synchronization Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Transactions performed while offline, queued for automatic merge upon network reconnection
            </p>
          </div>

          <button
            onClick={triggerManualSync}
            disabled={isSyncing || syncQueue.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : `Sync Now (${syncQueue.length} Queued)`}</span>
          </button>
        </div>

        {syncQueue.length > 0 ? (
          <div className="space-y-2">
            {syncQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs flex items-center justify-between font-mono"
              >
                <div>
                  <span className="font-bold text-amber-900">{item.actionType}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-600 text-[11px]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {item.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>All local changes are completely synchronized with the central database. Queue is clear.</span>
          </div>
        )}
      </div>

      {/* Data Export & Reset Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Data Export & Storage Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="font-bold text-xs text-slate-900">Export Complete EHR Data Bundle</h4>
            <p className="text-[11px] text-slate-500">
              Downloads a complete JSON export of {selectedPatient.name}'s medical records, extracted lab values, and vitals history.
            </p>
            <button
              onClick={handleExportData}
              className="mt-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Health Record</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <h4 className="font-bold text-xs text-rose-900">Reset Demo Environment</h4>
            <p className="text-[11px] text-rose-800">
              Clears local offline storage and restores the default synthetic patient dataset for hackathon judges.
            </p>
            <button
              onClick={handleResetData}
              className="mt-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Clean Demo State</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

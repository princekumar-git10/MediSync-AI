import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck,
  UserCheck,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';

export const PrivacySecurityModule: React.FC = () => {
  const { auditLogs, selectedPatient, currentRole, showToast } = useApp();

  const [filterAction, setFilterAction] = useState<string>('all');
  const [consentFamily, setConsentFamily] = useState(true);
  const [consentEmergencyOverride, setConsentEmergencyOverride] = useState(true);
  const [consentResearch, setConsentResearch] = useState(false);

  const filteredLogs = auditLogs.filter(
    (log) => filterAction === 'all' || log.action === filterAction
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Privacy, Security & HIPAA Audit Trail</h2>
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            HIPAA Security Rule § 164.312 Compliant
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable cryptographic access logs, role-based access enforcement, and patient data consent controls
        </p>
      </div>

      {/* 3 Security Posture Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Encryption Standard</span>
            <p className="text-sm font-bold text-slate-900">AES-256 At-Rest & TLS 1.3</p>
            <p className="text-[10px] text-emerald-700">Encrypted on device & in transit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Access Control Policy</span>
            <p className="text-sm font-bold text-slate-900">RBAC Strict Separation</p>
            <p className="text-[10px] text-teal-700">Role-gated clinical records</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Audit Trail Verifier</span>
            <p className="text-sm font-bold text-slate-900">Immutable Logging Active</p>
            <p className="text-[10px] text-sky-700">Every view & edit logged</p>
          </div>
        </div>

      </div>

      {/* Patient Consent & Privacy Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Patient Consent Preferences ({selectedPatient.name})
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Family Caregiver Record Sharing</p>
              <p className="text-[11px] text-slate-500">
                Grants David Rostova (Son) access to medication schedules, daily logs, and care plans.
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentFamily}
              onChange={(e) => {
                setConsentFamily(e.target.checked);
                showToast('info', 'Caregiver access consent updated.');
              }}
              className="w-5 h-5 text-emerald-600 rounded"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Emergency Medical Override Permission</p>
              <p className="text-[11px] text-slate-500">
                Allows attending physicians immediate break-glass access if NEWS2 score ≥ 7 or SOS triggered.
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentEmergencyOverride}
              onChange={(e) => {
                setConsentEmergencyOverride(e.target.checked);
                showToast('info', 'Emergency override policy updated.');
              }}
              className="w-5 h-5 text-emerald-600 rounded"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">De-identified Population Research Participation</p>
              <p className="text-[11px] text-slate-500">
                Share anonymized metabolic data with diabetic research networks (zero personal identifiers).
              </p>
            </div>
            <input
              type="checkbox"
              checked={consentResearch}
              onChange={(e) => {
                setConsentResearch(e.target.checked);
                showToast('info', 'Research participation preference updated.');
              }}
              className="w-5 h-5 text-emerald-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Immutable HIPAA Access & Transaction Log
            </h3>
            <p className="text-xs text-slate-500">Real-time ledger of all user interactions</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Filter:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="all">All Actions</option>
              <option value="RECORD_VITALS">RECORD_VITALS</option>
              <option value="VIEW_RECORD">VIEW_RECORD</option>
              <option value="UPLOAD_REPORT">UPLOAD_REPORT</option>
              <option value="APPROVE_NOTE">APPROVE_NOTE</option>
              <option value="EMERGENCY_OVERRIDE">EMERGENCY_OVERRIDE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans text-[10px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Action Details</th>
                <th className="py-2.5 px-3">Terminal / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{log.userRole}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'EMERGENCY_OVERRIDE' ? 'bg-rose-100 text-rose-800' :
                      log.action === 'RECORD_VITALS' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'UPLOAD_REPORT' ? 'bg-teal-100 text-teal-800' :
                      log.action === 'APPROVE_NOTE' ? 'bg-sky-100 text-sky-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] font-sans">
                    {log.resourceType}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px] max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                    {log.ipAddress.split(' ')[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

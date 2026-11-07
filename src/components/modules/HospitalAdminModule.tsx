import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HospitalBed } from '../../types';
import {
  Building2,
  Users,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const HospitalAdminModule: React.FC = () => {
  const { hospitalBeds, updateBedStatus, patients, setSelectedPatientId, showToast } = useApp();
  const [selectedWard, setSelectedWard] = useState<string>('all');

  const totalBeds = hospitalBeds.length;
  const occupiedBeds = hospitalBeds.filter((b) => b.status === 'occupied').length;
  const availableBeds = hospitalBeds.filter((b) => b.status === 'available').length;
  const cleaningBeds = hospitalBeds.filter((b) => b.status === 'cleaning').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const filteredBeds = hospitalBeds.filter((b) => selectedWard === 'all' || b.ward === selectedWard);

  const handleToggleBed = (bed: HospitalBed) => {
    let nextStatus: HospitalBed['status'] = 'available';
    if (bed.status === 'available') nextStatus = 'occupied';
    else if (bed.status === 'occupied') nextStatus = 'cleaning';
    else if (bed.status === 'cleaning') nextStatus = 'available';

    updateBedStatus(bed.id, { status: nextStatus });
    showToast('info', `Bed ${bed.bedNumber} marked as ${nextStatus.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Administration & Bed Management</h2>
            <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold">
              Admin Access Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time census, ward capacity allocation, triage bottleneck tracking, and nursing staff ratios
          </p>
        </div>

        {/* Filter Ward */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Ward:</span>
          </span>
          {['all', 'ICU', 'Step-Down', 'General Medicine', 'Surgical Post-Op'].map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                selectedWard === w
                  ? 'bg-purple-700 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Census Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Overall Bed Occupancy</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{occupancyRate}%</span>
            <span className="text-xs text-slate-500">{occupiedBeds} / {totalBeds} beds</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Available Clean Beds</span>
            <Bed className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{availableBeds}</div>
          <p className="text-[11px] text-emerald-700 mt-2">Ready for immediate patient intake</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Nurse-to-Patient Ratio</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">1 : 3.2</div>
          <p className="text-[11px] text-teal-700 mt-2">Meets acuity compliance standard</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Beds in Turnover / Cleaning</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{cleaningBeds}</div>
          <p className="text-[11px] text-amber-700 mt-2">Avg turnover turnaround: 28 mins</p>
        </div>

      </div>

      {/* Ward Bed Grid Layout */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ward Bed Allocation Map & Telemetry Status
            </h3>
            <p className="text-xs text-slate-500">Click any bed to toggle intake status or view assigned telemetry</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 text-[11px]">Occupied</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 text-[11px]">Available</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 text-[11px]">Cleaning</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredBeds.map((bed) => (
            <div
              key={bed.id}
              onClick={() => handleToggleBed(bed)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between h-36 ${
                bed.status === 'occupied'
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                  : bed.status === 'available'
                  ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                  : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono text-slate-900">{bed.bedNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    bed.status === 'occupied' ? 'bg-rose-200 text-rose-900' :
                    bed.status === 'available' ? 'bg-emerald-200 text-emerald-900' :
                    'bg-amber-200 text-amber-900'
                  }`}>
                    {bed.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{bed.ward}</p>

                {bed.patientName && (
                  <div className="mt-2 text-xs">
                    <p className="font-bold text-slate-900 truncate">{bed.patientName}</p>
                    {bed.patientNews2 !== undefined && (
                      <span className={`inline-block text-[10px] font-bold px-1.5 rounded mt-0.5 ${
                        bed.patientNews2 >= 7 ? 'bg-rose-600 text-white' :
                        bed.patientNews2 >= 5 ? 'bg-amber-500 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        NEWS2: {bed.patientNews2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 truncate">
                {bed.assignedNurse || 'Unassigned'}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

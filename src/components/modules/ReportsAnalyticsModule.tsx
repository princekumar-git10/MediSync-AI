import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Activity,
  HeartPulse,
  DollarSign,
  Award,
  Users,
} from 'lucide-react';

export const ReportsAnalyticsModule: React.FC = () => {
  const { patients, records } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Quality & Population Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterioration prevention rates, duplicate lab avoidance savings, and ward escalation telemetry
        </p>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Deterioration Intercept Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">94.8%</div>
          <p className="text-[11px] text-emerald-700 mt-2">
            +4.2% improvement vs traditional 6-hour ward vitals check
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Duplicate Test Avoidance</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">$18,450</div>
          <p className="text-[11px] text-teal-700 mt-2">
            Saved across 42 redundant lab orders intercepted
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Average SBAR Transfer Time</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">3.4 min</div>
          <p className="text-[11px] text-sky-700 mt-2">
            Standardized digital structure cut handoff time by 58%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>30-Day Readmission Risk</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">8.2%</div>
          <p className="text-[11px] text-amber-700 mt-2">
            Down from 14.1% regional baseline
          </p>
        </div>

      </div>

      {/* Ward Telemetry Breakdown & Early Warning Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ward Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ward Escalations & Rapid Response Dispatches (Last 30 Days)
          </h3>

          <div className="space-y-3">
            {[
              { ward: 'Intensive Care Unit (ICU)', escalations: 24, rate: '98% early warning capture', color: 'bg-rose-500', pct: 98 },
              { ward: 'Step-Down Cardiac Unit', escalations: 18, rate: '94% early warning capture', color: 'bg-amber-500', pct: 94 },
              { ward: 'General Medicine (Ward 4B & 2C)', escalations: 12, rate: '92% early warning capture', color: 'bg-emerald-500', pct: 92 },
              { ward: 'Surgical Post-Operative', escalations: 7, rate: '96% early warning capture', color: 'bg-teal-500', pct: 96 },
            ].map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{w.ward}</span>
                  <span className="font-mono text-slate-600">{w.escalations} escalations</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className={`${w.color} h-2 rounded-full`} style={{ width: `${w.pct}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500">{w.rate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Measures */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Clinical Governance & Accreditation Milestones
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/40 flex items-start space-x-3">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">NEWS2 Automated Escalation Protocol</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  100% adherence to Royal College of Physicians clinical trigger escalation guidelines.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-teal-50/40 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Zero Medication Administration Omissions</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Digital MAR barcode & verification prevented missed or duplicate insulin doses this cycle.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start space-x-3">
              <HeartPulse className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Offline Continuity of Care Compliance</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Guarantees continuous vitals logging and medication delivery during network dropouts.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

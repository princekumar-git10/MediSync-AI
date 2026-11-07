import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateNEWS2 } from '../../utils/news2';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Gauge,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  PhoneCall,
  Save,
  RotateCcw,
} from 'lucide-react';

export const PulseGuardModule: React.FC = () => {
  const {
    selectedPatient,
    recordVitals,
    vitalsHistory,
    showToast,
    triggerEmergencySos,
  } = useApp();

  // Current inputs for the NEWS2 calculator
  const curV = selectedPatient.currentVitals;
  const [rr, setRr] = useState<number>(curV.respiratoryRate);
  const [spo2, setSpo2] = useState<number>(curV.spo2);
  const [o2, setO2] = useState<boolean>(curV.onSupplementalOxygen);
  const [sbp, setSbp] = useState<number>(curV.systolicBp);
  const [dbp, setDbp] = useState<number>(curV.diastolicBp);
  const [hr, setHr] = useState<number>(curV.heartRate);
  const [temp, setTemp] = useState<number>(curV.temperature);
  const [avpu, setAvpu] = useState<'Alert' | 'Voice' | 'Pain' | 'Unresponsive'>(curV.consciousness);

  // AI Early Warning Assessment State
  const [isAssessing, setIsAssessing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);

  // Dynamic live NEWS2 calculation
  const calculated = calculateNEWS2({
    respiratoryRate: rr,
    spo2,
    onSupplementalOxygen: o2,
    systolicBp: sbp,
    heartRate: hr,
    temperature: temp,
    consciousness: avpu,
  });

  const patientTrends = vitalsHistory[selectedPatient.id] || [];

  // Run AI physiological assessment via Gemini
  const handleRunAiAssessment = async () => {
    setIsAssessing(true);
    showToast('info', 'Evaluating physiological trajectory and neuro-hormonal compensatory patterns...');

    try {
      const res = await fetch('/api/gemini/pulseguard-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vitals: {
            respiratoryRate: rr,
            spo2,
            onSupplementalOxygen: o2,
            systolicBp: sbp,
            diastolicBp: dbp,
            heartRate: hr,
            temperature: temp,
            consciousness: avpu,
          },
          patientHistory: {
            name: selectedPatient.name,
            age: selectedPatient.age,
            chronicConditions: selectedPatient.chronicConditions.map((c) => c.name),
            allergies: selectedPatient.allergies.map((a) => a.allergen),
          },
          rawNews2Score: calculated.totalScore,
        }),
      });

      const data = await res.json();
      setAiAssessment(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'PulseGuard evaluation encountered an error');
    } finally {
      setIsAssessing(false);
    }
  };

  // Save vitals into patient record
  const handleSaveVitals = async () => {
    await recordVitals(selectedPatient.id, {
      respiratoryRate: rr,
      spo2,
      onSupplementalOxygen: o2,
      systolicBp: sbp,
      diastolicBp: dbp,
      heartRate: hr,
      temperature: temp,
      consciousness: avpu,
    });
  };

  // Quick preset triggers to test escalation
  const applyPreset = (preset: 'normal' | 'moderate' | 'critical') => {
    if (preset === 'normal') {
      setRr(16);
      setSpo2(98);
      setO2(false);
      setSbp(122);
      setDbp(78);
      setHr(72);
      setTemp(36.8);
      setAvpu('Alert');
    } else if (preset === 'moderate') {
      setRr(22);
      setSpo2(94);
      setO2(false);
      setSbp(108);
      setDbp(70);
      setHr(98);
      setTemp(37.6);
      setAvpu('Alert');
    } else if (preset === 'critical') {
      setRr(28);
      setSpo2(89);
      setO2(true);
      setSbp(88);
      setDbp(54);
      setHr(126);
      setTemp(38.6);
      setAvpu('Voice');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">PulseGuard AI Clinical Early Warning</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              NEWS2 & qSOFA Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time vital signs deterioration score, explainable physiological mechanisms, and clinical escalation guidance
          </p>
        </div>

        {/* Action Presets */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-xs text-slate-400 hidden lg:inline">Simulate State:</span>
          <button
            onClick={() => applyPreset('normal')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
          >
            Stable (0)
          </button>
          <button
            onClick={() => applyPreset('moderate')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
          >
            Moderate (4)
          </button>
          <button
            onClick={() => applyPreset('critical')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200"
          >
            Critical (13)
          </button>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className={`p-6 rounded-3xl border-2 transition-all shadow-md ${
        calculated.riskTier === 'Critical' ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-rose-100' :
        calculated.riskTier === 'High' ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-amber-100' :
        calculated.riskTier === 'Medium' ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-teal-100' :
        'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-3xl shadow-inner ${
              calculated.riskTier === 'Critical' ? 'bg-rose-600 text-white' :
              calculated.riskTier === 'High' ? 'bg-amber-600 text-white' :
              calculated.riskTier === 'Medium' ? 'bg-teal-600 text-white' :
              'bg-emerald-600 text-white'
            }`}>
              <span>{calculated.totalScore}</span>
              <span className="text-[10px] tracking-normal uppercase font-sans font-semibold opacity-90">NEWS2</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {calculated.riskTier} Clinical Risk Deterioration Alert
                </h3>
              </div>
              <p className="text-xs mt-1 max-w-xl font-medium leading-relaxed opacity-90">
                {calculated.clinicalAction}
              </p>
              <div className="flex items-center space-x-3 mt-3 text-xs">
                <span className="flex items-center space-x-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span>Monitoring Frequency: {calculated.recommendedMonitoringFrequency}</span>
                </span>
                {calculated.singleTriggerScore3 && (
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                    Single Parameter Score 3 Triggered
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
            <button
              onClick={handleSaveVitals}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 border border-slate-300 shadow-xs hover:bg-slate-50 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-600" />
              <span>Record & Log to Chart</span>
            </button>
            <button
              onClick={handleRunAiAssessment}
              disabled={isAssessing}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAssessing ? 'animate-spin' : ''}`} />
              <span>{isAssessing ? 'Assessing Physiology...' : 'Explain Clinical Mechanism'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 7 Vitals Parameter Tuner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Vital Signs Measurement & NEWS2 Sub-Score Breakdown
            </h3>
            <p className="text-xs text-slate-500">Royal College of Physicians Standard Scoring System</p>
          </div>
          <button
            onClick={() => applyPreset('normal')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Respiratory Rate */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>Respiration Rate</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.respiratoryRate.score >= 3 ? 'bg-rose-100 text-rose-800' :
                calculated.subscores.respiratoryRate.score > 0 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.respiratoryRate.score} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <input
                type="number"
                min="6"
                max="45"
                value={rr}
                onChange={(e) => setRr(Number(e.target.value))}
                className="w-20 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-xs text-slate-500 font-mono">breaths/min</span>
            </div>
            <p className="text-[10px] text-slate-400">Normal range: 12 - 20 bpm</p>
          </div>

          {/* 2. SpO2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span>Oxygen Saturation</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.spo2.score >= 3 ? 'bg-rose-100 text-rose-800' :
                calculated.subscores.spo2.score > 0 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.spo2.score} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <input
                type="number"
                min="70"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-20 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-xs text-slate-500 font-mono">% SpO2</span>
            </div>
            <p className="text-[10px] text-slate-400">Normal: ≥ 96% on room air</p>
          </div>

          {/* 3. Supplemental Oxygen */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Supplemental O2</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                o2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.supplementalOxygen.score} pts
              </span>
            </div>
            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={o2}
                  onChange={(e) => setO2(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800">Receiving Oxygen Therapy</span>
              </label>
            </div>
            <p className="text-[10px] text-slate-400">Nasal cannula, mask, or CPAP</p>
          </div>

          {/* 4. Blood Pressure */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span>Systolic BP</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.systolicBp.score >= 3 ? 'bg-rose-100 text-rose-800' :
                calculated.subscores.systolicBp.score > 0 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.systolicBp.score} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <input
                type="number"
                min="60"
                max="240"
                value={sbp}
                onChange={(e) => setSbp(Number(e.target.value))}
                className="w-16 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-slate-400">/</span>
              <input
                type="number"
                min="40"
                max="140"
                value={dbp}
                onChange={(e) => setDbp(Number(e.target.value))}
                className="w-16 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-[11px] text-slate-500 font-mono">mmHg</span>
            </div>
            <p className="text-[10px] text-slate-400">Normal systolic: 111 - 219 mmHg</p>
          </div>

          {/* 5. Heart Rate */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>Heart Rate (Pulse)</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.heartRate.score >= 3 ? 'bg-rose-100 text-rose-800' :
                calculated.subscores.heartRate.score > 0 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.heartRate.score} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <input
                type="number"
                min="30"
                max="200"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-20 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-xs text-slate-500 font-mono">bpm</span>
            </div>
            <p className="text-[10px] text-slate-400">Normal: 51 - 90 bpm</p>
          </div>

          {/* 6. Body Temperature */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Temperature</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.temperature.score >= 3 ? 'bg-rose-100 text-rose-800' :
                calculated.subscores.temperature.score > 0 ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.temperature.score} pts
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <input
                type="number"
                step="0.1"
                min="33"
                max="42"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-20 text-xl font-bold font-mono p-1 rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-xs text-slate-500 font-mono">°C</span>
            </div>
            <p className="text-[10px] text-slate-400">Normal: 36.1 - 38.0 °C</p>
          </div>

          {/* 7. Consciousness ACVPU */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Consciousness (ACVPU Scale)</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                calculated.subscores.consciousness.score > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                +{calculated.subscores.consciousness.score} pts
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['Alert', 'Voice', 'Pain', 'Unresponsive'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAvpu(status)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition ${
                    avpu === status
                      ? status === 'Alert'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Alert = 0 pts; Any new confusion/CVPU = 3 pts</p>
          </div>

        </div>
      </div>

      {/* AI Physiological Mechanism Explanation Card */}
      {aiAssessment && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Explainable Physiological Mechanism (PulseGuard AI)</h4>
              <p className="text-xs text-slate-500">Biological causality & neuro-hormonal response model</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Biological Mechanism:</span>
              <p className="text-slate-700 leading-relaxed">{aiAssessment.physiologicalMechanism}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
              <span className="font-bold block mb-1">Expected 4-Hour Deterioration Trajectory:</span>
              <p className="leading-relaxed">{aiAssessment.deteriorationTrajectory}</p>
            </div>

            {aiAssessment.immediateActions?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  Evidence-Based Clinical Protocol Actions:
                </span>
                <ul className="space-y-1.5">
                  {aiAssessment.immediateActions.map((action: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Longitudinal Vitals Trend Progression */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Longitudinal Vital Signs Trend</h4>
            <p className="text-xs text-slate-500">Hourly trajectory leading up to current reading</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Ward Telemetry Link</span>
        </div>

        {patientTrends.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Resp Rate</th>
                  <th className="py-2.5 px-3">SpO2</th>
                  <th className="py-2.5 px-3">Pulse (HR)</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">Temp</th>
                  <th className="py-2.5 px-3">NEWS2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientTrends.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{t.time}</td>
                    <td className="py-2.5 px-3">{t.rr} /min</td>
                    <td className="py-2.5 px-3">{t.spo2}%</td>
                    <td className="py-2.5 px-3">{t.hr} bpm</td>
                    <td className="py-2.5 px-3">{t.bp}</td>
                    <td className="py-2.5 px-3">{t.temp}°C</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.news2 >= 7 ? 'bg-rose-100 text-rose-800' :
                        t.news2 >= 5 ? 'bg-amber-100 text-amber-800' :
                        t.news2 >= 3 ? 'bg-teal-100 text-teal-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.news2}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No longitudinal trend recordings available.</p>
        )}
      </div>

    </div>
  );
};

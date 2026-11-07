import { VitalSignReading } from '../types';

export interface News2Breakdown {
  totalScore: number;
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  subscores: {
    respiratoryRate: { value: number; score: number };
    spo2: { value: number; score: number };
    supplementalOxygen: { value: boolean; score: number };
    systolicBp: { value: number; score: number };
    heartRate: { value: number; score: number };
    temperature: { value: number; score: number };
    consciousness: { value: string; score: number };
  };
  singleTriggerScore3: boolean;
  clinicalAction: string;
  recommendedMonitoringFrequency: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export function calculateNEWS2(vitals: Partial<VitalSignReading>): News2Breakdown {
  const rr = vitals.respiratoryRate ?? 16;
  const spo2 = vitals.spo2 ?? 98;
  const o2 = vitals.onSupplementalOxygen ?? false;
  const sbp = vitals.systolicBp ?? 120;
  const hr = vitals.heartRate ?? 75;
  const temp = vitals.temperature ?? 36.8;
  const avpu = vitals.consciousness ?? 'Alert';

  // 1. Respiration Rate
  let rrScore = 0;
  if (rr <= 8) rrScore = 3;
  else if (rr >= 9 && rr <= 11) rrScore = 1;
  else if (rr >= 12 && rr <= 20) rrScore = 0;
  else if (rr >= 21 && rr <= 24) rrScore = 2;
  else if (rr >= 25) rrScore = 3;

  // 2. Oxygen Saturation
  let spo2Score = 0;
  if (spo2 <= 91) spo2Score = 3;
  else if (spo2 >= 92 && spo2 <= 93) spo2Score = 2;
  else if (spo2 >= 94 && spo2 <= 95) spo2Score = 1;
  else spo2Score = 0;

  // 3. Supplemental Oxygen
  const o2Score = o2 ? 2 : 0;

  // 4. Systolic Blood Pressure
  let sbpScore = 0;
  if (sbp <= 90) sbpScore = 3;
  else if (sbp >= 91 && sbp <= 100) sbpScore = 2;
  else if (sbp >= 101 && sbp <= 110) sbpScore = 1;
  else if (sbp >= 111 && sbp <= 219) sbpScore = 0;
  else sbpScore = 3;

  // 5. Pulse (Heart Rate)
  let hrScore = 0;
  if (hr <= 40) hrScore = 3;
  else if (hr >= 41 && hr <= 50) hrScore = 1;
  else if (hr >= 51 && hr <= 90) hrScore = 0;
  else if (hr >= 91 && hr <= 110) hrScore = 1;
  else if (hr >= 111 && hr <= 130) hrScore = 2;
  else hrScore = 3;

  // 6. Consciousness (ACVPU)
  const avpuScore = avpu === 'Alert' ? 0 : 3;

  // 7. Temperature
  let tempScore = 0;
  if (temp <= 35.0) tempScore = 3;
  else if (temp >= 35.1 && temp <= 36.0) tempScore = 1;
  else if (temp >= 36.1 && temp <= 38.0) tempScore = 0;
  else if (temp >= 38.1 && temp <= 39.0) tempScore = 1;
  else tempScore = 2;

  const totalScore = rrScore + spo2Score + o2Score + sbpScore + hrScore + avpuScore + tempScore;
  const singleTriggerScore3 = [rrScore, spo2Score, sbpScore, hrScore, avpuScore, tempScore].some(s => s >= 3);

  let riskTier: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let clinicalAction = 'Routine ward-based monitoring. Registered nurse review.';
  let monitoringFreq = 'Every 4–6 hours';
  let colorClass = {
    bg: 'bg-emerald-50 text-emerald-900',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  if (totalScore >= 7) {
    riskTier = 'Critical';
    clinicalAction = 'Emergency assessment by Critical Care Outreach / Rapid Response Team. Continuous vitals monitoring. Prepare for ICU transfer.';
    monitoringFreq = 'Continuous electronic monitoring';
    colorClass = {
      bg: 'bg-rose-50 text-rose-950',
      text: 'text-rose-600',
      border: 'border-rose-300',
      badge: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  } else if (totalScore >= 5 || singleTriggerScore3) {
    riskTier = totalScore >= 5 ? 'High' : 'Medium';
    clinicalAction = 'Urgent review by ward doctor or medical registrar. Inform nurse in charge. Consider sepsis screening protocol.';
    monitoringFreq = 'At least every 1 hour';
    colorClass = {
      bg: 'bg-amber-50 text-amber-950',
      text: 'text-amber-700',
      border: 'border-amber-300',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  } else if (totalScore >= 1) {
    riskTier = 'Low';
    clinicalAction = 'Inform registered nurse; nurse to decide if escalation or increased frequency of monitoring is warranted.';
    monitoringFreq = 'Every 4 hours';
    colorClass = {
      bg: 'bg-teal-50 text-teal-950',
      text: 'text-teal-700',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-800 border-teal-300'
    };
  }

  return {
    totalScore,
    riskTier,
    subscores: {
      respiratoryRate: { value: rr, score: rrScore },
      spo2: { value: spo2, score: spo2Score },
      supplementalOxygen: { value: o2, score: o2Score },
      systolicBp: { value: sbp, score: sbpScore },
      heartRate: { value: hr, score: hrScore },
      temperature: { value: temp, score: tempScore },
      consciousness: { value: avpu, score: avpuScore },
    },
    singleTriggerScore3,
    clinicalAction,
    recommendedMonitoringFrequency: monitoringFreq,
    colorClass,
  };
}

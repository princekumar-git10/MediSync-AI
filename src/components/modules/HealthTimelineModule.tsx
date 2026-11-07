import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Calendar,
  Activity,
  Pill,
  Scissors,
  FileText,
  AlertTriangle,
  Building,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const HealthTimelineModule: React.FC = () => {
  const { selectedPatient, patientRecords } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  // Synthesize unified chronological events
  const timelineEvents: Array<{
    id: string;
    date: string;
    type: 'diagnosis' | 'surgery' | 'medication' | 'lab' | 'admission';
    title: string;
    subtitle: string;
    details: string;
    statusBadge?: string;
    badgeColor?: string;
  }> = [];

  // 1. Diagnoses
  selectedPatient.chronicConditions.forEach((c) => {
    timelineEvents.push({
      id: `ev-${c.id}`,
      date: c.diagnosedDate,
      type: 'diagnosis',
      title: `Diagnosis: ${c.name}`,
      subtitle: `ICD-10: ${c.icd10} • Severity: ${c.severity}`,
      details: c.notes,
      statusBadge: c.status,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    });
  });

  // 2. Surgeries
  selectedPatient.surgeries.forEach((s) => {
    timelineEvents.push({
      id: `ev-${s.id}`,
      date: s.date,
      type: 'surgery',
      title: `Surgical Procedure: ${s.procedureName}`,
      subtitle: `${s.hospital} • Surgeon: ${s.surgeon}`,
      details: s.notes,
      statusBadge: 'Completed',
      badgeColor: 'bg-teal-100 text-teal-800',
    });
  });

  // 3. Medications
  selectedPatient.activeMedications.forEach((m) => {
    timelineEvents.push({
      id: `ev-${m.id}`,
      date: m.startDate,
      type: 'medication',
      title: `Prescription Initiated: ${m.name} (${m.dosage})`,
      subtitle: `${m.frequency} • Prescribed by ${m.prescribedBy}`,
      details: m.instructions,
      statusBadge: m.status,
      badgeColor: 'bg-sky-100 text-sky-800',
    });
  });

  // 4. Lab Reports
  patientRecords.forEach((r) => {
    timelineEvents.push({
      id: `ev-${r.id}`,
      date: r.documentDate,
      type: 'lab',
      title: `Lab Battery: ${r.title}`,
      subtitle: `${r.facility} • ${r.extractedValues?.length || 0} analytes extracted`,
      details: r.summaryPatient,
      statusBadge: r.isDuplicateRisk ? 'Duplicate Alert' : 'Verified',
      badgeColor: r.isDuplicateRisk ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
    });
  });

  // Sort descending by date
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = timelineEvents.filter((e) => filterType === 'all' || e.type === filterType);

  const typeIcons: Record<string, React.ReactNode> = {
    diagnosis: <Activity className="w-4 h-4 text-emerald-600" />,
    surgery: <Scissors className="w-4 h-4 text-teal-600" />,
    medication: <Pill className="w-4 h-4 text-sky-600" />,
    lab: <FileText className="w-4 h-4 text-amber-600" />,
    admission: <Building className="w-4 h-4 text-purple-600" />,
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chronological Health Timeline</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono">
              {filteredEvents.length} milestones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete longitudinal medical history for {selectedPatient.name} (MRN: {selectedPatient.mrn})
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </span>
          {['all', 'diagnosis', 'medication', 'lab', 'surgery'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                filterType === t
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 py-2">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="relative pl-6 sm:pl-8 group">
              
              {/* Timeline marker icon node */}
              <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center shadow-2xs transition">
                {typeIcons[ev.type]}
              </div>

              {/* Event Content Card */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 p-4 rounded-2xl transition shadow-2xs space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ev.date}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {ev.type}
                    </span>
                  </div>
                  {ev.statusBadge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto ${ev.badgeColor}`}>
                      {ev.statusBadge}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                <p className="text-xs font-medium text-slate-600">{ev.subtitle}</p>
                <p className="text-xs text-slate-500 pt-1 leading-relaxed border-t border-slate-200/60 mt-2">
                  {ev.details}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

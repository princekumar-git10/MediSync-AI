import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, FileText, User, Activity, Pill, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { patients, records, setSelectedPatientId } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { patients: [], records: [], medications: [] };

    const q = query.toLowerCase();

    // 1. Patients
    const matchedPatients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.chronicConditions.some((c) => c.name.toLowerCase().includes(q) || c.icd10.toLowerCase().includes(q))
    );

    // 2. Records & Lab analytes
    const matchedRecords = records.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.extractedValues?.some((v) => v.testName.toLowerCase().includes(q))
    );

    // 3. Medications
    const matchedMeds: Array<{ patientName: string; patientId: string; medName: string; dose: string }> = [];
    patients.forEach((p) => {
      p.activeMedications.forEach((m) => {
        if (m.name.toLowerCase().includes(q) || m.instructions.toLowerCase().includes(q)) {
          matchedMeds.push({
            patientName: p.name,
            patientId: p.id,
            medName: m.name,
            dose: m.dosage,
          });
        }
      });
    });

    return {
      patients: matchedPatients,
      records: matchedRecords,
      medications: matchedMeds,
    };
  }, [query, patients, records]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, lab tests (e.g. Glucose, eGFR), medications, or ICD codes..."
            className="w-full py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              <p className="text-xs font-medium">Type any clinical term, analyte name, patient name, or medication</p>
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                {['Elena', 'HbA1c', 'eGFR', 'Metformin', 'NEWS2', 'Troponin'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Patient Results */}
              {searchResults.patients.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Patients ({searchResults.patients.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          onNavigate('overview');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.mrn} • {p.age}yo • {p.chronicConditions.map((c) => c.name).join(', ')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Records & Analytes */}
              {searchResults.records.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Medical Documents & Lab Results ({searchResults.records.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.records.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedPatientId(r.patientId);
                          onNavigate('records');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-teal-50/70 border border-transparent hover:border-teal-200 flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">{r.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {r.category} • {r.documentDate} • {r.extractedValues?.length || 0} analytes extracted
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {searchResults.medications.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-amber-600" />
                    <span>Medications ({searchResults.medications.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {searchResults.medications.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPatientId(m.patientId);
                          onNavigate('records');
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/70 border border-transparent hover:border-amber-200 flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900">{m.medName}</p>
                          <p className="text-[11px] text-slate-500">
                            Dosage: {m.dose} • Patient: {m.patientName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.patients.length === 0 &&
                searchResults.records.length === 0 &&
                searchResults.medications.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No results found matching "{query}". Try checking the spelling or searching by category.
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

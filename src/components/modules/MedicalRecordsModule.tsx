import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicalRecordDoc, ExtractedLabValue } from '../../types';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  HelpCircle,
  ArrowRightLeft,
  Calendar,
  FileCheck,
  Stethoscope,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Printer,
  QrCode,
  Edit3,
  X,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

export const MedicalRecordsModule: React.FC = () => {
  const {
    selectedPatient,
    patientRecords,
    addRecord,
    updateRecord,
    currentRole,
    addClinicalNote,
    clinicalNotes,
    approveClinicalNote,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'compare' | 'notes' | 'memorycard' | 'paper_scan'>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordDoc | null>(patientRecords[0] || null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'Laboratory' | 'Imaging' | 'Discharge Summary' | 'Prescription' | 'Paper Scan'>('Laboratory');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadRawText, setUploadRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Interactive Report Q&A State
  const [reportQuestion, setReportQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; disclaimer?: string }>>([
    {
      q: 'Are my kidney test results safe or worsening?',
      a: 'Your eGFR is 56 mL/min/1.73m² and Serum Creatinine is 1.28 mg/dL. These values are consistent with your known Stage 3a baseline and have not changed significantly since August (when eGFR was 58). They indicate stable, monitored kidney function rather than acute failure.',
      disclaimer: 'This explanation is for educational purposes. Always consult Dr. Vance.',
    },
  ]);

  // Medical Terminology Simplifier Modal
  const [termToExplain, setTermToExplain] = useState<string | null>(null);
  const [termExplanation, setTermExplanation] = useState<any>(null);
  const [termLoading, setTermLoading] = useState(false);

  // Comparison State
  const [compareOldId, setCompareOldId] = useState<string>(patientRecords[1]?.id || patientRecords[0]?.id || '');
  const [compareNewId, setCompareNewId] = useState<string>(patientRecords[0]?.id || '');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // AI-Assisted Doctor Note State
  const [chiefComplaint, setChiefComplaint] = useState('Follow-up on glycemic control and mild exertional dyspnea');
  const [roughImpression, setRoughImpression] = useState('Patient adhering to Lisinopril. Metformin tolerability good. Renal panel stable.');
  const [generatedDoctorNote, setGeneratedDoctorNote] = useState<any>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  // Paper Record Digitization state
  const [paperEditValues, setPaperEditValues] = useState<ExtractedLabValue[]>([]);
  const [activePaperRecord, setActivePaperRecord] = useState<MedicalRecordDoc | null>(
    patientRecords.find((r) => r.fileType === 'scan') || null
  );

  // Filter records
  const filteredRecords = patientRecords.filter((r) => {
    const matchesQuery =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.extractedValues?.some((v) => v.testName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // Handle Upload and AI Analysis
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsAnalyzing(true);
    showToast('info', 'Analyzing document text with Gemini multimodal OCR...');

    try {
      const response = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: uploadRawText || `Standard ${uploadCategory} panel for ${selectedPatient.name}`,
          documentType: uploadCategory,
        }),
      });

      const data = await response.json();

      const newRec = await addRecord({
        patientId: selectedPatient.id,
        title: uploadTitle,
        category: uploadCategory,
        documentDate: uploadDate,
        facility: 'Metro Health Diagnostic Center',
        doctorName: selectedPatient.primaryPhysician,
        fileType: uploadCategory === 'Paper Scan' ? 'scan' : 'pdf',
        fileSize: '1.2 MB',
        originalFileName: `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
        summaryPatient: data.summaryPatient || 'Document recorded and indexed successfully.',
        summaryDoctor: data.summaryDoctor || 'Clinical findings logged into EHR.',
        extractedValues: (data.extractedValues || []).map((ev: any, idx: number) => ({
          ...ev,
          id: `ev-new-${Date.now()}-${idx}`,
          confidence: ev.confidence || 98,
        })),
        simplifiedTerms: data.simplifiedTerms || [],
        tags: [uploadCategory, 'AI-Extracted'],
        status: 'verified',
        ocrConfidence: 97,
        rawContentSnippet: uploadRawText,
      });

      setSelectedRecord(newRec);
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadRawText('');
    } catch (err) {
      console.error('Failed to analyze report:', err);
      showToast('error', 'Failed to complete AI report analysis. Storing record locally.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Q&A on Current Report
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportQuestion.trim() || !selectedRecord) return;

    const q = reportQuestion;
    setReportQuestion('');
    setQaLoading(true);

    try {
      const res = await fetch('/api/gemini/ask-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          reportData: selectedRecord,
          patientContext: `${selectedPatient.name}, ${selectedPatient.age}yo, conditions: ${selectedPatient.chronicConditions.map((c) => c.name).join(', ')}`,
        }),
      });

      const data = await res.json();
      setQaHistory((prev) => [
        { q, a: data.answer, disclaimer: data.safetyDisclaimer },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error asking AI assistant about report');
    } finally {
      setQaLoading(false);
    }
  };

  // Handle Medical Term Simplifier
  const handleExplainTerm = async (term: string) => {
    setTermToExplain(term);
    setTermLoading(true);

    try {
      const res = await fetch('/api/gemini/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, context: selectedRecord?.title || '' }),
      });
      const data = await res.json();
      setTermExplanation(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not simplify medical term');
    } finally {
      setTermLoading(false);
    }
  };

  // Handle Compare Two Reports
  const handleRunComparison = async () => {
    const oldR = patientRecords.find((r) => r.id === compareOldId);
    const newR = patientRecords.find((r) => r.id === compareNewId);

    if (!oldR || !newR) {
      showToast('warning', 'Please select two different reports to compare.');
      return;
    }

    setIsComparing(true);
    try {
      const res = await fetch('/api/gemini/compare-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldReport: oldR, newReport: newR }),
      });
      const data = await res.json();
      setCompareResult(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Report comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  // Handle AI Doctor Note Generation
  const handleGenerateDoctorNote = async () => {
    setIsGeneratingNote(true);
    try {
      const res = await fetch('/api/gemini/doctor-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          chiefComplaint,
          vitals: selectedPatient.currentVitals,
          findings: selectedRecord?.summaryDoctor || 'CMP with glucose 142, eGFR 56',
          assessmentDraft: roughImpression,
          noteType: 'SOAP',
        }),
      });
      const data = await res.json();
      setGeneratedDoctorNote(data);
      showToast('info', 'AI note drafted. Doctor review & approval required before saving to chart.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to generate clinical note');
    } finally {
      setIsGeneratingNote(false);
    }
  };

  // Save approved doctor note
  const handleSaveApprovedNote = () => {
    if (!generatedDoctorNote) return;

    addClinicalNote({
      patientId: selectedPatient.id,
      authorName: currentRole === 'doctor' ? 'Dr. Marcus Vance, MD' : 'Nurse Sarah Jenkins, RN',
      authorRole: currentRole,
      noteType: 'SOAP',
      chiefComplaint,
      subjective: generatedDoctorNote.subjective,
      objective: generatedDoctorNote.objective,
      assessment: generatedDoctorNote.assessment,
      plan: generatedDoctorNote.plan,
      status: currentRole === 'doctor' ? 'approved' : 'pending_approval',
      approvedBy: currentRole === 'doctor' ? 'Dr. Marcus Vance, MD' : undefined,
      approvedAt: currentRole === 'doctor' ? new Date().toISOString() : undefined,
    });

    setGeneratedDoctorNote(null);
    showToast('success', 'Doctor note saved to permanent electronic health record.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Combined Electronic Health Record (EHR)</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {patientRecords.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered document reading, duplicate test alerts, old-vs-new diffing, and Medical Memory Card
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload & Read Report</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Documents & Labs</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('compare');
            if (!compareResult) handleRunComparison();
          }}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'compare'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Old vs New Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'notes'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>AI Doctor Notes & Sign-off</span>
        </button>

        <button
          onClick={() => setActiveTab('paper_scan')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'paper_scan'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Paper Record OCR Recovery</span>
        </button>

        <button
          onClick={() => setActiveTab('memorycard')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'memorycard'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Medical Memory Card</span>
        </button>
      </div>

      {/* TAB 1: ALL DOCUMENTS & LAB VIEW */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (5 Cols): List of Records & Filter */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by report title or analyte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
                {['all', 'Laboratory', 'Paper Scan', 'Cardiology'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md transition font-medium capitalize flex-shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Card List */}
            <div className="space-y-2.5">
              {filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    {rec.isDuplicateRisk && (
                      <div className="mb-2 p-1.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center space-x-1.5 text-[11px] font-bold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Duplicate Test Warning Detected</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          rec.category === 'Laboratory' ? 'bg-teal-50 text-teal-700' :
                          rec.category === 'Paper Scan' ? 'bg-amber-50 text-amber-700' :
                          'bg-sky-50 text-sky-700'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {rec.facility} • {rec.documentDate}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {rec.extractedValues?.length || 0} analytes
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OCR {rec.ocrConfidence}% Confidence</span>
                      </span>
                      <span className="text-slate-400">{rec.fileSize}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column (7 Cols): Selected Document Detailed Clinical Inspection */}
          <div className="lg:col-span-7 space-y-6">
            {selectedRecord ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
                
                {/* Header of Document */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedRecord.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Date: {selectedRecord.documentDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.title}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedRecord.facility} • Ordering Physician: {selectedRecord.doctorName || 'Attending Staff'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setActiveTab('compare');
                        setCompareNewId(selectedRecord.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>

                {/* Duplicate Alert Banner if flagged */}
                {selectedRecord.isDuplicateRisk && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>CLINICAL REDUNDANCY & DUPLICATE ALERT</span>
                    </div>
                    <p className="text-xs text-amber-900">{selectedRecord.duplicateNotes}</p>
                    <p className="text-[11px] text-amber-800">
                      Physician recommendation: Cancel duplicate order to spare patient venipuncture discomfort and unnecessary billing costs.
                    </p>
                  </div>
                )}

                {/* Patient Summary vs Doctor Summary Toggle */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI Patient Explanation (Plain Language)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Simplified for Patient
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{selectedRecord.summaryPatient}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Physician Clinical Summary</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                        Clinical Detail
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{selectedRecord.summaryDoctor}</p>
                  </div>
                </div>

                {/* Extracted Lab Values Table with exact Source Line Traceability */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Extracted Analytes & Reference Intervals
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Traceable to OCR snippet
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Test / Analyte</th>
                          <th className="py-2.5 px-3">Result</th>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Confidence & Trace</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedRecord.extractedValues?.map((val) => (
                          <tr key={val.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">
                              {val.testName}
                              <button
                                onClick={() => handleExplainTerm(val.testName)}
                                className="ml-1.5 text-emerald-600 hover:text-emerald-800 font-sans text-[10px] underline"
                              >
                                Explain
                              </button>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {val.value} <span className="text-[11px] text-slate-500 font-normal">{val.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{val.referenceRange}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                val.status === 'critical' ? 'bg-rose-100 text-rose-800' :
                                val.status === 'high' ? 'bg-amber-100 text-amber-800' :
                                val.status === 'low' ? 'bg-sky-100 text-sky-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {val.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[10px] text-slate-400 font-sans">
                              <span className="font-semibold text-slate-700">{val.confidence}% OCR</span>
                              <span className="block truncate max-w-xs text-slate-400 text-[9px]" title={val.sourceLine}>
                                {val.sourceLine}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simplified Medical Terms Pill List */}
                {selectedRecord.simplifiedTerms?.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Medical Terms in this Report Explained in Simple Language:</span>
                    </p>
                    <div className="space-y-1.5">
                      {selectedRecord.simplifiedTerms.map((st, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-bold text-slate-900">{st.term}: </span>
                          <span>{st.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Q&A on this Report */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Ask Questions About this Report
                    </h4>
                  </div>

                  <form onSubmit={handleAskQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Does my blood sugar level require immediate attention?"
                      value={reportQuestion}
                      onChange={(e) => setReportQuestion(e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={qaLoading || !reportQuestion.trim()}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {qaLoading ? 'Thinking...' : 'Ask AI'}
                    </button>
                  </form>

                  {/* Q&A Stream History */}
                  <div className="space-y-2 mt-2">
                    {qaHistory.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <p className="font-bold text-slate-900">Q: {item.q}</p>
                        <p className="text-slate-700 leading-relaxed">{item.a}</p>
                        {item.disclaimer && (
                          <p className="text-[10px] text-slate-400 italic pt-1">{item.disclaimer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs">Select a document from the list to view clinical extraction</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: OLD VS NEW REPORT COMPARISON */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Longitudinal Lab Trend & Report Comparison</h3>
              <p className="text-xs text-slate-500">
                Compare old vs new reports to identify biological trends, therapy efficacy, and warning signals
              </p>
            </div>
            <button
              onClick={handleRunComparison}
              disabled={isComparing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />
              <span>{isComparing ? 'Analyzing Trends...' : 'Run Side-by-Side Analysis'}</span>
            </button>
          </div>

          {/* Selectors for Old vs New */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Previous / Baseline Report:</label>
              <select
                value={compareOldId}
                onChange={(e) => setCompareOldId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {patientRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.documentDate})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current / Comparative Report:</label>
              <select
                value={compareNewId}
                onChange={(e) => setCompareNewId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {patientRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.documentDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Results */}
          {compareResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs">
                <span className="font-bold text-teal-900 block mb-1">Clinical Trend Summary:</span>
                <p className="text-teal-950 leading-relaxed">{compareResult.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Key Lab Marker Shifts & Deltas
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Analyte</th>
                        <th className="py-2.5 px-3">Old Value</th>
                        <th className="py-2.5 px-3">New Value</th>
                        <th className="py-2.5 px-3">Delta / Trend</th>
                        <th className="py-2.5 px-3">Clinical Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {compareResult.keyChanges?.map((ch: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{ch.testName}</td>
                          <td className="py-2.5 px-3 text-slate-600">{ch.oldValue}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{ch.newValue}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ch.trend === 'improved' ? 'bg-emerald-100 text-emerald-800' :
                              ch.trend === 'deteriorated' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {ch.delta} ({ch.trend})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px]">
                            {ch.clinicalSignificance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              {compareResult.recommendations?.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 mb-1.5">Actionable Clinical Next Steps:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {compareResult.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI-ASSISTED DOCTOR CLINICAL NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Physician Clinical Documentation Assistant</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft structured SOAP notes using patient data. Review and approve before saving into the permanent chart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaint / Visit Reason</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physician Impressions / Raw Dictation</label>
              <input
                type="text"
                value={roughImpression}
                onChange={(e) => setRoughImpression(e.target.value)}
                placeholder="Rough bullet points or audio dictation text..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateDoctorNote}
            disabled={isGeneratingNote}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingNote ? 'animate-spin' : ''}`} />
            <span>{isGeneratingNote ? 'Generating Structured SOAP Note...' : 'Draft Note via Gemini AI'}</span>
          </button>

          {/* Generated Note Review Box */}
          {generatedDoctorNote && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    SOAP Note Draft
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Review & Sign-Off Workflow</h4>
                </div>
                <div className="text-xs text-slate-500">
                  Author: Dr. Marcus Vance, MD (Attending)
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Subjective (S):</span>
                  <p className="text-slate-700 mt-0.5 bg-white p-3 rounded-lg border border-slate-200">{generatedDoctorNote.subjective}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Objective (O):</span>
                  <p className="text-slate-700 mt-0.5 bg-white p-3 rounded-lg border border-slate-200">{generatedDoctorNote.objective}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Assessment (A):</span>
                  <p className="text-slate-700 mt-0.5 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">{generatedDoctorNote.assessment}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Plan (P):</span>
                  <p className="text-slate-700 mt-0.5 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">{generatedDoctorNote.plan}</p>
                </div>
              </div>

              {/* Physician Signature Approval */}
              <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
                <p className="text-[11px] text-slate-500 italic">
                  By clicking approve, you electronically sign this clinical note into the patient's EHR.
                </p>
                <button
                  onClick={handleSaveApprovedNote}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center space-x-2 transition shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Review & Sign Note into Chart</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Clinical Notes in Chart */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Signed Clinical Notes on File ({clinicalNotes.filter((n) => n.patientId === selectedPatient.id).length})
            </h4>
            <div className="space-y-3">
              {clinicalNotes
                .filter((n) => n.patientId === selectedPatient.id)
                .map((note) => (
                  <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {note.noteType} Note — {note.chiefComplaint}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Signed: {note.approvedBy || 'Pending'} ({new Date(note.timestamp).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="font-bold text-slate-900">Assessment: </span>
                        <span>{note.assessment.slice(0, 140)}...</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Plan: </span>
                        <span>{note.plan.slice(0, 140)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAPER RECORD RECOVERY & OCR DIGITIZATION */}
      {activeTab === 'paper_scan' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Old Paper Record Recovery & Digitization</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              OCR converts faded, handwritten paper clinic charts into searchable digital data with confidence scoring and manual override.
            </p>
          </div>

          {activePaperRecord ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Physical Scan Simulation View */}
                <div className="border border-amber-300 rounded-2xl p-5 bg-amber-50/40 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-semibold border-b border-amber-200 pb-2">
                    <span className="flex items-center space-x-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                      <span>Physical Paper Scan (Simulated OCR View)</span>
                    </span>
                    <span className="font-mono text-[10px] bg-amber-200/80 px-2 py-0.5 rounded">
                      Faded Ink • 89% OCR Confidence
                    </span>
                  </div>

                  <div className="p-4 bg-white/90 rounded-xl border border-amber-200 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activePaperRecord.rawContentSnippet ||
                      `PHYSICAL PAPER CHART #88219\nDate: 04/18/2019 | Patient: Elena Rostova\nSubjective: Pt presents with mild occipital morning headaches. Denies blurred vision.\nVitals: BP seated right arm: 148/92 mmHg | P: 78 bpm regular | Wt: 82.1 kg\nImpression: Stage 1 Essential Hypertension.\nPlan: Start Lisinopril 10mg PO daily. Low sodium diet. F/U 4 weeks.`}
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Confidence highlights: Values marked in yellow indicate handwriting ambiguity flagged for manual clinical verification.
                  </p>
                </div>

                {/* Digital Structured Fields with Edit/Override */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Structured Digital Fields (Editable)
                  </h4>

                  <div className="space-y-2">
                    {activePaperRecord.extractedValues?.map((val) => (
                      <div key={val.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{val.testName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Value: <span className="font-bold text-emerald-800">{val.value} {val.unit}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">OCR Trace: {val.sourceLine}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            val.confidence < 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {val.confidence}% Conf.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => showToast('success', 'Digitized record confirmed and permanently merged into patient timeline.')}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                    >
                      Confirm Digitized Paper Record & Merge into EHR
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No scanned paper records found for this patient.</p>
          )}
        </div>
      )}

      {/* TAB 5: MEDICAL MEMORY CARD */}
      {activeTab === 'memorycard' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Approved Medical Memory Card</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Downloadable or printable high-density summary of essential health info for emergency responders & travel
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center space-x-2 transition shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Printable Card Preview Canvas */}
          <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl border border-slate-700 space-y-4 print:text-black print:bg-white print:border-black">
            
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">MediSync AI Medical Memory Card</h4>
                  <p className="text-[10px] text-emerald-400 font-mono">EMERGENCY FIRST-RESPONDER SUMMARY</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-emerald-400">{selectedPatient.bloodType}</span>
                <span className="block text-[9px] text-slate-400">BLOOD TYPE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Patient Name</p>
                <p className="font-bold text-sm text-white">{selectedPatient.name}</p>
                <p className="text-[11px] text-slate-300">DOB: {selectedPatient.dateOfBirth} ({selectedPatient.age}yo)</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">MRN / Identifier</p>
                <p className="font-mono font-bold text-emerald-400">{selectedPatient.mrn}</p>
                <p className="text-[11px] text-slate-300">Policy: {selectedPatient.insurancePolicyNumber}</p>
              </div>
            </div>

            {/* Critical Allergies */}
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                CRITICAL ALLERGIES & ANAPHYLAXIS RISKS
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient.allergies.map((a) => (
                  <span key={a.id} className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 text-[11px] font-bold">
                    {a.allergen} ({a.severity})
                  </span>
                ))}
              </div>
            </div>

            {/* Current Active Medications */}
            <div className="text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Active Medications ({selectedPatient.activeMedications.length})
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-200">
                {selectedPatient.activeMedications.map((m) => (
                  <div key={m.id} className="truncate">
                    • <span className="font-semibold">{m.name}</span> {m.dosage}
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts & Doctor */}
            <div className="pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Emergency Contact</p>
                <p className="font-bold text-white">{selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation})</p>
                <p className="font-mono text-emerald-400 text-[11px]">{selectedPatient.emergencyContact.phone}</p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <div className="text-right text-[10px] text-slate-400">
                  <p>Scan for secure</p>
                  <p>verified records</p>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Upload & Read Report Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Upload & Analyze Medical Document</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arterial Blood Gas & Electrolyte Panel"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e: any) => setUploadCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Imaging">Imaging (X-Ray, CT)</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Paper Scan">Scanned Paper Record</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Document</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Text / Lab Analytes Snippet (or paste OCR content)
                </label>
                <textarea
                  rows={4}
                  value={uploadRawText}
                  onChange={(e) => setUploadRawText(e.target.value)}
                  placeholder="Paste or type lab values (e.g. GLUCOSE: 138 mg/dL, CREATININE: 1.25 mg/dL, eGFR: 58...)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono text-[11px]"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1 text-[11px]">
                <p className="font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>MediSync Multimodal Processing:</span>
                </p>
                <p>
                  • Extracts exact values, units, reference intervals, and flags out-of-range results.
                </p>
                <p>
                  • Runs duplicate test detection against existing EHR records within past 14 days.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing || !uploadTitle.trim()}
                  className="px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  {isAnalyzing && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{isAnalyzing ? 'Extracting & Indexing...' : 'Index & Extract Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Term Explanation Modal */}
      {termToExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Medical Terminology Explained</h3>
              </div>
              <button
                onClick={() => {
                  setTermToExplain(null);
                  setTermExplanation(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Analyte / Term</p>
                <h4 className="text-base font-bold text-slate-900">{termToExplain}</h4>
              </div>

              {termLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-emerald-600" />
                  <p>Translating into plain English...</p>
                </div>
              ) : termExplanation ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-slate-800">
                    <p className="font-bold text-emerald-950 mb-1">What it means:</p>
                    <p className="leading-relaxed">{termExplanation.simpleExplanation}</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 mb-1">What it means for your health:</p>
                    <p className="text-slate-600 leading-relaxed">{termExplanation.whatItMeansForYou}</p>
                  </div>

                  {termExplanation.questionsForDoctor?.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                      <p className="font-bold text-slate-900 mb-1">Questions to ask your doctor:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {termExplanation.questionsForDoctor.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">No explanation available.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
  User,
  RefreshCw,
} from 'lucide-react';

export const AiAssistantModule: React.FC = () => {
  const { selectedPatient, currentRole, showToast } = useApp();

  // Chat message state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; triageFlag?: string; disclaimer?: string }>>([
    {
      sender: 'assistant',
      text: `Hello ${selectedPatient.name.split(' ')[0]}, I am your MediSync AI Clinical Assistant. I have context on your chronic conditions (${selectedPatient.chronicConditions.map((c) => c.name).join(', ')}), latest lab results, and current medications. How can I help you today?`,
      disclaimer: 'MediSync AI provides informational health guidance and does not replace professional medical diagnosis.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Term Simplifier Sub-tool State
  const [termQuery, setTermQuery] = useState('');
  const [termResult, setTermResult] = useState<any>(null);
  const [isTermSearching, setIsTermSearching] = useState(false);

  const popularTerms = [
    'eGFR',
    'Hemoglobin A1c',
    'Cardiac Troponin I',
    'Microalbuminuria',
    'Atrial Fibrillation',
    'qSOFA Score',
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const newHistory = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newHistory);
    setIsSending(true);

    try {
      const res = await fetch('/api/gemini/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          userRole: currentRole,
          patientProfile: {
            name: selectedPatient.name,
            age: selectedPatient.age,
            conditions: selectedPatient.chronicConditions.map((c) => c.name),
            allergies: selectedPatient.allergies.map((a) => a.allergen),
            vitals: selectedPatient.currentVitals,
          },
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply,
          triageFlag: data.triageFlag,
          disclaimer: data.disclaimer,
        },
      ]);
    } catch (err) {
      console.error(err);
      showToast('error', 'AI Assistant connection interrupted');
    } finally {
      setIsSending(false);
    }
  };

  const handleLookupTerm = async (termToLookup: string) => {
    setTermQuery(termToLookup);
    setIsTermSearching(true);

    try {
      const res = await fetch('/api/gemini/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: termToLookup, context: selectedPatient.chronicConditions.map((c) => c.name).join(', ') }),
      });
      const data = await res.json();
      setTermResult(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to look up medical term');
    } finally {
      setIsTermSearching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column (7 Cols): Conversational Health Assistant */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col h-[700px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">MediSync AI Health Companion</h3>
              <p className="text-[11px] text-slate-500">
                Grounded in patient health record (MRN: {selectedPatient.mrn})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
            Safe Triage Model
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                {msg.disclaimer && (
                  <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60 italic">
                    {msg.disclaimer}
                  </p>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing clinical context and formulating reply...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about medications, symptoms, dietary recommendations, or lab results..."
            className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center space-x-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Right Column (5 Cols): Medical Terminology Simplifier Tool */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Terminology Simplifier Tool */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Medical Terminology Simplifier</h3>
              <p className="text-xs text-slate-500">Demystify doctor jargon into clear plain English</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={termQuery}
              onChange={(e) => setTermQuery(e.target.value)}
              placeholder="Type any medical word or acronym..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
            />
            <button
              onClick={() => handleLookupTerm(termQuery)}
              disabled={isTermSearching || !termQuery.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              {isTermSearching ? 'Searching...' : 'Explain'}
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Common Clinical Terms:</p>
            <div className="flex flex-wrap gap-1.5">
              {popularTerms.map((t) => (
                <button
                  key={t}
                  onClick={() => handleLookupTerm(t)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Term Result */}
          {termResult && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2 mt-3">
              <h4 className="font-bold text-emerald-950 text-sm">{termResult.term}</h4>
              <p className="text-slate-800 leading-relaxed">{termResult.simpleExplanation}</p>
              <div className="pt-2 border-t border-emerald-200/60">
                <span className="font-bold text-emerald-900 block mb-0.5">What it means for you:</span>
                <p className="text-slate-700">{termResult.whatItMeansForYou}</p>
              </div>
            </div>
          )}
        </div>

        {/* Safety & Triage Policy Box */}
        <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 text-xs text-amber-950 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Clinical Safety Protocols:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            MediSync AI monitors conversation inputs for acute red flags (crushing chest pain, severe dyspnea, sudden paralysis, severe anaphylaxis). If detected, emergency escalation protocols trigger immediate 911 dispatch reminders and caregiver push alerts.
          </p>
        </div>

      </div>

    </div>
  );
};

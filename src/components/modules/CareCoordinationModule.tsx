import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CareTask, SbarHandoff } from '../../types';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  Stethoscope,
  Pill,
  HeartHandshake,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export const CareCoordinationModule: React.FC = () => {
  const {
    careTasks,
    toggleTaskCompletion,
    addCareTask,
    sbarHandoffs,
    addSbarHandoff,
    acknowledgeHandoff,
    selectedPatient,
    currentRole,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'sbar' | 'mar'>('tasks');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all');

  // New Task Form State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('14:00');
  const [taskPriority, setTaskPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [taskCat, setTaskCat] = useState<CareTask['category']>('vitals');

  // New SBAR Handoff State
  const [isNewSbarOpen, setIsNewSbarOpen] = useState(false);
  const [sbarSituation, setSbarSituation] = useState('');
  const [sbarBackground, setSbarBackground] = useState('');
  const [sbarAssessment, setSbarAssessment] = useState('');
  const [sbarRecommendation, setSbarRecommendation] = useState('');
  const [sbarIncomingStaff, setSbarIncomingStaff] = useState('Nurse Sarah Jenkins, RN');
  const [sbarShift, setSbarShift] = useState<'Day to Evening' | 'Evening to Night' | 'Night to Day'>('Day to Evening');

  // Medication Administration Record (MAR) local simulation states
  const [marRecords, setMarRecords] = useState([
    { id: 'mar-1', med: 'Metformin ER 1000mg', time: '08:00', status: 'given', by: 'Nurse Sarah Jenkins, RN', note: 'Taken with breakfast' },
    { id: 'mar-2', med: 'Lisinopril 20mg', time: '08:00', status: 'given', by: 'Nurse Sarah Jenkins, RN', note: 'Pre-admin SBP: 136 mmHg' },
    { id: 'mar-3', med: 'Empagliflozin 10mg', time: '08:00', status: 'given', by: 'Nurse Sarah Jenkins, RN', note: 'Hydration confirmed' },
    { id: 'mar-4', med: 'Advair Diskus 250/50', time: '12:00', status: 'due', by: 'Pending', note: 'Post-lunch inhalation' },
    { id: 'mar-5', med: 'Metformin ER 1000mg', time: '20:00', status: 'due', by: 'Pending', note: 'Evening meal dose' },
    { id: 'mar-6', med: 'Atorvastatin 20mg', time: '21:00', status: 'due', by: 'Pending', note: 'Bedtime dose' },
  ]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addCareTask({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      roomBed: selectedPatient.roomBed || 'Ward Bed',
      title: taskTitle,
      description: taskDesc,
      dueTime: taskDue,
      priority: taskPriority,
      category: taskCat,
      assignedTo: currentRole === 'nurse' ? 'Nurse Sarah Jenkins, RN' : 'Dr. Marcus Vance, MD',
      assignedRole: currentRole === 'doctor' ? 'doctor' : 'nurse',
      completed: false,
    });

    setIsNewTaskOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  const handleCreateSbar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbarSituation.trim()) return;

    addSbarHandoff({
      patientId: selectedPatient.id,
      outgoingStaff: currentRole === 'nurse' ? 'Nurse Sarah Jenkins, RN' : 'Dr. Marcus Vance, MD',
      incomingStaff: sbarIncomingStaff,
      shift: sbarShift,
      situation: sbarSituation,
      background: sbarBackground,
      assessment: sbarAssessment,
      recommendation: sbarRecommendation,
    });

    setIsNewSbarOpen(false);
    setSbarSituation('');
    setSbarBackground('');
    setSbarAssessment('');
    setSbarRecommendation('');
  };

  const handleMarAction = (id: string, newStatus: 'given' | 'held' | 'refused') => {
    setMarRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              by: currentRole === 'nurse' ? 'Nurse Sarah Jenkins, RN' : 'Dr. Marcus Vance, MD',
              note: newStatus === 'held' ? 'Held per clinical discretion' : r.note,
            }
          : r
      )
    );
    showToast('success', `MAR entry marked as ${newStatus.toUpperCase()}`);
  };

  const filteredTasks = careTasks.filter(
    (t) => taskCategoryFilter === 'all' || t.category === taskCategoryFilter
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Care Coordination & Handoffs</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Interdisciplinary Workflow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SBAR shift transfers, bedside nursing checklists, and Medication Administration Records (MAR)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {activeTab === 'tasks' && (
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Care Task</span>
            </button>
          )}
          {activeTab === 'sbar' && (
            <button
              onClick={() => setIsNewSbarOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log SBAR Handoff</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'tasks'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Bedside Nursing Tasks ({careTasks.filter((t) => !t.completed).length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('sbar')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'sbar'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>SBAR Shift Handoffs ({sbarHandoffs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mar')}
          className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'mar'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medication Administration Record (MAR)</span>
        </button>
      </div>

      {/* TAB 1: BEDSIDE CARE TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold mr-1">Category:</span>
            {['all', 'vitals', 'medication', 'lab_draw', 'wound_care', 'handoff'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTaskCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize transition font-medium ${
                  taskCategoryFilter === cat
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition shadow-2xs ${
                  task.completed ? 'bg-slate-50/70 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`mt-1 p-1 rounded-lg transition ${
                        task.completed ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    task.priority === 'stat' ? 'bg-rose-100 text-rose-800' :
                    task.priority === 'urgent' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Patient: <strong className="text-slate-700">{task.patientName}</strong> ({task.roomBed})</span>
                  <span>Due: <strong className="text-slate-700 font-mono">{task.dueTime}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SBAR SHIFT HANDOFFS */}
      {activeTab === 'sbar' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standardized Clinical SBAR Handoff Log</h3>
                <p className="text-xs text-slate-500">Structured communication to prevent handoff miscommunication</p>
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-mono">
                Joint Commission Aligned
              </span>
            </div>

            <div className="space-y-4">
              {sbarHandoffs.map((handoff) => (
                <div key={handoff.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Shift: {handoff.shift}</span>
                      <p className="text-[11px] text-slate-500">
                        From: <span className="text-slate-800 font-semibold">{handoff.outgoingStaff}</span> → To: <span className="text-slate-800 font-semibold">{handoff.incomingStaff}</span>
                      </p>
                    </div>
                    <div>
                      {handoff.acknowledgedByIncoming ? (
                        <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Handoff Acknowledged</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeHandoff(handoff.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                        >
                          Acknowledge & Accept
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-[11px] uppercase block mb-1">Situation (S)</span>
                      <p>{handoff.situation}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-[11px] uppercase block mb-1">Background (B)</span>
                      <p>{handoff.background}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-[11px] uppercase block mb-1">Assessment (A)</span>
                      <p>{handoff.assessment}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-[11px] uppercase block mb-1">Recommendation (R)</span>
                      <p>{handoff.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDICATION ADMINISTRATION RECORD (MAR) */}
      {activeTab === 'mar' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live 24-Hour Medication Administration Record (MAR)</h3>
              <p className="text-xs text-slate-500">Five Rights of Medication Safety Check Active</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Date: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Medication & Dose</th>
                  <th className="py-2.5 px-3">Scheduled Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Administered By</th>
                  <th className="py-2.5 px-3">Clinical Notes</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marRecords.map((mar) => (
                  <tr key={mar.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{mar.med}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{mar.time}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        mar.status === 'given' ? 'bg-emerald-100 text-emerald-800' :
                        mar.status === 'held' ? 'bg-amber-100 text-amber-800' :
                        mar.status === 'refused' ? 'bg-rose-100 text-rose-800' :
                        'bg-sky-100 text-sky-800'
                      }`}>
                        {mar.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{mar.by}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{mar.note}</td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {mar.status === 'due' && (
                        <>
                          <button
                            onClick={() => handleMarAction(mar.id, 'given')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Mark Given
                          </button>
                          <button
                            onClick={() => handleMarAction(mar.id, 'held')}
                            className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] transition cursor-pointer"
                          >
                            Hold
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Care Task */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Add Clinical Bedside Task</h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAT repeat venous blood gas check"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific clinical instructions or protocol..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT (Immediate)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={taskCat}
                    onChange={(e: any) => setTaskCat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="vitals">Vitals Check</option>
                    <option value="medication">Medication</option>
                    <option value="lab_draw">Lab Draw</option>
                    <option value="wound_care">Wound Care</option>
                    <option value="handoff">Handoff</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create SBAR Shift Handoff */}
      {isNewSbarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Record SBAR Shift Transfer</h3>
              <button onClick={() => setIsNewSbarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSbar} className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incoming Staff</label>
                  <input
                    type="text"
                    value={sbarIncomingStaff}
                    onChange={(e) => setSbarIncomingStaff(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift</label>
                  <select
                    value={sbarShift}
                    onChange={(e: any) => setSbarShift(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Day to Evening">Day to Evening</option>
                    <option value="Evening to Night">Evening to Night</option>
                    <option value="Night to Day">Night to Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Situation (S) *</label>
                <input
                  type="text"
                  required
                  placeholder="Patient status, chief concern, reason for admission..."
                  value={sbarSituation}
                  onChange={(e) => setSbarSituation(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Background (B)</label>
                <input
                  type="text"
                  placeholder="Pertinent history, baseline vitals, known allergies..."
                  value={sbarBackground}
                  onChange={(e) => setSbarBackground(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Assessment (A)</label>
                <input
                  type="text"
                  placeholder="Current findings, NEWS2 score, lab trends..."
                  value={sbarAssessment}
                  onChange={(e) => setSbarAssessment(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Recommendation (R)</label>
                <input
                  type="text"
                  placeholder="Pending tests to follow up, interventions to monitor..."
                  value={sbarRecommendation}
                  onChange={(e) => setSbarRecommendation(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewSbarOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
                >
                  Submit Handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

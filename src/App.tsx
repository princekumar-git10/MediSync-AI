import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveModule } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { SosModal } from './components/SosModal';
import { OverviewModule } from './components/modules/OverviewModule';
import { PatientsModule } from './components/modules/PatientsModule';
import { MedicalRecordsModule } from './components/modules/MedicalRecordsModule';
import { PulseGuardModule } from './components/modules/PulseGuardModule';
import { HealthTimelineModule } from './components/modules/HealthTimelineModule';
import { CareCoordinationModule } from './components/modules/CareCoordinationModule';
import { AiAssistantModule } from './components/modules/AiAssistantModule';
import { AppointmentsModule } from './components/modules/AppointmentsModule';
import { CaregiverPortalModule } from './components/modules/CaregiverPortalModule';
import { HospitalAdminModule } from './components/modules/HospitalAdminModule';
import { ReportsAnalyticsModule } from './components/modules/ReportsAnalyticsModule';
import { PrivacySecurityModule } from './components/modules/PrivacySecurityModule';
import { SettingsModule } from './components/modules/SettingsModule';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const { toastMessage, clearToast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSosModal={() => setIsSosOpen(true)}
      />

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeModule === 'overview' && (
            <OverviewModule onNavigate={(mod) => setActiveModule(mod)} />
          )}

          {activeModule === 'patients' && (
            <PatientsModule
              onNavigateToRecords={() => setActiveModule('records')}
              onNavigateToPulseGuard={() => setActiveModule('pulseguard')}
            />
          )}

          {activeModule === 'records' && <MedicalRecordsModule />}

          {activeModule === 'pulseguard' && <PulseGuardModule />}

          {activeModule === 'timeline' && <HealthTimelineModule />}

          {activeModule === 'coordination' && <CareCoordinationModule />}

          {activeModule === 'assistant' && <AiAssistantModule />}

          {activeModule === 'appointments' && <AppointmentsModule />}

          {activeModule === 'caregiver' && <CaregiverPortalModule />}

          {activeModule === 'admin' && <HospitalAdminModule />}

          {activeModule === 'analytics' && <ReportsAnalyticsModule />}

          {activeModule === 'privacy' && <PrivacySecurityModule />}

          {activeModule === 'settings' && <SettingsModule />}
        </main>
      </div>

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(mod) => setActiveModule(mod)}
      />

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* Global Toast Notification System */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-semibold ${
            toastMessage.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            toastMessage.type === 'warning' ? 'bg-amber-900 text-white border-amber-700' :
            toastMessage.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
            <span>{toastMessage.message}</span>
            <button
              onClick={clearToast}
              className="text-white/60 hover:text-white p-1 rounded-md transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

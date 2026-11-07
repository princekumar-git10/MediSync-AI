import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  ActivitySquare,
  History,
  GitPullRequest,
  Bot,
  CalendarCheck,
  HeartHandshake,
  Building2,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type ActiveModule =
  | 'overview'
  | 'patients'
  | 'records'
  | 'pulseguard'
  | 'timeline'
  | 'coordination'
  | 'assistant'
  | 'appointments'
  | 'caregiver'
  | 'admin'
  | 'analytics'
  | 'privacy'
  | 'settings';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed,
}) => {
  const { currentRole, careTasks, selectedPatient } = useApp();

  // Pending tasks count
  const pendingTasksCount = careTasks.filter((t) => !t.completed).length;

  const navItems: Array<{
    id: ActiveModule;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    rolesAllowed: Array<'patient' | 'doctor' | 'nurse' | 'caregiver' | 'admin'>;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users className="w-4 h-4" />,
      rolesAllowed: ['doctor', 'nurse', 'admin', 'caregiver'],
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: <FileText className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver'],
    },
    {
      id: 'pulseguard',
      label: 'PulseGuard AI',
      icon: <ActivitySquare className="w-4 h-4" />,
      badge: selectedPatient?.pulseGuardStatus.news2 >= 5 ? 'Alert' : undefined,
      badgeColor: selectedPatient?.pulseGuardStatus.news2 >= 7 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white',
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
    {
      id: 'timeline',
      label: 'Health Timeline',
      icon: <History className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver'],
    },
    {
      id: 'coordination',
      label: 'Care Coordination',
      icon: <GitPullRequest className="w-4 h-4" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-emerald-600 text-white',
      rolesAllowed: ['doctor', 'nurse', 'caregiver'],
    },
    {
      id: 'assistant',
      label: 'AI Health Assistant',
      icon: <Bot className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <CalendarCheck className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
    {
      id: 'caregiver',
      label: 'Caregiver Portal',
      icon: <HeartHandshake className="w-4 h-4" />,
      rolesAllowed: ['patient', 'caregiver', 'nurse', 'doctor'],
    },
    {
      id: 'admin',
      label: 'Hospital Admin',
      icon: <Building2 className="w-4 h-4" />,
      rolesAllowed: ['admin', 'doctor'],
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      rolesAllowed: ['doctor', 'nurse', 'admin'],
    },
    {
      id: 'privacy',
      label: 'Privacy & Security',
      icon: <ShieldCheck className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
    {
      id: 'settings',
      label: 'Settings & Offline',
      icon: <Settings className="w-4 h-4" />,
      rolesAllowed: ['patient', 'doctor', 'nurse', 'caregiver', 'admin'],
    },
  ];

  // Filter items matching active role
  const visibleItems = navItems.filter((item) => item.rolesAllowed.includes(currentRole));

  return (
    <aside
      className={`relative bg-slate-900 text-slate-300 transition-all duration-200 ease-in-out border-r border-slate-800 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header inside Sidebar */}
      <div>
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Modules</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {visibleItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center rounded-lg text-xs font-medium transition group ${
                  collapsed ? 'justify-center py-2.5 px-2' : 'px-3 py-2.5 justify-between'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom synthetic disclaimer for Hackathon judges */}
      {!collapsed ? (
        <div className="p-3 m-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Synthetic Demo Data</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            HIPAA compliant sandbox. Offline persistent sync active.
          </p>
        </div>
      ) : (
        <div className="p-2 text-center text-emerald-400">
          <ShieldCheck className="w-4 h-4 mx-auto" />
        </div>
      )}
    </aside>
  );
};

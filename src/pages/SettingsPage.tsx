import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Bot, 
  Database, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  BellRing,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'database' | 'rules'>('general');
  const [showToast, setShowToast] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Load settings from localStorage or use real defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('campuspulse_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    return {
      collegeName: 'NSRIT — Nadimpalli Satyanarayana Raju Institute of Technology',
      department: 'Computer Science & Engineering',
      academicYear: '2026 - 2027',
      facultyName: 'Mr. Venkateshwar',
      facultyRole: 'Faculty Mentor & Class In-Charge',
      retellApiKey: 'f6ca7126-af42-4d10-9034-9a8a1ff30e1a',
      retellAgentId: 'e8afec72-129a-467c-9d42-6f45c267edff',
      retellFromNumber: '+1 (949) 738-5095',
      preferredLanguage: 'Telugu',
      autoCallTrigger: true,
      consecutiveAbsenceThreshold: 3,
      riskThresholdPct: 75,
      enableSmsFallback: false,
      enableWhatsAppAlerts: false,
      supabaseUrl: 'https://jskmwwyabdmlzfetqbfx.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('campuspulse_settings', JSON.stringify(settings));
    setShowToast(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      <Toast
        message="Settings successfully saved and synchronized!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-[32px] font-bold text-foreground tracking-tight">
          System Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure institutional parameters, Retell AI voice automation credentials, and risk governance rules.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-default whitespace-nowrap cursor-pointer',
            activeTab === 'general' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="h-4 w-4" />
          Campus Profile
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-default whitespace-nowrap cursor-pointer',
            activeTab === 'ai' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Bot className="h-4 w-4" />
          Retell AI Voice Engine
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-default whitespace-nowrap cursor-pointer',
            activeTab === 'database' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Database className="h-4 w-4" />
          Database & Supabase
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-default whitespace-nowrap cursor-pointer',
            activeTab === 'rules' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Sliders className="h-4 w-4" />
          Escalation Rules
        </button>
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: GENERAL / CAMPUS PROFILE */}
        {activeTab === 'general' && (
          <div className="border border-border rounded-xl bg-background p-5 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-foreground">Campus & Academic Configuration</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={settings.collegeName}
                  onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-background focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={settings.department}
                  onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-background focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-background focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Faculty In-Charge
                </label>
                <input
                  type="text"
                  value={settings.facultyName}
                  onChange={(e) => setSettings({ ...settings, facultyName: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-background focus-ring"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RETELL AI VOICE ENGINE */}
        {activeTab === 'ai' && (
          <div className="border border-border rounded-xl bg-background p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  Retell AI Telecall Orchestrator
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Outbound voice agent integration for autonomous parent communication.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent Ready
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Retell Agent ID
                </label>
                <input
                  type="text"
                  value={settings.retellAgentId}
                  onChange={(e) => setSettings({ ...settings, retellAgentId: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-mono rounded-lg border border-border bg-background focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Outbound Caller ID (From Number)
                </label>
                <input
                  type="text"
                  value={settings.retellFromNumber}
                  onChange={(e) => setSettings({ ...settings, retellFromNumber: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-mono rounded-lg border border-border bg-background focus-ring"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Retell API Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.retellApiKey}
                    onChange={(e) => setSettings({ ...settings, retellApiKey: e.target.value })}
                    className="w-full h-10 pl-3 pr-10 text-sm font-mono rounded-lg border border-border bg-background focus-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Default Regional Language
                </label>
                <select
                  value={settings.preferredLanguage}
                  onChange={(e) => setSettings({ ...settings, preferredLanguage: e.target.value })}
                  className="w-full h-10 px-3 text-sm font-medium rounded-lg border border-border bg-background focus-ring cursor-pointer"
                >
                  <option value="Telugu">Telugu (Regional Andhra Pradesh / Telangana)</option>
                  <option value="English">Indian English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <span className="text-sm font-bold text-foreground block">Instant Auto-Dispatch</span>
                  <span className="text-xs text-muted-foreground">Trigger Retell calls immediately after attendance submission</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoCallTrigger}
                  onChange={(e) => setSettings({ ...settings, autoCallTrigger: e.target.checked })}
                  className="h-5 w-5 rounded border-border text-primary focus-ring cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE & SUPABASE */}
        {activeTab === 'database' && (
          <div className="border border-border rounded-xl bg-background p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Supabase PostgreSQL Connectivity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Database storage for students, attendance records, absence cases, and NLP transcripts.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connected (jskmwwyabdmlzfetqbfx)
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={settings.supabaseUrl}
                  disabled
                  className="w-full h-10 px-3 text-sm font-mono rounded-lg border border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Anon Public Key
                </label>
                <input
                  type="password"
                  value={settings.supabaseAnonKey}
                  disabled
                  className="w-full h-10 px-3 text-sm font-mono rounded-lg border border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ESCALATION & RISK RULES */}
        {activeTab === 'rules' && (
          <div className="border border-border rounded-xl bg-background p-5 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-5 w-5 text-amber-600" />
              Automated Risk & Escalation Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Consecutive Absences Trigger (Days)
                </label>
                <input
                  type="number"
                  value={settings.consecutiveAbsenceThreshold}
                  onChange={(e) => setSettings({ ...settings, consecutiveAbsenceThreshold: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-border bg-background focus-ring"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Triggers immediate HIGH RISK classification</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Regulatory Minimum Attendance (%)
                </label>
                <input
                  type="number"
                  value={settings.riskThresholdPct}
                  onChange={(e) => setSettings({ ...settings, riskThresholdPct: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-border bg-background focus-ring"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Standard UGC / University requirement (75%)</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 sm:col-span-2">
                <div>
                  <span className="text-sm font-bold text-foreground block">WhatsApp & SMS Backup Gateway</span>
                  <span className="text-xs text-muted-foreground">Send automated text alert if voice call is unanswered after 2 attempts</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableWhatsAppAlerts}
                  onChange={(e) => setSettings({ ...settings, enableWhatsAppAlerts: e.target.checked })}
                  className="h-5 w-5 rounded border-border text-primary focus-ring cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="submit" size="md" className="px-6 font-semibold shadow-xs">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}

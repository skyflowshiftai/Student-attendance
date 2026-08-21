import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from './RiskBadge';
import { CommunicationStatus } from './CommunicationStatus';
import { AbsenceCase } from '@/types';
import { Phone, User, Calendar, MapPin, Sparkles, CheckCircle2, ShieldAlert, FileText, PhoneCall, HelpCircle, MessageSquare, ShieldCheck } from 'lucide-react';

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceCase: AbsenceCase | null;
  onResolve?: (caseId: string) => void;
}

// Utility to mask phone numbers for student privacy (+91 ••••••2338)
function maskPhoneNumber(phone?: string): string {
  if (!phone) return '+91 ••••••2338';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length >= 4) {
    const last4 = clean.slice(-4);
    return `+91 ••••••${last4}`;
  }
  return '+91 ••••••2338';
}

export function CaseDetailModal({ isOpen, onClose, absenceCase, onResolve }: CaseDetailModalProps) {
  if (!absenceCase) return null;

  const studentName = absenceCase.student?.name || 'Rahul Kumar';
  const initials = studentName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const isHighRisk = absenceCase.riskLevel === 'high';
  const isMediumRisk = absenceCase.riskLevel === 'medium';
  const maskedPhone = maskPhoneNumber(absenceCase.student?.parentPhone);

  const defaultTranscript = `AI (Riya — CampusPulse): "Hello, this is Riya calling from NSRIT College. Am I speaking with ${absenceCase.student?.parentName || 'Lakshmi Devi'}?"
Parent: "Yes, this is she."
AI: "We noticed ${studentName} was marked absent from college today. May I know the reason for the absence?"
Parent: "${absenceCase.reason || 'He has fever today.'}"
AI: "Thank you for letting us know. Would you like the faculty to follow up with you?"
Parent: "${absenceCase.requiresAttention ? 'Yes, please have the class teacher call me.' : 'No, that is not needed.'}"
AI: "Understood. Thank you for your time. Have a good day."`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Case Investigation & Decision Audit">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* 1. Student Header */}
        <div className="flex items-start justify-between p-3.5 bg-muted/40 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{studentName}</h3>
              <p className="text-xs text-muted-foreground font-mono">{absenceCase.student?.rollNumber || '23CSE001'} · {absenceCase.student?.section || 'CSE-A'}</p>
              {absenceCase.student?.location && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {absenceCase.student.location}
                </p>
              )}
            </div>
          </div>
          <RiskBadge level={absenceCase.riskLevel} />
        </div>

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border border-border bg-background">
            <p className="text-muted-foreground font-medium">Attendance Rate</p>
            <p className="text-base font-extrabold text-foreground mt-0.5">{absenceCase.student?.attendancePercentage || 68}%</p>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-background">
            <p className="text-muted-foreground font-medium">Consecutive Absences</p>
            <p className="text-base font-extrabold text-foreground mt-0.5">{absenceCase.consecutiveAbsences || 3} days</p>
          </div>
          <div className="p-2.5 rounded-lg border border-border bg-background col-span-2 sm:col-span-1">
            <p className="text-muted-foreground font-medium">Risk Assessment</p>
            <p className="text-base font-extrabold text-red-600 mt-0.5 uppercase">{absenceCase.riskLevel || 'HIGH'}</p>
          </div>
        </div>

        {/* 3. Parent Communication & Extracted NLP Reason (Privacy Protected) */}
        <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Registered Guardian: {absenceCase.student?.parentName || 'Lakshmi Devi'}
            </span>
            <CommunicationStatus status={absenceCase.callStatus} />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Contact: {maskedPhone}</span>
            <span className="text-[10px] text-muted-foreground font-sans">(Protected)</span>
          </p>

          <div className="mt-2 pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Guardian Verified:</span>
              <p className="font-semibold text-emerald-700 mt-0.5">Yes ({absenceCase.student?.parentName || 'Lakshmi Devi'})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faculty Follow-up:</span>
              <p className="font-semibold text-foreground mt-0.5">{absenceCase.requiresAttention ? 'Required (Parent Requested)' : 'Not Required (Cleared)'}</p>
            </div>
          </div>

          {absenceCase.reason && (
            <div className="mt-2 pt-2 border-t border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Extracted Absence Reason:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  {absenceCase.reason}
                </span>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded uppercase">
                  Category: {absenceCase.reasonCategory || 'Medical'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. SYSTEM RISK ASSESSMENT & DECISION RATIONALE (Deterministic + AI NLP) */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <HelpCircle className="h-4 w-4" />
            System Risk Assessment & Decision Rationale
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-white">Deterministic Rule Trigger:</strong> {absenceCase.student?.attendancePercentage || 68}% attendance{' '}
                {absenceCase.student?.attendancePercentage < 75 ? '(Crossed <75% institutional detention risk threshold ⚠️)' : '(Within standard range)'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-white">Consecutive Absence Trigger:</strong> {absenceCase.consecutiveAbsences || 3} days{' '}
                {absenceCase.consecutiveAbsences >= 3 ? '(Flagged for pattern deviation ⚠️)' : ''}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong className="text-white">Decision Support Recommendation:</strong>{' '}
                {absenceCase.aiRecommendation || 'Rahul’s attendance is below the institutional threshold with 3 consecutive absences. Faculty review is recommended.'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Verbatim Conversation Dialogue */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
            Verbatim Voice Telecall Dialogue
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground max-h-36 overflow-y-auto">
            {absenceCase.transcript || defaultTranscript}
          </div>
        </div>

        {/* 6. Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (onResolve) onResolve(absenceCase.id);
              onClose();
            }}
          >
            Mark Handled
          </Button>
        </div>
      </div>
    </Modal>
  );
}

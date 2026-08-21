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

  const studentName = absenceCase.student?.name || 'Student';
  const initials = studentName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const isFemale = absenceCase.student?.gender === 'female';
  const childTerm = isFemale ? 'your daughter' : 'your son';
  const pronoun = isFemale ? 'She' : 'He';
  const maskedPhone = maskPhoneNumber(absenceCase.student?.parentPhone);

  const defaultTranscript = absenceCase.transcript || `AI (Ravi Kumar — CampusPulse): "Hello! This is Ravi Kumar calling from NSRIT College. Am I speaking with ${absenceCase.student?.parentName || 'the parent'}, guardian of ${childTerm}, ${studentName}?"
Parent: "Yes, speaking."
AI: "We noticed ${studentName} was marked absent from college today. May I know the reason for ${isFemale ? 'her' : 'his'} absence?"
Parent: "${absenceCase.reason || `${pronoun} is not feeling well today.`}"
AI: "Thank you for letting us know. The faculty has been notified. Have a good day."`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Absence Case & Telecall Audit" className="max-w-xl">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* 1. Student Header */}
        <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-black">{studentName}</h3>
              <p className="text-xs text-neutral-500 font-mono">
                {absenceCase.student?.rollNumber || '23CSE001'} · {absenceCase.student?.section || 'CSE-A'} · <span className="font-semibold text-black">{isFemale ? 'Female (Daughter)' : 'Male (Son)'}</span>
              </p>
              {absenceCase.student?.location && (
                <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
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
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <p className="text-neutral-500 font-medium">Attendance Rate</p>
            <p className="text-base font-bold text-black mt-0.5">{absenceCase.student?.attendancePercentage || 68}%</p>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <p className="text-neutral-500 font-medium">Consecutive Absences</p>
            <p className="text-base font-bold text-black mt-0.5">{absenceCase.consecutiveAbsences || 1} day(s)</p>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white col-span-2 sm:col-span-1">
            <p className="text-neutral-500 font-medium">Grammar Gender</p>
            <p className="text-base font-bold text-black mt-0.5">{isFemale ? 'Daughter (She/Her)' : 'Son (He/Him)'}</p>
          </div>
        </div>

        {/* 3. Parent Communication & Extracted NLP Reason */}
        <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              Registered Guardian: {absenceCase.student?.parentName || 'Guardian'}
            </span>
            <CommunicationStatus status={absenceCase.callStatus} />
          </div>
          <p className="text-xs text-neutral-500 flex items-center gap-1 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-black" />
            <span>Contact: {maskedPhone}</span>
            <span className="text-[10px] text-neutral-400 font-sans">(Protected)</span>
          </p>

          <div className="mt-2 pt-2 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Guardian Verified:</span>
              <p className="font-semibold text-black mt-0.5">
                {absenceCase.callStatus === 'completed' ? 'Yes (Identity Confirmed)' : 'Pending Call'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Classification:</span>
              <p className="font-semibold text-black mt-0.5 capitalize">
                {absenceCase.reasonCategory || 'Pending classification'}
              </p>
            </div>
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-black" />
              Parent's Stated Reason:
            </span>
            <p className="text-xs font-medium text-black mt-1">
              "{absenceCase.reason || 'Pending automated parent call'}"
            </p>
          </div>
        </div>

        {/* 4. Full AI Conversation Transcript */}
        <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-black" />
              Autonomous Voice Transcript (Ravi Kumar)
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Cartesia Neural en-IN</span>
          </div>
          <pre className="text-[11px] font-sans text-neutral-700 bg-white p-3 rounded-lg border border-neutral-200 whitespace-pre-wrap leading-relaxed">
            {defaultTranscript}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {absenceCase.requiresAttention && onResolve && (
            <Button onClick={() => { onResolve(absenceCase.id); onClose(); }}>
              Mark Handled
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

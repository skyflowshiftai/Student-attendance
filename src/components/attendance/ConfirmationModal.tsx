import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Bot, UserCheck, UserX } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  presentCount: number;
  absentCount: number;
  isSubmitting: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  presentCount,
  absentCount,
  isSubmitting,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Attendance Submission">
      <div className="space-y-4">
        {/* Counts */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
            <UserCheck className="h-4 w-4 text-black" />
            <div>
              <p className="text-xs text-neutral-500 font-medium">Present</p>
              <p className="text-lg font-bold text-black">{presentCount}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
            <UserX className="h-4 w-4 text-black" />
            <div>
              <p className="text-xs text-neutral-500 font-medium">Absent</p>
              <p className="text-lg font-bold text-black">{absentCount}</p>
            </div>
          </div>
        </div>

        {/* AI workflow notice */}
        {absentCount > 0 && (
          <div className="flex items-start gap-3 px-3.5 py-3 rounded-lg bg-neutral-100 border border-neutral-300">
            <Bot className="h-4 w-4 text-black mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-700 leading-relaxed">
              Upon submission, absent students will enter the automated voice calling queue. 
              <strong> Ravi Kumar</strong> will place outbound phone calls to the parents to verify reasons.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Review Again
          </Button>
          <Button onClick={onConfirm} loading={isSubmitting}>
            Confirm & Trigger Calls
          </Button>
        </div>
      </div>
    </Modal>
  );
}

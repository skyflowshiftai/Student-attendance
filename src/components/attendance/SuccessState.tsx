import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, ArrowRight, LayoutDashboard, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface SuccessStateProps {
  presentCount: number;
  absentCount: number;
  absentStudents?: Student[];
  onViewOperations: () => void;
  onBackToDashboard: () => void;
}

export function SuccessState({
  presentCount,
  absentCount,
  absentStudents = [],
  onViewOperations,
  onBackToDashboard,
}: SuccessStateProps) {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto">
      {/* Animated Checkmark */}
      <div className="relative mb-6">
        <svg className="checkmark w-20 h-20 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10"/>
          <path className="checkmark__check" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        <style>{`
          .checkmark__circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke: currentColor;
            fill: none;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }
          .checkmark__check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
          }
          @keyframes stroke {
            100% { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>

      <div className={cn(
        "flex flex-col items-center w-full transition-all duration-1000",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <h2 className="text-2xl font-bold text-black mb-2">Attendance Submitted Successfully</h2>
        <p className="text-neutral-600 mb-8 text-center bg-neutral-100 px-4 py-2 rounded-full border border-neutral-200 text-sm">
          <span className="font-semibold text-black">{presentCount} Present</span>
          <span className="mx-2 text-neutral-400">•</span>
          <span className="font-semibold text-black">{absentCount} Absent</span>
        </p>

        {/* Call Queue */}
        {absentCount > 0 && (
          <div className="w-full bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden mb-8">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-black flex items-center gap-2">
                  <Phone className="h-4 w-4 text-black animate-pulse" />
                  AI Call Queue Activated
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Contacting parents for {absentCount} absent students...</p>
              </div>
            </div>
            <div className="divide-y divide-neutral-200">
              {absentStudents.slice(0, 5).map((student, idx) => (
                <div key={student.id || idx} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">{student.name}</p>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{student.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {idx === 0 ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black px-2.5 py-1 rounded-full">
                        <Loader2 className="h-3 w-3 animate-spin" /> Calling...
                      </span>
                    ) : idx === 1 ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-black bg-neutral-200 px-2.5 py-1 rounded-full">
                        <Check className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                        Queued
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {absentCount > 5 && (
                <div className="px-4 py-2 text-center bg-neutral-50">
                  <span className="text-xs font-medium text-neutral-500">+{absentCount - 5} more queued</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onBackToDashboard}>
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          {absentCount > 0 && (
            <Button className="w-full sm:w-auto" onClick={onViewOperations}>
              View Live AI Operations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

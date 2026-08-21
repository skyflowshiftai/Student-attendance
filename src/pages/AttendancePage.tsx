import React, { useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useClassSelection } from '@/hooks/useClassSelection';
import { ClassSelector } from '@/components/attendance/ClassSelector';
import { AttendanceSummary } from '@/components/attendance/AttendanceSummary';
import { StudentSearch } from '@/components/attendance/StudentSearch';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { SubmitBar } from '@/components/attendance/SubmitBar';
import { ConfirmationModal } from '@/components/attendance/ConfirmationModal';
import { SuccessState } from '@/components/attendance/SuccessState';
import { EmptyState } from '@/components/ui/EmptyState';

interface AttendancePageProps {
  onNavigateToOperations: () => void;
  onNavigateToStudents?: () => void;
}

export function AttendancePage({ onNavigateToOperations, onNavigateToStudents }: AttendancePageProps) {
  const classSelection = useClassSelection();
  const selectedSection = classSelection.sections.find(s => s.id === classSelection.classId)?.code || 'CSE-A';
  const selectedSubjectName = classSelection.subjects.find(s => s.id === classSelection.subjectId)?.name || 'Artificial Intelligence';
  
  const attendance = useAttendance(selectedSection, selectedSubjectName, classSelection.date);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (attendance.submissionState === 'success') {
    return (
      <SuccessState
        presentCount={attendance.stats.present}
        absentCount={attendance.stats.absent}
        absentStudents={attendance.allStudents.filter(s => s.status === 'absent')}
        onViewOperations={() => {
          onNavigateToOperations();
        }}
        onBackToDashboard={() => {
          attendance.resetSubmission();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-[32px] font-bold text-black tracking-tight">
          Take Attendance
        </h1>
        <p className="mt-1 text-sm text-neutral-500 max-w-xl">
          Mark today's attendance. Absent students will automatically enter the real-world voice calling queue upon submission.
        </p>
      </div>

      {/* Class Selection */}
      <ClassSelector
        departments={classSelection.departments}
        sections={classSelection.sections}
        subjects={classSelection.subjects}
        departmentId={classSelection.departmentId}
        classId={classSelection.classId}
        subjectId={classSelection.subjectId}
        date={classSelection.date}
        onDepartmentChange={classSelection.setDepartmentId}
        onClassChange={classSelection.setClassId}
        onSubjectChange={classSelection.setSubjectId}
        onDateChange={classSelection.setDate}
      />

      {/* Stats */}
      <AttendanceSummary stats={attendance.stats} />

      {/* Search & Filter */}
      <StudentSearch
        searchQuery={attendance.searchQuery}
        filter={attendance.filter}
        genderFilter={attendance.genderFilter}
        onSearchChange={attendance.setSearch}
        onFilterChange={attendance.setFilter}
        onGenderFilterChange={attendance.setGenderFilter}
        onMarkAllPresent={attendance.markAllPresent}
      />

      {/* Table */}
      {attendance.students.length > 0 ? (
        <AttendanceTable
          students={attendance.students}
          onToggleStatus={attendance.toggleStatus}
        />
      ) : (
        <EmptyState
          title="No students registered yet"
          message={
            attendance.searchQuery || attendance.filter !== 'all'
              ? 'No students match your current search or filter.'
              : 'Add your students in the Students Directory to begin live attendance and calling.'
          }
          actionLabel={attendance.searchQuery || attendance.filter !== 'all' ? undefined : 'Add Students Now'}
          onAction={attendance.searchQuery || attendance.filter !== 'all' ? undefined : onNavigateToStudents}
        />
      )}

      {/* Submit */}
      {attendance.allStudents.length > 0 && (
        <SubmitBar
          absentCount={attendance.stats.absent}
          totalCount={attendance.stats.total}
          onSubmit={() => setShowConfirmation(true)}
          isSubmitting={attendance.submissionState === 'submitting'}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={async () => {
          setShowConfirmation(false);
          await attendance.handleSubmit(
            classSelection.classId,
            selectedSubjectName,
            classSelection.date
          );
        }}
        presentCount={attendance.stats.present}
        absentCount={attendance.stats.absent}
        isSubmitting={attendance.submissionState === 'submitting'}
      />
    </div>
  );
}

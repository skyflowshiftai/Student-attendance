import React from 'react';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Department, ClassSection, Subject } from '@/types';

interface ClassSelectorProps {
  departments: Department[];
  sections: ClassSection[];
  subjects: Subject[];
  departmentId: string;
  classId: string;
  subjectId: string;
  date: string;
  onDepartmentChange: (id: string) => void;
  onClassChange: (id: string) => void;
  onSubjectChange: (id: string) => void;
  onDateChange: (date: string) => void;
}

export function ClassSelector({
  departments,
  sections,
  subjects,
  departmentId,
  classId,
  subjectId,
  date,
  onDepartmentChange,
  onClassChange,
  onSubjectChange,
  onDateChange,
}: ClassSelectorProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Department"
        options={departments.map((d) => ({ value: d.id, label: d.name }))}
        value={departmentId}
        onChange={onDepartmentChange}
      />
      <Select
        label="Class / Section"
        options={sections.map((c) => ({ value: c.id, label: c.name }))}
        value={classId}
        onChange={onClassChange}
      />
      <Select
        label="Subject"
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        value={subjectId}
        onChange={onSubjectChange}
      />
      <DatePicker
        label="Date"
        value={date}
        max={todayStr}
        onChange={(newDate) => {
          // Prevent setting future date
          if (newDate > todayStr) {
            onDateChange(todayStr);
          } else {
            onDateChange(newDate);
          }
        }}
      />
    </div>
  );
}

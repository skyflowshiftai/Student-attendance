import { useState } from 'react';
import { departments, classSections, subjects } from '@/data/institutionConfig';

export function useClassSelection() {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? '');
  const [classId, setClassId] = useState(classSections[0]?.id ?? '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(todayStr);

  const filteredSections = classSections.filter((c) => c.departmentId === departmentId);
  const filteredSubjects = subjects.filter((s) => s.classId === classId);

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id);
    const firstSection = classSections.find((c) => c.departmentId === id);
    if (firstSection) {
      setClassId(firstSection.id);
      const firstSubject = subjects.find((s) => s.classId === firstSection.id);
      if (firstSubject) setSubjectId(firstSubject.id);
    }
  };

  const handleClassChange = (id: string) => {
    setClassId(id);
    const firstSubject = subjects.find((s) => s.classId === id);
    if (firstSubject) setSubjectId(firstSubject.id);
  };

  return {
    departmentId,
    classId,
    subjectId,
    date,
    departments,
    sections: filteredSections,
    subjects: filteredSubjects,
    setDepartmentId: handleDepartmentChange,
    setClassId: handleClassChange,
    setSubjectId,
    setDate,
  };
}

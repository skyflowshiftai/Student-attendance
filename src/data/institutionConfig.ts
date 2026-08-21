import { Department, ClassSection, Subject, Faculty } from '@/types';

/**
 * Institutional configuration — departments, sections, subjects, and faculty.
 * These are institutional constants that define the college structure.
 */

export const departments: Department[] = [
  { id: 'dept-1', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'dept-2', name: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 'dept-3', name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { id: 'dept-4', name: 'Mechanical Engineering', code: 'MECH' },
];

export const classSections: ClassSection[] = [
  { id: 'class-1', name: 'CSE - A', departmentId: 'dept-1', code: 'CSE-A' },
  { id: 'class-2', name: 'CSE - B', departmentId: 'dept-1', code: 'CSE-B' },
  { id: 'class-3', name: 'ECE - A', departmentId: 'dept-2', code: 'ECE-A' },
  { id: 'class-4', name: 'ECE - B', departmentId: 'dept-2', code: 'ECE-B' },
  { id: 'class-5', name: 'EEE - A', departmentId: 'dept-3', code: 'EEE-A' },
  { id: 'class-6', name: 'MECH - A', departmentId: 'dept-4', code: 'MECH-A' },
];

export const subjects: Subject[] = [
  { id: 'sub-1', name: 'Artificial Intelligence', code: 'CS501', classId: 'class-1' },
  { id: 'sub-2', name: 'Database Management Systems', code: 'CS502', classId: 'class-1' },
  { id: 'sub-3', name: 'Computer Networks', code: 'CS503', classId: 'class-1' },
  { id: 'sub-4', name: 'Operating Systems', code: 'CS504', classId: 'class-2' },
  { id: 'sub-5', name: 'Digital Signal Processing', code: 'EC501', classId: 'class-3' },
  { id: 'sub-6', name: 'VLSI Design', code: 'EC502', classId: 'class-4' },
  { id: 'sub-7', name: 'Power Systems', code: 'EE501', classId: 'class-5' },
  { id: 'sub-8', name: 'Thermodynamics', code: 'ME501', classId: 'class-6' },
];

export const currentFaculty: Faculty = {
  id: 'fac-1',
  name: 'Mr. Venkateshwar',
  role: 'Faculty',
  department: 'Computer Science & Engineering',
};

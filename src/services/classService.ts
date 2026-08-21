import { Department, ClassSection, Subject } from '@/types';
import { departments, classSections, subjects } from '@/data/institutionConfig';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getDepartments(): Promise<Department[]> {
  await delay(200);
  return departments;
}

export async function getClassSections(departmentId: string): Promise<ClassSection[]> {
  await delay(200);
  return classSections.filter(c => c.departmentId === departmentId);
}

export async function getSubjects(classId: string): Promise<Subject[]> {
  await delay(200);
  return subjects.filter(s => s.classId === classId);
}

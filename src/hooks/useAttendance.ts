import { useReducer, useMemo, useCallback, useEffect, useState } from 'react';
import { Student, AttendanceFilter, AttendanceStats, SubmissionState } from '@/types';
import { submitAttendance, getStudentsWithAttendance, SubmitAttendanceResult } from '@/services/attendanceService';

export type GenderFilter = 'all' | 'male' | 'female';

type Action =
  | { type: 'TOGGLE_STATUS'; studentId: string }
  | { type: 'MARK_ALL_PRESENT' }
  | { type: 'SET_FILTER'; filter: AttendanceFilter }
  | { type: 'SET_GENDER_FILTER'; gender: GenderFilter }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_SUBMISSION_STATE'; state: SubmissionState }
  | { type: 'LOAD_STUDENTS'; students: Student[] };

interface State {
  students: Student[];
  filter: AttendanceFilter;
  genderFilter: GenderFilter;
  searchQuery: string;
  submissionState: SubmissionState;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_STATUS':
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.studentId || s.studentId === action.studentId
            ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
            : s
        ),
      };
    case 'MARK_ALL_PRESENT':
      return {
        ...state,
        students: state.students.map((s) => {
          // If gender filter is active, only mark that gender as present
          if (state.genderFilter !== 'all' && s.gender !== state.genderFilter) {
            return s;
          }
          return { ...s, status: 'present' as const };
        }),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_GENDER_FILTER':
      return { ...state, genderFilter: action.gender };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_SUBMISSION_STATE':
      return { ...state, submissionState: action.state };
    case 'LOAD_STUDENTS':
      return { ...state, students: action.students };
    default:
      return state;
  }
}

export function useAttendance(
  sectionId: string = 'CSE-A',
  subjectName: string = 'Artificial Intelligence',
  date: string = new Date().toISOString().slice(0, 10)
) {
  const [state, dispatch] = useReducer(reducer, {
    students: [],
    filter: 'all',
    genderFilter: 'all',
    searchQuery: '',
    submissionState: 'idle',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitAttendanceResult | null>(null);

  // Load students from Supabase, preserving existing saved attendance
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const students = await getStudentsWithAttendance(sectionId, subjectName, date);
        if (isMounted && students && students.length > 0) {
          dispatch({ type: 'LOAD_STUDENTS', students });
        }
      } catch (err) {
        console.warn('Error loading students with attendance:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [sectionId, subjectName, date]);

  const stats: AttendanceStats = useMemo(() => {
    const total = state.students.length;
    const present = state.students.filter((s) => s.status === 'present').length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { total, present, absent, percentage };
  }, [state.students]);

  const filteredStudents = useMemo(() => {
    let result = state.students;

    // Filter by attendance status (all, present, absent)
    if (state.filter !== 'all') {
      result = result.filter((s) => s.status === state.filter);
    }

    // Filter by gender (all, male, female)
    if (state.genderFilter !== 'all') {
      result = result.filter((s) => (s.gender || 'male') === state.genderFilter);
    }

    // Filter by search text
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query)
      );
    }

    return result;
  }, [state.students, state.filter, state.genderFilter, state.searchQuery]);

  const toggleStatus = useCallback((studentId: string) => {
    dispatch({ type: 'TOGGLE_STATUS', studentId });
  }, []);

  const markAllPresent = useCallback(() => {
    dispatch({ type: 'MARK_ALL_PRESENT' });
  }, []);

  const setFilter = useCallback((filter: AttendanceFilter) => {
    dispatch({ type: 'SET_FILTER', filter });
  }, []);

  const setGenderFilter = useCallback((gender: GenderFilter) => {
    dispatch({ type: 'SET_GENDER_FILTER', gender });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', query });
  }, []);

  const handleSubmit = useCallback(
    async (classId: string, subjectId: string, submitDate: string) => {
      dispatch({ type: 'SET_SUBMISSION_STATE', state: 'submitting' });
      try {
        const result = await submitAttendance({
          classId,
          subjectId,
          date: submitDate,
          facultyId: 'fac-1',
          attendance: state.students.map((s) => ({
            studentId: s.id,
            status: s.status,
          })),
        });
        
        setSubmissionResult(result);
        if (result.success) {
          dispatch({ type: 'SET_SUBMISSION_STATE', state: 'success' });
        } else {
          dispatch({ type: 'SET_SUBMISSION_STATE', state: 'error' });
        }
      } catch (err) {
        console.error('Submission error:', err);
        dispatch({ type: 'SET_SUBMISSION_STATE', state: 'error' });
      }
    },
    [state.students]
  );

  const resetSubmission = useCallback(() => {
    dispatch({ type: 'SET_SUBMISSION_STATE', state: 'idle' });
  }, []);

  return {
    students: filteredStudents,
    allStudents: state.students,
    stats,
    filter: state.filter,
    genderFilter: state.genderFilter,
    searchQuery: state.searchQuery,
    submissionState: state.submissionState,
    submissionResult,
    isLoading,
    toggleStatus,
    markAllPresent,
    setFilter,
    setGenderFilter,
    setSearch,
    handleSubmit,
    resetSubmission,
  };
}

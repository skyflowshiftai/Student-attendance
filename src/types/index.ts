export interface Student {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  section: string;
  attendancePercentage: number;
  status: 'present' | 'absent';
  parentName?: string;
  parentPhone?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  preferredLanguage?: string;
}

export interface AttendanceRecord {
  classId: string;
  subjectId: string;
  date: string;
  facultyId: string;
  attendance: Array<{
    studentId: string;
    status: 'present' | 'absent';
  }>;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface ClassSection {
  id: string;
  name: string;
  departmentId: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
}

export interface Faculty {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

export type AttendanceFilter = 'all' | 'present' | 'absent';

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

// --- Navigation Pages ---
export type PageId = 'dashboard' | 'attendance' | 'ai-operations' | 'students' | 'history' | 'settings';

// --- AI Operations Types ---
export type RiskLevel = 'low' | 'medium' | 'high';

export type CallStatus = 'queued' | 'calling' | 'completed' | 'no_answer' | 'failed' | 'follow_up';

export type CaseStatus = 'pending' | 'in_progress' | 'resolved' | 'follow_up' | 'escalated';

export interface AbsenceCase {
  id: string;
  student: {
    id: string;
    name: string;
    rollNumber: string;
    section: string;
    attendancePercentage: number;
    parentName?: string;
    parentPhone?: string;
    gender?: 'male' | 'female' | 'other';
    location?: string;
  };
  absencePattern: string;
  consecutiveAbsences: number;
  riskLevel: RiskLevel;
  callStatus: CallStatus;
  caseStatus: CaseStatus;
  reason?: string;
  reasonCategory?: 'medical' | 'family_emergency' | 'personal' | 'unexcused' | 'unknown' | 'family' | 'transportation' | 'academic' | 'other';
  aiRecommendation?: string;
  callStartedAt?: string;
  callEndedAt?: string;
  callCompletedAt?: string;
  durationSeconds?: number;
  transcript?: string;
  requiresAttention: boolean;
  attentionReason?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'success' | 'warning' | 'active' | 'info';
  action: string;
  metadata?: string;
}

export interface OperationsMetrics {
  absencesDetected: number;
  callsInProgress: number;
  callsCompleted: number;
  followUpsRequired: number;
  highRiskStudents: number;
}

export interface RecentAction {
  id: string;
  time: string;
  studentName: string;
  action: string;
  outcome: string;
}

export interface HistoricalAttendanceSession {
  id: string;
  date: string;
  subject: string;
  classSection: string;
  facultyName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  complianceRate: number;
  aiProcessed: boolean;
  absentStudents: Array<{
    name: string;
    rollNumber: string;
    reason?: string;
    riskLevel: RiskLevel;
  }>;
}

export interface SettingsConfig {
  collegeName: string;
  department: string;
  academicYear: string;
  defaultSection: string;
  retellApiKey: string;
  retellAgentId: string;
  retellFromNumber: string;
  preferredLanguage: string;
  autoCallTrigger: boolean;
  consecutiveAbsenceThreshold: number;
  riskThresholdPct: number;
  enableSmsFallback: boolean;
  enableWhatsAppAlerts: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// --- Daily Student Call Logs & Section Queues ---
export interface StudentCallLog {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  section: string;
  date: string;
  callStartedAt: string; // e.g., "10:14:20 AM" or timestamp
  callEndedAt: string;   // e.g., "10:15:08 AM"
  durationSeconds: number;
  status: CallStatus;
  parentName: string;
  parentPhone: string;
  reason?: string;
  reasonCategory?: string;
  transcript?: string;
  retellCallId?: string;
}

export interface SectionAbsenceSummary {
  section: string;
  department: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  pendingCount: number;
  callingCount: number;
  completedCount: number;
  pendingStudents: Array<{
    id: string;
    name: string;
    rollNumber: string;
    parentName: string;
    parentPhone: string;
    consecutiveAbsences: number;
    riskLevel: RiskLevel;
  }>;
}

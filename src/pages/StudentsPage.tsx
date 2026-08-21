import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Student } from '@/types';
import { Search, MapPin, Phone, User, Filter, Eye, AlertTriangle, CheckCircle2, ShieldAlert, UserPlus, Sparkles, Building, Languages, Upload, Download, Trash2, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchStudents, createStudent, bulkCreateStudents, deleteStudent } from '@/services/studentService';
import { Toast } from '@/components/ui/Toast';
import { placeRealTwilioPhoneCall } from '@/services/voiceCallService';

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'regular' | 'at_risk'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    section: 'CSE-A',
    parentName: '',
    parentPhone: '',
    preferredLanguage: 'Telugu',
    attendancePercentage: 88,
    location: '',
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const liveList = await fetchStudents('CSE-A');
      setStudents(liveList || []);
    } catch (err) {
      console.warn('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.location && student.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterRisk === 'at_risk') return student.attendancePercentage < 75;
      if (filterRisk === 'regular') return student.attendancePercentage >= 75;

      return true;
    });
  }, [students, searchQuery, filterRisk]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber || !formData.parentPhone) return;

    let cleanPhone = formData.parentPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) cleanPhone = '+91' + cleanPhone;
      else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) cleanPhone = '+' + cleanPhone;
      else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) cleanPhone = '+91' + cleanPhone.slice(1);
    }

    if (cleanPhone.length < 12) {
      alert('Please enter a valid 10-digit mobile number (e.g. +91 63033 18876 or 6303318876).');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createStudent({
        name: formData.name,
        rollNumber: formData.rollNumber.toUpperCase(),
        department: formData.department,
        section: formData.section,
        parentName: formData.parentName || 'Guardian',
        parentPhone: cleanPhone,
        preferredLanguage: formData.preferredLanguage,
        attendancePercentage: Number(formData.attendancePercentage) || 85,
        location: formData.location || 'Visakhapatnam',
      });

      if (created) {
        setStudents((prev) => [created, ...prev]);
        setToastMessage(`Student ${created.name} (${created.rollNumber}) added successfully!`);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          rollNumber: '',
          department: 'Computer Science & Engineering',
          section: 'CSE-A',
          parentName: '',
          parentPhone: '',
          preferredLanguage: 'Telugu',
          attendancePercentage: 88,
          location: '',
        });
      }
    } catch (err) {
      console.error('Error adding student:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from the directory?`)) {
      const ok = await deleteStudent(id);
      if (ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
        setToastMessage(`Removed ${name} from directory.`);
      }
    }
  };

  const handleQuickSeed = async () => {
    setIsSubmitting(true);
    const demoBatch = [
      { name: 'K. Sai Krishna', rollNumber: '23CSE012', parentName: 'K. Satyanarayana', parentPhone: '+916303318876', attendancePercentage: 68, location: 'Gajuwaka, Vizag' },
      { name: 'P. Sneha Reddy', rollNumber: '23CSE024', parentName: 'P. Venkat Reddy', parentPhone: '+916303318876', attendancePercentage: 92, location: 'MVP Colony, Vizag' },
      { name: 'M. Arjun Varma', rollNumber: '23CSE035', parentName: 'M. Ramaraju', parentPhone: '+916303318876', attendancePercentage: 71, location: 'Pendurthi, Vizag' },
      { name: 'T. Kavya Sri', rollNumber: '23CSE041', parentName: 'T. Apparao', parentPhone: '+916303318876', attendancePercentage: 86, location: 'NAD Junction, Vizag' },
      { name: 'B. Ravi Teja', rollNumber: '23CSE048', parentName: 'B. Somaraju', parentPhone: '+916303318876', attendancePercentage: 64, location: 'Simhachalam, Vizag' },
    ];

    const res = await bulkCreateStudents(demoBatch);
    if (res.success) {
      setToastMessage(`Successfully seeded ${res.count} classroom students!`);
      await loadStudents();
    } else {
      setToastMessage(`Error: ${res.error}`);
    }
    setIsSubmitting(false);
  };

  const handleInstantCall = async (student: Student) => {
    setIsCalling(true);
    try {
      const res = await placeRealTwilioPhoneCall({
        caseId: `instant-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        parentName: student.parentName || 'Guardian',
        parentPhone: student.parentPhone || '+916303318876',
      });

      if (res.success) {
        setToastMessage(`📞 Outbound Call Placed to ${student.parentName} (${student.parentPhone}) via Ravi Kumar!`);
      } else {
        setToastMessage(`Call Notice: ${res.error}`);
      }
    } catch (err: any) {
      setToastMessage(`Call error: ${err.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[32px] font-bold text-black tracking-tight">
            Students Directory
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Comprehensive roster of enrolled students, residential locations, and parent contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {students.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleQuickSeed} loading={isSubmitting}>
              <Sparkles className="h-4 w-4" />
              Quick Roster Seed (5 Students)
            </Button>
          )}
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, parent, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-neutral-200 bg-white text-black placeholder:text-neutral-400 focus-ring"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
          <button
            onClick={() => setFilterRisk('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-default cursor-pointer',
              filterRisk === 'all' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
            )}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setFilterRisk('at_risk')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-default cursor-pointer',
              filterRisk === 'at_risk' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-500 hover:text-black'
            )}
          >
            At Risk (&lt;75%)
          </button>
          <button
            onClick={() => setFilterRisk('regular')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-default cursor-pointer',
              filterRisk === 'regular' ? 'bg-white text-black shadow-xs font-bold' : 'text-neutral-500 hover:text-black'
            )}
          >
            Regular (&ge;75%)
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Roll Number</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Location / Area</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Parent Contact</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Attendance</th>
                  <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isAtRisk = student.attendancePercentage < 75;
                    const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2);

                    return (
                      <tr key={student.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-black">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-black">{student.name}</p>
                              <p className="text-xs text-neutral-500">{student.section || 'CSE-A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-mono text-neutral-600 font-medium">
                          {student.rollNumber}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>{student.location || 'Visakhapatnam'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          <div>
                            <p className="font-medium text-black">{student.parentName || 'Guardian'}</p>
                            <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
                              <Phone className="h-3 w-3" />
                              <span>{student.parentPhone || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-black rounded-full"
                                style={{ width: `${Math.min(student.attendancePercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-black">
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInstantCall(student)}
                              className="text-black hover:bg-neutral-100"
                              title="Trigger Real Phone Call"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                              className="text-black hover:bg-neutral-100"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(student.id, student.name)}
                              className="text-neutral-500 hover:text-black hover:bg-neutral-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-500 text-sm">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        className="max-w-lg"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 23CSE001"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lakshmi Devi"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Parent Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 63033 18876"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Location / Area</label>
              <input
                type="text"
                placeholder="e.g. Gajuwaka, Vizag"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase">Initial Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendancePercentage}
                onChange={(e) => setFormData({ ...formData, attendancePercentage: Number(e.target.value) })}
                className="w-full h-10 px-3 mt-1 text-sm rounded-lg border border-neutral-200 bg-white text-black focus-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title="Student Profile & Telecall Intelligence"
          className="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-base">
                {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-black text-base">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-neutral-500">{selectedStudent.rollNumber} · {selectedStudent.section || 'CSE-A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="text-neutral-500">Attendance Rate</span>
                <p className="text-base font-bold text-black mt-0.5">{selectedStudent.attendancePercentage}%</p>
              </div>
              <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                <span className="text-neutral-500">Risk Status</span>
                <p className="text-base font-bold text-black mt-0.5">
                  {selectedStudent.attendancePercentage < 75 ? 'High Risk' : 'Normal'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-200 pt-3">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Parent / Guardian:</span>
                <span className="font-medium text-black">{selectedStudent.parentName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Parent Mobile:</span>
                <span className="font-mono font-medium text-black">{selectedStudent.parentPhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">Location:</span>
                <span className="font-medium text-black">{selectedStudent.location || 'Visakhapatnam'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Voice Assistant:</span>
                <span className="font-medium text-black font-semibold">Ravi Kumar (Cartesia Neural en-IN)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full gap-2"
                onClick={() => handleInstantCall(selectedStudent)}
                loading={isCalling}
              >
                <PhoneCall className="h-4 w-4" />
                Place Instant AI Phone Call
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

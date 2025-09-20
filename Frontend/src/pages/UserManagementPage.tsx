import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserX, School, User } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { mockAPI, Student, Teacher } from '../utils/mockData';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [addStudentForm, setAddStudentForm] = useState({
    name: '',
    rollNumber: '',
    class: '',
    section: '',
    email: '',
  });
  const [addTeacherForm, setAddTeacherForm] = useState({
    name: '',
    subject: '',
    email: '',
  });
  const [deleteStudentId, setDeleteStudentId] = useState('');
  const [deleteTeacherId, setDeleteTeacherId] = useState('');

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to add student
    const newStudent: Student = { 
        id: `S-${Date.now()}`, 
        ...addStudentForm, 
        attendancePercentage: 100, 
        isPresent: false,
        lastAttendance: ""
    };
    mockAPI.addStudent(newStudent);
    showToast('success', 'Student Added', `${addStudentForm.name} has been added.`);
    setAddStudentForm({ name: '', rollNumber: '', class: '', section: '', email: '' });
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to add teacher
    const newTeacher: Teacher = { id: `T-${Date.now()}`, ...addTeacherForm };
    mockAPI.addTeacher(newTeacher);
    showToast('success', 'Teacher Added', `${addTeacherForm.name} has been added.`);
    setAddTeacherForm({ name: '', subject: '', email: '' });
  };

  const handleDeleteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to delete student
    mockAPI.deleteStudent(deleteStudentId);
    showToast('success', 'Student Deleted', `Student with ID ${deleteStudentId} has been deleted.`);
    setDeleteStudentId('');
  };

  const handleDeleteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call to delete teacher
    mockAPI.deleteTeacher(deleteTeacherId);
    showToast('success', 'Teacher Deleted', `Teacher with ID ${deleteTeacherId} has been deleted.`);
    setDeleteTeacherId('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">Add or remove students and teachers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Add Student Form */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Add Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label htmlFor="student-name" className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  id="student-name"
                  className="input-field w-full"
                  value={addStudentForm.name}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-roll" className="block text-sm font-medium mb-1">Roll Number</label>
                <input
                  type="text"
                  id="student-roll"
                  className="input-field w-full"
                  value={addStudentForm.rollNumber}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, rollNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-class" className="block text-sm font-medium mb-1">Class</label>
                <input
                  type="text"
                  id="student-class"
                  className="input-field w-full"
                  value={addStudentForm.class}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, class: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-section" className="block text-sm font-medium mb-1">Section</label>
                <input
                  type="text"
                  id="student-section"
                  className="input-field w-full"
                  value={addStudentForm.section}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, section: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="student-email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="student-email"
                  className="input-field w-full"
                  value={addStudentForm.email}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, email: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full"><UserPlus className="w-4 h-4 mr-2" /> Add Student</button>
            </form>
          </div>

          {/* Add Teacher Form */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><School className="w-5 h-5" /> Add Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label htmlFor="teacher-name" className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  id="teacher-name"
                  className="input-field w-full"
                  value={addTeacherForm.name}
                  onChange={(e) => setAddTeacherForm({ ...addTeacherForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="teacher-subject" className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  id="teacher-subject"
                  className="input-field w-full"
                  value={addTeacherForm.subject}
                  onChange={(e) => setAddTeacherForm({ ...addTeacherForm, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="teacher-email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="teacher-email"
                  className="input-field w-full"
                  value={addTeacherForm.email}
                  onChange={(e) => setAddTeacherForm({ ...addTeacherForm, email: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full"><UserPlus className="w-4 h-4 mr-2" /> Add Teacher</button>
            </form>
          </div>

          {/* Delete Student Form */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserX className="w-5 h-5" /> Delete Student</h3>
            <form onSubmit={handleDeleteStudent} className="space-y-4">
              <div>
                <label htmlFor="delete-student-id" className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  id="delete-student-id"
                  className="input-field w-full"
                  value={deleteStudentId}
                  onChange={(e) => setDeleteStudentId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-danger w-full"><UserX className="w-4 h-4 mr-2" /> Delete Student</button>
            </form>
          </div>

          {/* Delete Teacher Form */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserX className="w-5 h-5" /> Delete Teacher</h3>
            <form onSubmit={handleDeleteTeacher} className="space-y-4">
              <div>
                <label htmlFor="delete-teacher-id" className="block text-sm font-medium mb-1">Teacher ID</label>
                <input
                  type="text"
                  id="delete-teacher-id"
                  className="input-field w-full"
                  value={deleteTeacherId}
                  onChange={(e) => setDeleteTeacherId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-danger w-full"><UserX className="w-4 h-4 mr-2" /> Delete Teacher</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage;

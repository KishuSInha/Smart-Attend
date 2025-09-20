import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, TrendingUp, Award, Clock, BookOpen } from "lucide-react";
import { mockAPI } from "../../utils/mockData";

interface StudentStats {
  attendancePercentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  rank: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await mockAPI.getDashboardStats('student') as StudentStats;
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
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
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">Your attendance overview</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Section */}
          <div className="card-student rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-student to-student/80 rounded-full flex items-center justify-center shadow-lg mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, Saanjh Nayak</h2>
            <p className="text-muted-foreground">Class 10A • Roll Number: 2024001</p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-background/20 rounded-full">
              <Award className="w-4 h-4 mr-2 text-student" />
              <span className="text-sm font-medium">Rank #{stats?.rank} in class</span>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-success" />
                <span className={`text-2xl font-bold ${getAttendanceColor(stats?.attendancePercentage || 0)}`}>
                  {stats?.attendancePercentage}%
                </span>
              </div>
              <h3 className="font-semibold text-foreground">Attendance Rate</h3>
              <p className="text-sm text-muted-foreground">
                {getAttendanceStatus(stats?.attendancePercentage || 0)}
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">{stats?.totalDays}</span>
              </div>
              <h3 className="font-semibold text-foreground">Total Days</h3>
              <p className="text-sm text-muted-foreground">This academic year</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="w-8 h-8 text-accent" />
                <span className="text-2xl font-bold text-accent">{stats?.presentDays}</span>
              </div>
              <h3 className="font-semibold text-foreground">Present Days</h3>
              <p className="text-sm text-muted-foreground">Days attended</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-destructive" />
                <span className="text-2xl font-bold text-destructive">{stats?.absentDays}</span>
              </div>
              <h3 className="font-semibold text-foreground">Absent Days</h3>
              <p className="text-sm text-muted-foreground">Days missed</p>
            </div>
          </div>

          {/* Attendance Progress */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Attendance Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Progress</span>
                <span className="font-medium">{stats?.presentDays}/{stats?.totalDays} days</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-student to-student/80 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.attendancePercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target: 75% minimum</span>
                <span className={`font-medium ${
                  (stats?.attendancePercentage || 0) >= 75 ? 'text-success' : 'text-destructive'
                }`}>
                  {(stats?.attendancePercentage || 0) >= 75 ? 'Target Met ✓' : 'Below Target'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Present - 1st Period</p>
                  <p className="text-xs text-muted-foreground">Today, 9:00 AM • Mathematics</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Present - Full Day</p>
                  <p className="text-xs text-muted-foreground">Yesterday • 6/6 periods</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Absent - 3rd Period</p>
                  <p className="text-xs text-muted-foreground">Jan 13 • Physics Lab</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-primary text-left p-4 h-auto">
                <Calendar className="w-5 h-5 mb-2" />
                <div>
                  <p className="font-medium">View Full Calendar</p>
                  <p className="text-xs opacity-80">See all attendance records</p>
                </div>
              </button>
              
              <button className="btn-secondary text-left p-4 h-auto">
                <TrendingUp className="w-5 h-5 mb-2" />
                <div>
                  <p className="font-medium">Download Report</p>
                  <p className="text-xs opacity-80">Get attendance summary</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
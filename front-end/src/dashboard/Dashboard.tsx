import React from 'react';
import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import WelcomeBanner from './WelcomeBanner';
import StatisticsCard from './StatisticsCard';
import RecentCoursesTable from './RecentCoursesTable';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  // Sample data for recent courses
  const recentCourses = [
    {
      id: '1',
      code: 'CS101',
      name: 'Introduction to Computer Science',
      instructor: 'Dr. Nguyễn Văn A',
      progress: 85,
      status: 'In Progress' as const,
    },
    {
      id: '2',
      code: 'MATH201',
      name: 'Advanced Mathematics',
      instructor: 'Prof. Trần Thị B',
      progress: 100,
      status: 'Completed' as const,
    },
    {
      id: '3',
      code: 'ENG150',
      name: 'English Communication',
      instructor: 'Dr. Phạm Văn C',
      progress: 65,
      status: 'In Progress' as const,
    },
    {
      id: '4',
      code: 'PHY200',
      name: 'Physics II',
      instructor: 'Dr. Lê Thị D',
      progress: 0,
      status: 'Not Started' as const,
    },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-8">
          {/* Welcome Banner */}
          <WelcomeBanner studentName="Nguyễn Văn Thạnh" />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatisticsCard
              title="Completed Courses"
              value="5"
              subtitle="Out of 12 enrolled"
              icon={CheckCircle}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatisticsCard
              title="Pending Assessments"
              value="3"
              subtitle="Due this week"
              icon={BookOpen}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatisticsCard
              title="GPA/CLO Progress"
              value="3.82"
              subtitle="8 CLOs achieved"
              icon={TrendingUp}
              bgColor="bg-amber-100"
              iconColor="text-amber-600"
            />
          </div>

          {/* Recent Courses Table */}
          <div className="mb-8">
            <RecentCoursesTable courses={recentCourses} />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

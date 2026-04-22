import { Users, Workflow } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';
import { projectGroups } from './teacherData';

export default function TeacherProjects() {
  const { id } = useParams<{ id: string }>();
  const course = teacherCourses.find((item) => item.id === id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Project module</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          Quản lý nhóm và tiến độ {course ? `- ${course.courseTitle}` : ''}
        </h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Nhóm học phần</h4>
              <p className="mt-1 text-sm text-slate-500">Hỗ trợ tạo nhóm, mời thành viên và theo dõi task</p>
            </div>
            <Users className="h-5 w-5 text-violet-500" />
          </div>

          <div className="mt-6 space-y-3">
            {projectGroups.map((group) => (
              <div key={group.name} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{group.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{group.evidence}</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {group.done}/{group.tasks} task
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.round((group.done / group.tasks) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Kanban board</h4>
              <p className="mt-1 text-sm text-slate-500">To-do, Doing, Done va minh chung</p>
            </div>
            <Workflow className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { title: 'To-do', count: '12' },
              { title: 'Doing', count: '7' },
              { title: 'Done', count: '18' },
            ].map((column) => (
              <div key={column.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{column.title}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{column.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

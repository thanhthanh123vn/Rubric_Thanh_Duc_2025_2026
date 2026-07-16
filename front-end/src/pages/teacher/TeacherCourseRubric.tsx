import { FileText, Link2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import { getAllRubrics, type RubricDTO } from "@/pages/mainlecturer/api/RubricAPI";

type TeacherAssessmentItem = {
  assessmentId: string;
  assessmentName?: string | null;
  rubricId?: string | null;
};

type CourseRubricItem = RubricDTO & {
  linkedAssessmentNames: string[];
};

function getRubricName(rubric: RubricDTO) {
  return String(rubric.name ?? "Rubric");
}

function getRubricDescription(rubric: RubricDTO) {
  return String(rubric.description ?? "");
}

export default function TeacherCourseRubric() {
  const { id: offeringId } = useParams<{ id: string }>();
  const [rubrics, setRubrics] = useState<CourseRubricItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!offeringId) return;

    const fetchRubrics = async () => {
      try {
        setLoading(true);

        const [allRubrics, assessmentData] = await Promise.all([
          getAllRubrics(),
          assessmentService.getAssessmentsByOffering(offeringId),
        ]);

        const assessments = (Array.isArray(assessmentData) ? assessmentData : []) as TeacherAssessmentItem[];
        const rubricUsageMap = new Map<string, string[]>();

        assessments.forEach((assessment) => {
          const rubricId = assessment.rubricId?.trim();
          if (!rubricId) return;

          const linkedNames = rubricUsageMap.get(rubricId) || [];
          if (assessment.assessmentName) {
            linkedNames.push(assessment.assessmentName);
          }
          rubricUsageMap.set(rubricId, linkedNames);
        });

        const courseRubrics = (Array.isArray(allRubrics) ? allRubrics : [])
          .map((rubric) => ({
            ...rubric,
            linkedAssessmentNames: rubricUsageMap.get(rubric.id) || [],
          }));

        setRubrics(courseRubrics);
      } catch (error) {
        console.error("Loi khi tai danh sach Rubric:", error);
        setRubrics([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRubrics();
  }, [offeringId]);

  const totalLinkedAssessments = useMemo(
    () => rubrics.reduce((sum, rubric) => sum + rubric.linkedAssessmentNames.length, 0),
    [rubrics],
  );

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Rubric</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-900">Rubric cua hoc phan</h4>
          <p className="mt-2 text-sm text-slate-500">
            Hien thi cac rubric co the su dung va bai tap dang lien ket trong hoc phan nay.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">So rubric</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{rubrics.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bai tap gan rubric</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalLinkedAssessments}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-8 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Dang tai rubric...
          </div>
        ) : rubrics.length > 0 ? (
          rubrics.map((rubric) => (
            <button
              key={rubric.id}
              type="button"
              onClick={() => navigate(`${rubric.id}`)}
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-slate-700 transition-colors hover:border-emerald-200 hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h5 className="text-md font-semibold text-slate-800">{getRubricName(rubric)}</h5>
                  {getRubricDescription(rubric) ? (
                    <p className="mt-1 text-sm text-slate-500">{getRubricDescription(rubric)}</p>
                  ) : null}
                </div>
                <div className="rounded-full bg-white p-2 text-emerald-600">
                  <Link2 className="h-4 w-4" />
                </div>
              </div>

              {rubric.linkedAssessmentNames.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {rubric.linkedAssessmentNames.map((name) => (
                    <span
                      key={`${rubric.id}-${name}`}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="mt-3 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  Chua gan vao bai tap
                </span>
              )}
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-slate-500">
            Chua co rubric nao san sang de su dung.
          </div>
        )}
      </div>
    </div>
  );
}

import { courseApi } from "@/services/axiosConfig";

export interface LecturerSummary {
  lecturerId: string;
  lecturerName: string;
}

export interface TeachingAssistantAssignment {
  offeringId: string;
  offeringName: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: string;
  academicYear: string;
  status: string;
  mainLecturer: LecturerSummary | null;
  teachingAssistants: LecturerSummary[];
}

export const teachingAssistantApi = {
  getMyOfferings: async (): Promise<TeachingAssistantAssignment[]> => {
    const response = await courseApi.get("/teaching-assistants/offerings");
    return response.data;
  },

  updateAssistants: async (offeringId: string, assistantLecturerIds: string[]) => {
    const response = await courseApi.put(`/teaching-assistants/offerings/${offeringId}`, {
      assistantLecturerIds,
    });
    return response.data as TeachingAssistantAssignment;
  },
};

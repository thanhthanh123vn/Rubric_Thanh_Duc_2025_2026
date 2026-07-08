import { courseApi } from "@/services/axiosConfig"; // Thay đổi đường dẫn import nếu cần


export type GenerateExamRequest = {
    offeringId: string;
    questionBankId: string;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    cloId: string | null;
    examTitle: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
};


export type StudentAssignedExamResponse = {
    assignmentId: string;
    assessmentPaperId: string;
    examTitle: string;
    durationMinutes: number;
    questionCount: number;
    startTime: string;
    endTime: string;
    status: string;
};
export const assessmentPaperApi = {
    generateExamPaper: async (data: GenerateExamRequest) => {

        const response = await courseApi.post("/assessments/paper/generate", data);
        return response.data;
    },
    getAllExams: async () => {
        const response = await courseApi.get("/assessments/paper/getAllExams");
        return response.data;

    },
    publishExam: async (id:string) => {
        const response = await courseApi.post(`/assessments/paper/${id}/publish`);
        return response.data;
    },
    getStudentAssignedExams: async (offeringId: string) => {
        const response = await courseApi.get<StudentAssignedExamResponse[]>(
            "/assessments/paper/student/my-exams",
            {
                params: {
                    offeringId,
                },
            }
        );

        return response.data;
    },
};
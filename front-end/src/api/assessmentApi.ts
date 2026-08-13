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
const BASE = import.meta.env.VITE_API_BASE;
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
    getLecturerExamDetail:async (examId: string) => {
        const response = await courseApi.get(`/assessments/paper/${examId}/detail`);
        return response.data;
    },
    getStudentExamToTake:async(paperId:string)=>{
        const response = await courseApi.get(`/assessments/paper/${paperId}/take`);
        return response.data;
    },
    async getExamResult(examId: string) {
        const res = await courseApi.get(`/student/exams/${examId}/result`);
        return res.data;
    },
    unBlock(examId: string, studentId: string, deviceToken: string) {
        const jwtToken = localStorage.getItem("token");


        fetch(`${BASE}/api/v1/course-service/assessments/paper/student/exams/unlock`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": jwtToken ? `Bearer ${jwtToken}` : ""
            },
            body: JSON.stringify({
                examId,
                studentId,
                deviceToken
            }),
            keepalive: true
        }).catch(err => console.error("Unlock failed", err));
    },
    exit:async (examId: string) => {
        const response = await courseApi.post(`/assessments/paper/${examId}/exit`);
        return response.data;

    }
};
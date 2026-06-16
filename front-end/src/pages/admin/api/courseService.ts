import { courseApi } from "@/services/axiosConfig.ts";
import type {Course, CourseOfferingResponse} from "./type";
import type {SyllabusFile} from "@/api/type.ts";

const courseService = {
    getAllCourses: async (page: number, size: number, keyword: string) => {
        const response = await courseApi.get(`/courses`, {
            params: { page, size, keyword }
        });
        return response.data;
    },
    createCourse: async (data: Partial<Course>) => {
        const response = await courseApi.post(`/courses`, data);
        return response.data;
    },
    updateCourse: async (id: string, data: Partial<Course>) => {
        const response = await courseApi.put(`/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string) => {
        const response = await courseApi.delete(`/courses/${id}`);
        return response.data;
    },

    assignLecturers: (courseId: string, lecturerIds: string[]): Promise<CourseOfferingResponse> => {
        return courseApi.post(`/api/v1/course-service/courses/${courseId}/assign-lecturers`, {
            lecturerIds: lecturerIds
        });
    },

        getTeacherCourses: async () => {

            const response = await courseApi.get(`/courses/teacher/me/dashboard`);
            return response.data;
        },
    getLecturerDashBoardCourses: async () => {

        const response = await courseApi.get(`/courses/lecturer/me/dashboard`);
        return response.data;
    },
    geOfferingForDTeacherDeap:async(courseId : string) =>{
        const response = await courseApi.get(`/courses/${courseId}/offerings`);
        return response.data;
    },
    uploadSyllabus: async (courseId: string, files: FileList | File[]) => {
        const formData = new FormData();


        Array.from(files).forEach((file) => {

            formData.append("files", file);
        });

        const response = await courseApi.post(
            `/courses/${courseId}/upload-syllabus`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );
        return response.data;
    },
    getSyllabusFiles: async (offeringId: string): Promise<SyllabusFile[]> => {


        const response = await courseApi.get(`/courses/${offeringId}/syllabusFiles`);
        return response.data;
    },
    getOfferingsByCourse: (courseId: string) => {
        return courseApi.get(`/courses-offering/${courseId}/offerings`);
    },
    createOffering: (courseId: string, data: any) => {
        return courseApi.post(`/courses-offering/${courseId}/offerings`, data);
    }

};

export default courseService;

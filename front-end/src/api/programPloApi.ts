import { courseApi } from "@/services/axiosConfig.ts";

export interface ProgramPlo {
    ploId: string;
    programId: string;
    ploCode: string;
    description: string;
    linkedCloCount: number;
    status: "MAPPED" | "UNMAPPED";
}

export interface ProgramPloPayload {
    ploCode: string;
    description: string;
}

const programPloApi = {
    getAll: async (): Promise<ProgramPlo[]> => {
        const response = await courseApi.get("/plos");
        return Array.isArray(response.data) ? response.data : [];
    },
    create: async (payload: ProgramPloPayload): Promise<ProgramPlo> => {
        const response = await courseApi.post("/plos", payload);
        return response.data;
    },
    update: async (ploId: string, payload: ProgramPloPayload): Promise<ProgramPlo> => {
        const response = await courseApi.put(`/plos/${ploId}`, payload);
        return response.data;
    },
    delete: async (ploId: string): Promise<void> => {
        await courseApi.delete(`/plos/${ploId}`);
    },
};

export default programPloApi;

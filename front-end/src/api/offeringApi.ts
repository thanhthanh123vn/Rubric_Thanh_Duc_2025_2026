import api, {courseApi} from "@/services/axiosConfig.ts";
export const offeringApi = {
    getOfferingById :async(offeringId:string) => {
    const response = await api.get(`/offering/${offeringId}/course`);
    return response.data;
}
}
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { courseService } from "../../course/courseApi.ts";

export interface Assessment {
    assessmentId: string;
    assessmentName: string;
    weight: number;
    endTime: string;

    submissionId: string | null;
    submissionAt: string | null;

    calculatedScore: number | null;
    lecturerComment: string | null;

    cloCode: string[];
}

interface AssessmentState {
    data: Assessment[];
    loading: boolean;
    error: string | null;
}

const initialState: AssessmentState = {
    data: [],
    loading: false,
    error: null
};



// 🔥 thunk gọi API
export const fetchAssessments = createAsyncThunk(
    "assessment/fetchByOffering",
    async (offeringId: string, { rejectWithValue }) => {
        try {
            const data = await courseService.getAssessmentByOffering(offeringId);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Lỗi server");
        }
    }
);



// 🔥 slice
const assessmentSlice = createSlice({
    name: "assessment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssessments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssessments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAssessments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default assessmentSlice.reducer;
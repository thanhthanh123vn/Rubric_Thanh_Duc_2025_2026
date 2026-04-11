import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPost } from "../courseApi.ts";

export const fetchPost = createAsyncThunk(
    "post/fetchPost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await getPost(postId)
                .then(res => console.log(res.data))
                .catch(err => console.error(err))
        } catch (error: any) {
            console.log("API ERROR:", error.response);
            return rejectWithValue(error.response?.data || "Error fetching post");
        }
    }
);

interface PostState {
    data: any;
    loading: boolean;
    error: string | null;
}

const initialState: PostState = {
    data: null,
    loading: false,
    error: null,
};

// ⚙️ slice
const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // pending
            .addCase(fetchPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // success
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            // fail
            .addCase(fetchPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default postSlice.reducer;
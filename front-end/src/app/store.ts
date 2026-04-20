import { configureStore } from "@reduxjs/toolkit";
import postReducer from "@/features/course/student/courseStudentSlice.ts";



import authReducer from "@/authSlice";

export const store = configureStore({
    reducer : {
        post : postReducer,
        auth: authReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from "@reduxjs/toolkit";
import postReducer from "@/features/course/student/courseStudentSlice.ts";
import authReducer from "@/authSlice";
import assignmentReducer from "@/features/course/student/assignmentSlice.ts";

export const store = configureStore({
    reducer : {
        post : postReducer,
        auth: authReducer,
        assessment : assignmentReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
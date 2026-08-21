import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {User} from "@/pages/admin/api/type.ts";



interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const loadAuthFromStorage = (): AuthState => {
    try {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (token && userJson) {
            return {
                user: JSON.parse(userJson) as User,
                token,
                isAuthenticated: true,
            };
        }
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return {
        user: null,
        token: null,
        isAuthenticated: false,
    };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

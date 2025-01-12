import create from 'zustand'
import { persist } from "zustand/middleware";
import { jwtDecode } from 'jwt-decode';

const authStoreFunctions = (set, get) => ({
    authToken: null,
    user: null,

    login: (token) => {
        try {
            const decoded = jwtDecode(token);
            set({ authToken: token, user: decoded });
        } catch (error) {
            console.error('Invalid token:', error);
        }
    },

    logout: () => {
        set({ authToken: null, user: null });
        window.location.href = '/';
    },

    checkTokenExpiration: () => {
        const token = get().authToken;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Math.floor(Date.now() / 1000);

                if (decoded.exp < currentTime) {
                    console.warn('Token has expired');
                    get().logout();
                } else {
                    set({ authToken: token, user: decoded });
                }

            } catch (error) {
                console.error('Error decoding token:', error);
                get().logout();
            }
        }
    },

    setAuthToken: (token) => {
        set({ authToken: token });
    },
});


const useAuthStore = create(
    persist(
        (set, get) => ({
            ...authStoreFunctions(set, get),
        }),
        {
            name: 'authStore',
            getStorage: () => localStorage,
        }
    ));

setInterval(() => {
    const isExpired = useAuthStore.getState().checkTokenExpiration();
    if (isExpired) {
        useAuthStore.getState().logout();
    }
}, 30000);

export default useAuthStore;

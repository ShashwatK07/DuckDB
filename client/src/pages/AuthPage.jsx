import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


// const useAuthStore = create((set, get) => ({
//     checkTokenExpiration: () => {
//         const token = localStorage.getItem('authToken'); // Fetch the token from localStorage or other storage
//         if (token) {
//             const decoded = jwtDecode(token);
//             console.log(token)
//             // if (decoded.exp < currentTime) {
//             //     get().logout(); // Call the logout function if token is expired
//             // }
//         }
//     },
//     logout: () => {
//         localStorage.removeItem('authToken'); // Remove the token from storage
//         window.location.href = '/'; // Redirect to the login page
//     },
//     setAuthToken: (token) => {
//         localStorage.setItem('authToken', token); // Save the token
//     },
// }));

const AuthPage = () => {
    // const { setAuthToken } = useAuthStore();

    return (
        <div className="flex justify-center items-center flex-col">
            <div className="font-mono text-5xl">Welcome to SuperAI</div>
            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    const token = credentialResponse.credential;
                    if (token) {
                        // setAuthToken(token); // Save the token
                        const user = jwtDecode(token); // Decode the token
                        console.log('User Info:', user);
                    }
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>
    );
};

export default AuthPage;

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore';

const AuthPage = () => {
    const { login } = useAuthStore()
    const navigate = useNavigate()

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
                <div className="font-mono text-5xl mb-4">Welcome to SuperAI</div>
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        const token = credentialResponse.credential;
                        if (token) {
                            login(token)
                            navigate('/chat')
                        }
                    }}
                    onError={() => {
                        console.log('Login Failed');
                    }}
                />
            </div>
        </div>

    );
};

export default AuthPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import { GoogleLogin } from "@react-oauth/google";
import { useAuth0 } from "@auth0/auth0-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from '@clerk/clerk-react';
import useAuthStore from "../../store/authStore";

const textArray = [
    "I'm Super",
    "Welcome to Super AI",
    "Let's begin with connecting your Google profile",
];

const HomePage = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const { login, loginAuth0 } = useAuthStore()
    const [showLogin, setShowLogin] = useState(false);
    // const { loginWithRedirect, user } = useAuth0();
    const { user } = useUser();

    if (localStorage.getItem("user")) {
        return <navigate to="/" />;
    }

    useEffect(() => {
        if (currentIndex < textArray.length - 1) {
            const timer = setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setTimeout(() => {
                setShowLogin(true);
            }, 2000);
        }
    }, [currentIndex]);

    return (
        <main className="min-h-screen w-full bg-customLight relative overflow-hidden flex flex-col items-center justify-center">

            <div
                className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-tr from-gray-300 via-customLight shadow-[0px_10px_20px_rgba(0,0,0,0.2),inset_0px_-5px_10px_rgba(0,0,0,0.1)]"
            >
                <svg viewBox="0 0 100 20" className="w-8 h-8">
                    <motion.path
                        d="M0,10 C20,20 40,0 60,10 C80,20 100,0 120,10"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF6B6B" />
                            <stop offset="50%" stopColor="#9B6BFF" />
                            <stop offset="100%" stopColor="#4ECDC4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="m-6 flex items-center justify-center max-w-[60%] min-h-[100px] px-4 py-2">
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={currentIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-light text-center break-words leading-relaxed"
                        style={{
                            background: "linear-gradient(90deg, #B85B8F 0%, #9B6BFF 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {textArray[currentIndex]}
                    </motion.h1>
                </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-center min-h-[80px]">
                <AnimatePresence>
                    {showLogin && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    const token = credentialResponse.credential;
                                    if (token) {
                                        login(token);
                                        navigate("/intro");
                                    }
                                }}
                                onError={() => {
                                    console.log("Login Failed");
                                }}
                            /> */}

                            {/* <button onClick={async () => {
                                await loginWithRedirect()
                                await loginAuth0(user)

                            }}>Log In</button> */}

                            <div className="flex items-center justify-center  bg-gray-50">
                                <SignedOut>
                                    <div
                                        className="p-4 bg-white bg-clip-text text-transparent bg-gradient-to-r from-[#B85B8F] to-[#9B6BFF] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                        onClick={() => {
                                            loginAuth0(user);
                                            navigate('/intro');
                                        }}
                                    >
                                        <SignInButton />
                                    </div>
                                </SignedOut>
                                <SignedIn>
                                    <div
                                        className="p-4 bg-white bg-clip-text font-semibold text-transparent bg-gradient-to-r from-[#B85B8F] to-[#9B6BFF] rounded-lg shadow-md transition-shadow duration-200 cursor-pointer"
                                        onClick={() => {
                                            loginAuth0(user);
                                            navigate('/intro');
                                        }}
                                    >
                                        <UserButton />
                                    </div>
                                </SignedIn>
                            </div>


                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default HomePage;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useAuth } from '@clerk/clerk-react';
import { Sun, Moon, LogOut } from "lucide-react"

const Navbar = () => {
    const { user, theme, setTheme } = useAuthStore();
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const { signOut } = useAuth();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className={`top-0 left-0 w-full  ${theme === "dark" ? "bg-[#181C14] text-white" : "bg-[#F5EFFF] text-black"} py-3 flex justify-between items-center shadow-sm px-5`}>

            <div
                className="text-xl font-bold cursor-pointer mr-3"
                onClick={() => console.log("Navigating to Home")}
            >
                SuperAI
            </div>

            {user && (
                <div className="relative">
                    <button
                        onClick={() => setDropdownVisible((prev) => !prev)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-full`}
                    >
                        <img
                            src={user.imageUrl}
                            alt="User Profile"
                            className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{user.fullName}</span>
                    </button>
                    {dropdownVisible && (
                        <div
                            className={`absolute right-0 mt-2 ${theme === "dark" ? "bg-[#3C3D37] text-white" : "bg-[#E5D9F2] text-black"} rounded-md py-2 w-36 text-sm shadow-lg`}
                            onMouseLeave={() => setDropdownVisible(false)}
                        >
                            <button
                                onClick={handleLogout}
                                className="flex justify-start gap-2 items-center w-full text-left px-4 py-2"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="w-full text-left px-4 py-2 flex justify-start items-start gap-2 "
                            >
                                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />} {theme === "dark" ? "Dark" : "Light"} Theme
                            </button>
                        </div>
                    )}
                </div>
            )
            }
        </nav >
    );
};

export default Navbar;

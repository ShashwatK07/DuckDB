import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useClerk } from '@clerk/clerk-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const { signOut } = useClerk();

    const handleLogout = async () => {
        await signOut({ redirect: true, redirectUrl: '/' });
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#F4F6FF] p-4 flex justify-between items-center shadow-sm z-50">

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
                        className="flex items-center gap-2 bg-[#F4F6FF] text-black py-2 px-4 rounded-full"
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
                            className="absolute right-0 mt-2 bg-[#F4F6FF] rounded-md py-2 w-36 text-sm shadow-lg"
                            onMouseLeave={() => setDropdownVisible(false)}
                        >
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                            >
                                Logout
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                            >
                                Theme
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-black text-white p-4 flex justify-between items-center">

            <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
                SuperAI
            </div>

            {user && (
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <img
                            src={user.picture}
                            alt="User Profile"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{user.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-black py-2 px-4 rounded hover:bg-red-500"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

"use client"
import { useEffect, useState } from 'react';
import { useStore } from '../stores/store';
import axios from 'axios';
import { base_url } from '../utils/socket';
import withAuth from '../auth/userauthmiddleware';
import { FaTrophy, FaChessKnight, FaChartLine, FaGamepad } from 'react-icons/fa';

const ProfilePage = () => {
    const { user, setUser } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = window.localStorage.getItem('token');
                if (token) {
                    const response = await axios.post(`${base_url}/api/getuserdata`, 
                        { username: user?.username }, 
                        {
                            headers: {
                                'Authorization': `Bearer ${JSON.parse(token)}`,
                            }
                        }
                    );
                    if (response && response.data) {
                        const updatedUser = JSON.parse(atob(response.data.split('.')[1]));
                        setUser(updatedUser);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [user, setUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen ">
                <div className="bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! You're not logged in</h2>
                    <p className="text-gray-600">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    const winPercentage = user.games > 0 ? ((user.wins / user.games) * 100).toFixed(2) : 0;

    return (
        <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-extrabold text-white">Player Profile</h1>
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                            <span className="text-4xl">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <p className="text-blue-100 mt-2 text-xl">Welcome back, {user.username}!</p>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard icon={<FaChessKnight className="text-4xl text-indigo-500" />} title="Rating" value={user.rating} />
                        <StatCard icon={<FaGamepad className="text-4xl text-green-500" />} title="Games Played" value={user.games} />
                        <StatCard icon={<FaTrophy className="text-4xl text-yellow-500" />} title="Wins" value={user.wins} />
                        <StatCard icon={<FaChartLine className="text-4xl text-red-500" />} title="Win Rate" value={`${winPercentage}%`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value }:{icon:any, title:any, value:any}) => (
    <div className="bg-gray-50 rounded-xl p-6 shadow-md transition duration-300 ease-in-out transform hover:scale-105">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            </div>
            {icon}
        </div>
    </div>
);

export default withAuth(ProfilePage);
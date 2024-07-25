'use client'
import { useState, useEffect } from 'react';
import { useStore } from '../stores/store';
import { useRouter } from 'next/navigation' // Changed from 'next/navigation' to 'next/router'
import socket, { base_url } from '../utils/socket';
import axios from 'axios';
import withAuth from '../auth/userauthmiddleware';
import { FaChess, FaTrophy, FaUserFriends } from 'react-icons/fa';

interface User {
    name:string;
    username: string;
    rating: number;
    games:number;
    wins:number;
}

interface ChallengePopup {
    player1: string;
    player2: string;
    variant: number;
    rating: number;
}

const Home: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(1);
    const [enterLobby, setEnterLobby] = useState<boolean>(false);
    const [challengeUser, setChallengeUser] = useState<string>('');
    const [challengePopup, setChallengePopup] = useState<ChallengePopup | null>(null);
    const [challengeMessage, setChallengeMessage] = useState<string>('');
    const { user, setUser, setGameType } = useStore();
    const [topPlayers, setTopPlayers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        const data = window.localStorage.getItem('user');
        if (data) {
            const userObj: User = JSON.parse(data);
            socket.on('joined/' + userObj.username, (obj) => {
                setGameType(obj);
                router.push("game/" + obj.id);
            });
            socket.on('challengeSend/' + userObj.username, (player1: string, variant: number, rating: number, player2: string) => {
                setChallengePopup({ player1, player2, variant, rating });
            });
            socket.on('challengeRejected/' + userObj.username, () => {
                setChallengeMessage('Your challenge was rejected.');
            });
            setUser(userObj);
            getUserData(userObj.username);
            getTopPlayers();
        }
        return () => {
            cleanup();
        };
    }, [router, setUser, setGameType]);

    const cleanup = () => {
        socket.emit("cancelJoin");
    };

    const getTopPlayers = async () => {
        try {
            const data = window.localStorage.getItem('token');
            if (data) {
                const token: string = JSON.parse(data);
                const response = await axios.get<User[]>(`${base_url}/api/getallusers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response && response.data) {
                    setTopPlayers(response.data);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserData = async (id: string) => {
        try {
            const data = window.localStorage.getItem('token');
            if (data) {
                const token: string = JSON.parse(data);
                const response = await axios.post<string>(`${base_url}/api/getuserdata`, { username: id }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                if (response && response.data) {
                    window.localStorage.setItem('token', JSON.stringify(response.data));
                    const obj = JSON.parse(atob(response.data.split('.')[1]));
                    window.localStorage.setItem('user', JSON.stringify(obj));
                    setUser(obj);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleJoinGame = () => {
        setEnterLobby(true);
        socket.emit('join', { ...user, variant: selectedTab });
    };

    const cancelJoin = () => {
        if (user && user.username) {
            socket.emit('cancelJoin', user.username);
        }
        setEnterLobby(false);
    };

    const handleChallenge = () => {
        if(user?.username == challengeUser){
            setChallengeMessage(`Cannot challenge self`);
        }
        else if (challengeUser && user) {
            socket.emit('challengeSend', user.username, selectedTab, user.rating, challengeUser);
            setChallengeMessage(`Challenge sent to ${challengeUser}`);
        }
    };

    const acceptChallenge = () => {
        const p1 = {
            username: user?.username,
            rating: user?.rating,
        };
        const p2 = {
            username: challengePopup?.player1,
            rating: challengePopup?.rating,
        };
        const variant = challengePopup?.variant;
        socket.emit('challengeAccept', p1, p2, variant);
        setChallengePopup(null);
    };

    const declineChallenge = () => {
        if (challengePopup) {
            socket.emit('challengeRejected', challengePopup.player1);
            setChallengePopup(null);
            setChallengeMessage(`Challenge from ${challengePopup.player1} was rejected.`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                    <h1 className="text-4xl font-extrabold mb-2">Chess Arena</h1>
                    <p className="text-xl">Welcome, {user?.username || 'Player'}!</p>
                </div>
                
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Game Options */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                <FaChess className="mr-2 text-indigo-600" /> Select Game Type
                            </h2>
                            <div className="flex space-x-4 mb-6">
                                {[1, 3, 5].map((time) => (
                                    <button
                                        key={time}
                                        className={`flex-1 py-3 rounded-lg transition-all duration-300 font-medium ${
                                            selectedTab === time
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                        onClick={() => setSelectedTab(time)}
                                    >
                                        {time}+0
                                    </button>
                                ))}
                            </div>
                            <button
                                className={`w-full px-6 py-4 rounded-lg transition-colors duration-300 font-semibold text-lg shadow-md ${
                                    enterLobby 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                                onClick={enterLobby ? cancelJoin : handleJoinGame}
                            >
                                {enterLobby ? 'Cancel' : 'Join Game'}
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                <FaUserFriends className="mr-2 text-indigo-600" /> Challenge a Player
                            </h2>
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={challengeUser}
                                    onChange={(e) => setChallengeUser(e.target.value)}
                                    className="flex-grow p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors duration-300 font-semibold shadow-md"
                                    onClick={handleChallenge}
                                >
                                    Challenge
                                </button>
                            </div>
                            {challengeMessage && (
                                <p className="mt-4 text-center text-indigo-600 font-medium">{challengeMessage}</p>
                            )}
                        </div>
                    </div>

                    {/* Top Players */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <FaTrophy className="mr-2 text-indigo-600" /> Top Players
                        </h2>
                        <div className="space-y-3">
                            {topPlayers.map((player, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                    <span className="font-medium text-gray-700">{player.username}</span>
                                    <span className="text-indigo-600 font-semibold">{player.rating}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Challenge Popup Modal */}
            {challengePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Challenge from {challengePopup.player1}</h2>
                        <p className="text-xl mb-8 text-gray-600">Do you want to accept the challenge?</p>
                        <div className="flex space-x-4">
                            <button
                                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 font-semibold shadow-md"
                                onClick={acceptChallenge}
                            >
                                Accept
                            </button>
                            <button
                                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold shadow-md"
                                onClick={declineChallenge}
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withAuth(Home);

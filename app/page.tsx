'use client'
import { useEffect, useState } from 'react';
import { useStore } from './stores/store';
import { useRouter } from 'next/navigation';
import socket, { base_url } from './utils/socket';
import axios from 'axios';
const Home = () => {
    const [selectedTab, setSelectedTab] = useState(1);
    const { user, setUser, setGameType } = useStore()
    const [topPlayers, setTopPlayers] = useState([])
    const router = useRouter();

    useEffect(() => {
        const data = window.localStorage.getItem('user')
        if (data) {
            const userObj = JSON.parse(data)
            socket.on('joined/' + userObj.username, (obj: any) => {
                setGameType(obj)
                router.push("game/" + obj.id)
            })
            getUserData(userObj.username)
            setUser(userObj)
            getTopPlayers()
        }
    }, [])

    const getTopPlayers = async () => {
        try {
            const response = await axios.get(`${base_url}/api/getallusers`);
            if (response && response.data) {
                setTopPlayers(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
    const getUserData = async (id:string) => {
      try {
          const response = await axios.post(`${base_url}/api/getuserdata`, {username: id});
          if (response && response.data) {
              window.localStorage.setItem('user', JSON.stringify(response.data))
              setUser(response.data);
          }
      } catch (error) {
          console.log(error)
      }
  }
    const handleJoinGame = () => {
        socket.emit('join', { ...user, variant: selectedTab })
    };

    return (
        <div className="container mx-auto p-4 lg:flex lg:space-x-8">
            {/* Left Column - Game Options */}
            <div className="lg:w-2/3 mb-8 lg:mb-0">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Chess Game</h1>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Select Game Type</h2>
                        <div className="flex space-x-4 mb-6">
                            {[1, 3, 5].map((time) => (
                                <button
                                    key={time}
                                    className={`flex-1 py-3 rounded-lg transition-all duration-300 font-medium ${
                                        selectedTab === time
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => setSelectedTab(time)}
                                >
                                    {time}+0
                                </button>
                            ))}
                        </div>
                        <button
                            className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors duration-300 font-semibold text-lg shadow-md"
                            onClick={handleJoinGame}
                        >
                            Join Game
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column - User Info and Top Players */}
            <div className="lg:w-1/3 space-y-8">
                {/* User Info */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Profile</h2>
                    {user ? (
                        <div>
                            <p className="text-xl font-semibold text-gray-700">{user.username}</p>
                            <p className="text-gray-600">Rating: {user.rating}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600">Please log in to view your profile.</p>
                    )}
                </div>

                {/* Top Players */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Top Players</h2>
                    <div className="space-y-3">
                        {topPlayers.map((player: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                                <span className="font-medium text-gray-700">{player.username}</span>
                                <span className="text-gray-600 font-semibold">{player.rating}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
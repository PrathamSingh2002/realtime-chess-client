'use client'
import { useEffect, useState } from "react";
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from "@/app/utils/socket";
import { useStore } from "@/app/stores/store"; 
import axios from "axios";
import withAuth from "@/app/auth/userauthmiddleware";
import withGameAuth from "@/app/auth/gameauthmiddleware";
import { FaClock, FaUser, FaTrophy, FaHome } from 'react-icons/fa';

function GameRoom({ params }: { params: { roomid: string } }) {
    const [game] = useState(new Chess());
    const {user, gameType, setUser, setGameType} = useStore();
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameOverPopup, setGameOverPopup] = useState(false);
    const [gameOverData, setGameOverData] = useState({ message: '', whiteRatingChange: 0, blackRatingChange: 0 });
    const isCurrentPlayerTurn = user?.username === gameType?.whiteName ? game.turn() === 'w' : game.turn() === 'b';

    useEffect(() => {
        const res = localStorage.getItem('user')
        if(res){
            setUser(JSON.parse(res))
        }
        socket.emit('joinRoom', params.roomid)
        socket.on('updateScreen', (obj: any) => {
            game.load(obj.game);
            setGameType(obj);
        })
        socket.on('aborted', () => {
            setIsGameOver(true);
            setGameOverPopup(true);
            setGameOverData({ 
                message:"Aborted due to inactivity", 
                whiteRatingChange: 0,
                blackRatingChange: 0
            });
        })
        socket.on('gameOver', (obj: any, delta: number) => {
            setGameType(obj);
            setIsGameOver(true);
            setGameOverPopup(true);
            let message = '';
            if (obj.gameOver === 'win') {
                message = `${obj.whiteName} wins!`;
            } else if (obj.gameOver === 'loss') {
                message = `${obj.blackName} wins!`;
            } else {
                message = 'The game is a draw!';
            }
            setGameOverData({ 
                message, 
                whiteRatingChange: delta,
                blackRatingChange: -delta
            });
        })
    }, [])
    function formatTime(seconds:number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    function handlePieceDrop(source:string, target:string) {
        if (!isCurrentPlayerTurn || isGameOver) {
            return false;
        }
        return movePiece(source, target);
    }
    function movePiece(source: string, target: string) {
        try {
            let move = game.move({
                from: source,
                to: target,
            });
            if (move === null) return false;
            
            const gameStatus = game.isGameOver() 
                ? game.isDraw() 
                    ? "draw" 
                    : game.turn() === 'w' ? "loss" : "win"
                : "nill";
            
            socket.emit("move", params.roomid, game.fen(), game.turn(), gameStatus);
            return true;
        } catch(err) {
            return false
        }
    }  
    function handleResign(){
        socket.emit('resign', params.roomid, user?.username);
    }
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <div className="text-left flex items-center">
                        <FaUser className="mr-2" />
                        <div>
                            <div className="text-xl font-bold">{user?.username === gameType?.whiteName ? gameType?.blackName : gameType?.whiteName}</div>
                            <div className="text-sm text-gray-400">Rating: {user?.username === gameType?.whiteName ? gameType?.blackRating : gameType?.whiteRating}</div>
                        </div>
                    </div>
                    {gameType && (
                        <div className={`text-2xl font-bold flex items-center ${!isCurrentPlayerTurn ? 'text-red-500' : 'text-green-500'}`}>
                            <FaClock className="mr-2" />
                            {formatTime(user?.username === gameType?.whiteName ? gameType.blackTimer/2 : gameType.whiteTimer/2)}
                        </div>
                    )}
                </div>
                
                <div className="p-4">
                    <div className="aspect-square w-full mb-4">
                        <Chessboard 
                            boardOrientation={user?.username === gameType?.whiteName ? 'white' : 'black'}
                            position={gameType?.game}
                            onPieceDrop={handlePieceDrop}
                            customBoardStyle={{
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            }}
                        />
                    </div>
                </div>

                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <div className="text-left flex items-center">
                        <FaUser className="mr-2" />
                        <div>
                            <div className="text-xl font-bold">{user?.username}</div>
                            <div className="text-sm text-gray-400">Rating: {user?.username === gameType?.whiteName ? gameType?.whiteRating : gameType?.blackRating}</div>
                        </div>
                    </div>
                    {gameType && (
                        <div className={`text-2xl font-bold flex items-center ${isCurrentPlayerTurn ? 'text-red-500' : 'text-green-500'}`}>
                            <FaClock className="mr-2" />
                            {formatTime(user?.username === gameType?.whiteName ? gameType?.whiteTimer/2 : gameType?.blackTimer/2)}
                        </div>
                    )}
                </div>

                <div className="p-4 flex justify-center space-x-4">
                    <button 
                        className={`bg-red-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center ${isGameOver ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        onClick={handleResign}
                        disabled={isGameOver}
                    >
                        Resign
                    </button>
                    <button 
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-600 flex items-center"
                        onClick={() => window.location.href = '/'}
                    >
                        <FaHome className="mr-2" /> Home
                    </button>
                </div>

                {gameOverPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-8 rounded-lg shadow-xl">
                            <h2 className="text-2xl font-bold mb-4">{gameOverData.message}</h2>
                            <p>White rating change: {gameOverData.whiteRatingChange}</p>
                            <p>Black rating change: {gameOverData.blackRatingChange}</p>
                            <button 
                                className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                                onClick={() => window.location.href = '/'}
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuth(withGameAuth(GameRoom));

'use client'
import { useEffect, useState } from "react";
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket, { base_url } from "@/app/utils/socket";
import { useStore } from "@/app/stores/store"; 
import axios from "axios";
import withAuth from "@/app/auth/userauthmiddleware";
import withGameAuth from "@/app/auth/gameauthmiddleware";

function GameRoom({ params }: { params: { roomid: string } }) {
    const [game] = useState(new Chess());
    const {user, gameType, setUser, setGameType} = useStore();
    const [isGameOver, setIsGameOver] = useState(false);
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
            setIsGameOver(true)
            setGameOverData({ 
                message:"Aborted due to inactivity", 
                whiteRatingChange: 0,
                blackRatingChange: 0
            });
        })
        socket.on('gameOver', (obj: any, delta: number) => {
            setGameType(obj);
            setIsGameOver(true);
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


    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center p-4">
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="text-left">
                <div className="text-xl font-bold">{user?.username === gameType?.whiteName ? gameType?.blackName : gameType?.whiteName}</div>
                <div className="text-sm text-gray-400">Rating: {user?.username === gameType?.whiteName ? gameType?.blackRating : gameType?.whiteRating}</div>
            </div>
            {gameType && (
                <div className={`text-2xl font-bold ${!isCurrentPlayerTurn ? 'text-red-500' : 'text-green-500'}`}>
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
            <div className="text-left">
                <div className="text-xl font-bold">{user?.username}</div>
                <div className="text-sm text-gray-400">Rating: {user?.username === gameType?.whiteName ? gameType?.whiteRating : gameType?.blackRating}</div>
            </div>
            {gameType && (
                <div className={`text-2xl font-bold ${isCurrentPlayerTurn ? 'text-red-500' : 'text-green-500'}`}>
                    {formatTime(user?.username === gameType?.whiteName ? gameType?.whiteTimer/2 : gameType?.blackTimer/2)}
                </div>
            )}
        </div>

        <div className="p-4 flex justify-center space-x-4">
            <button 
                className={`bg-red-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${isGameOver ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                disabled={isGameOver}
            >
                Resign
            </button>
            <button 
                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${isGameOver ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                disabled={isGameOver}
            >
                Offer Draw
            </button>
        </div>
    </div>

    {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over</h2>
                <p className="text-xl mb-6 text-gray-700">{gameOverData.message}</p>
                <div className="mb-6">
                    <p className="text-lg font-semibold mb-2">Rating Changes:</p>
                    <p className={`text-lg ${gameOverData.whiteRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gameType?.whiteName}: {gameOverData.whiteRatingChange > 0 ? '+' : ''}{gameOverData.whiteRatingChange}
                    </p>
                    <p className={`text-lg ${gameOverData.blackRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gameType?.blackName}: {gameOverData.blackRatingChange > 0 ? '+' : ''}{gameOverData.blackRatingChange}
                    </p>
                </div>
                <div className="flex space-x-4">
                    <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={() => setIsGameOver(false)}
                    >
                        Close
                    </button>
                    <button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        onClick={() => {
                            // Add your logic to navigate to home page
                            // For example: router.push('/home')
                        }}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    )}
</div>
    );
}

export default withAuth(withGameAuth(GameRoom));
'use client'
import { useEffect, useState } from "react";
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import socket from "@/app/utils/socket";
import { useStore } from "@/app/stores/store"; 
import axios from "axios";



export default function GameRoom({ params }: { params: { roomid: string } }) {
    const base_url = 'http://localhost:5000';
    const [game] = useState(new Chess());
    const {user, gameType, setUser, setGameType} = useStore();
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameOverData, setGameOverData] = useState({ message: '', whiteRatingChange: 0, blackRatingChange: 0 });

    useEffect(() => {
        const res = localStorage.getItem('user')
        if(res){
            setUser(JSON.parse(res))
        }
        socket.emit('joinRoom', params.roomid)
        socket.on('updateScreen', (obj: any) => {
            game.load(obj.game)
            setGameType(obj)
        })
        socket.on('gameOver', (obj: any, delta: number) => {
            setGameType(obj);
            setIsGameOver(true);
            console.log(obj)
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
        reload()

        return () => {
            socket.off('updateScreen');
            socket.off('gameOver');
        }
    }, [])

    async function reload() {
        try {
            const response = await axios.post(`${base_url}/api/getgamestats`, {id: params.roomid});
            if(response.data){
                setGameType(response.data)
            }
        } catch (error) {
            console.log(error)
        }
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

    const isCurrentPlayerTurn = user?.username === gameType?.whiteName ? game.turn() === 'w' : game.turn() === 'b';

    return (
        <div className="w-full flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-4 text-right">
                    <div className="text-xl font-bold">{user?.username === gameType?.whiteName ? gameType?.blackName : gameType?.whiteName}</div>
                    <div className="text-sm text-gray-600">Rating: {user?.username === gameType?.whiteName ? gameType?.blackRating : gameType?.whiteRating}</div>
                    {
                    gameType &&
                    <div className={`text-lg font-semibold ${!isCurrentPlayerTurn ? 'text-red-500' : 'text-gray-700'}`}>
                    {user?.username === gameType?.whiteName ? gameType.blackTimer/10 : gameType.whiteTimer/10}s
                    </div>
                    }
                </div>
                <div className="size-[400px] mb-4">
                    <Chessboard 
                        boardOrientation={user?.username === gameType?.whiteName ? 'white' : 'black'}
                        position={gameType?.game}
                        onPieceDrop={movePiece}
                    />
                </div>
                <div className="mt-4">
                    <div className="text-xl font-bold">{user?.username}</div>
                    <div className="text-sm text-gray-600">Rating: {user?.username === gameType?.whiteName ? gameType?.whiteRating : gameType?.blackRating}</div>
                    {
                        gameType &&
                    <div className={`text-lg font-semibold ${isCurrentPlayerTurn ? 'text-red-500' : 'text-gray-700'}`}>
                        {user?.username === gameType?.whiteName ? gameType?.whiteTimer/10 : gameType?.blackTimer/10}s
                    </div>
                    }
                </div>
            </div>

            {isGameOver && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over</h2>
                        <p className="text-xl mb-6 text-gray-700">{gameOverData.message}</p>
                        <div className="mb-6">
                            <p className="text-lg font-semibold">Rating Changes:</p>
                            <p className={`text-lg ${gameOverData.whiteRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gameType?.whiteName}: {gameOverData.whiteRatingChange > 0 ? '+' : ''}{gameOverData.whiteRatingChange}
                            </p>
                            <p className={`text-lg ${gameOverData.blackRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gameType?.blackName}: {gameOverData.blackRatingChange > 0 ? '+' : ''}{gameOverData.blackRatingChange}
                            </p>
                        </div>
                        <button 
                            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => setIsGameOver(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
// store.ts
import create from 'zustand';

type User = {
    username: string;
    name: string;
    rating: number;
    games: number;
    wins: number;
};

export type GameType = {
    id:string,
    game:string;
    variant: string;
    whiteName: string;
    whiteRating: number;
    blackName: string;
    blackRating: number;
    gameOver: string;
    whiteTimer: number;
    blackTimer: number;
};

type State = {
    user: User | null;
    gameType: GameType | null;
    setUser: (user: User | null) => void;
    setGameType: (gameType: GameType | null) => void;
};

export const useStore = create<State>((set) => ({
    user: null,
    gameType: null,
    setUser: (user) => set((state) => ({ ...state, user })),
    setGameType: (gameType) => set((state) => ({ ...state, gameType })),
}));

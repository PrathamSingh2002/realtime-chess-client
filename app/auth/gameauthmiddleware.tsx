'use client'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { base_url } from '../utils/socket';
import { useStore } from '../stores/store';
import Custom404 from '@/components/custom404';
const withGameAuth = (WrappedComponent:any) => {
    return (props:any) => {
        const {setGameType} = useStore();
        const [isAuthenticated, setIsAuthenticated] = useState(false)
        const router = useRouter();
        async function getGameData() {
            try {
                const data = window.localStorage.getItem('token')
                if(data){
                    const token = JSON.parse(data);
                    const response = await axios.post(`${base_url}/api/getgamestats`, {id: props.params.roomid}, {
                        headers:{
                            'Authorization': `Bearer ${token}`,
                        }
                    });
                    if(response.data){
                        setIsAuthenticated(true);
                        setGameType(response.data);
                    }
                }else{
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log(error)
            }
        }
        useEffect(() => {
            getGameData();
        }, [router]);

        if(isAuthenticated){
            return <WrappedComponent {...props} />;
        }else{
            return <Custom404/>
        }
    };
};

export default withGameAuth;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import Error from 'next/error';
import LoadingScreen from '@/components/loadingScreen';
const withAuth = (WrappedComponent:any) => {
    return (props:any) => {
        const [isAuthenticated, setIsAuthenticated] = useState("loading")
        const router = useRouter();
        const checkAuth = () => {
            const data = window.localStorage.getItem('token');
            if(!data){
                return false;
            }else{
                try{
                    const decodedToken = jwtDecode(JSON.parse(data));
                    const currentTime = Date.now() / 1000;
                    if(!decodedToken.exp){
                        return false;
                    }else{
                        return decodedToken.exp >= currentTime;
                    }
                }
                catch(err){
                    return false;
                }
            }
        }
        useEffect(() => {
            const valid = checkAuth();
            if(!valid){
                router.push('/login');
                setIsAuthenticated('false');
            }else{
                setIsAuthenticated('true');
            }
        }, [router]);

        if(isAuthenticated == 'loading'){
            return <LoadingScreen/>
        }else if(isAuthenticated == 'true'){
            return <WrappedComponent {...props}/>
        }
        else {
            return <Error statusCode={404}/>
        }
    };
};

export default withAuth;

import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react'; // icons
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navi = useNavigate();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const login = useGoogleLogin({
        onSuccess: (codeResp) => {
            getuser(codeResp);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const getuser = (tokeninfo) => {
        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokeninfo.access_token}`, {
            headers: {
                Authorization: `Bearer ${tokeninfo.access_token}`,
                Accept: 'application/json'
            }
        }).then((resp) => {
            localStorage.setItem('user', JSON.stringify(resp.data));
            window.location.reload();
        });
    };

    return (
        <div className='p-2 shadow-sm flex justify-between items-center px-5 bg-white dark:bg-gray-900 dark:text-white transition'>
            <div className='flex items-center gap-3'>
                <img onClick = {()=>navi('/')} src='/logo1.svg' alt="logo" />
                <h1 onClick = {()=>navi('/')} className="font-bold text-4xl flex">
                    <span style={{ color: '#FF7A1A' }}>AI</span>
                    <span style={{ color: '#4B2E83' }}>-</span>
                    <span style={{ color: '#8F73D1' }}>Trip</span>
                </h1>
            </div>

            <div className='flex items-center gap-4 p-2'>
                {/* 🌗 Theme Toggle Button */}
                <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    className='rounded-full'
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                {/* My Trips & Profile */}
                {user ? (
                    <>
                    
                        <Button onClick = {()=>{
                            navi('/mytrips')
                        }}className='rounded-full'>My Trips</Button>
                       
                        <Popover>
                            <PopoverTrigger>
                                <img className='w-9 h-9 rounded-full' src={user.picture} />
                            </PopoverTrigger>
                            <PopoverContent className='w-25 h-15 rounded-2xl'>
                                <h2 onClick={() => {
                                    googleLogout();
                                    localStorage.clear();
                                    navi('/')
                                }}>Log Out</h2>
                            </PopoverContent>
                        </Popover>
                    </>
                ) : (
                    <Button onClick={login}>Sign In</Button>
                )}
            </div>
        </div>
    );
}

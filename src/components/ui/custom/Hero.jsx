import React from 'react'
import { Button } from '../button'
import { Link, useNavigate } from 'react-router-dom'
import NoUser from '@/components/ui/custom/mymin'

export default function Hero() {
    const navi = useNavigate()
    const user = localStorage.getItem(`user`)
  
    return (
        <>
            <div className="flex flex-col items-center mt-10 px-6 text-center">
                <h1 className="font-extrabold text-[45px]">
                    <span className="text-[#FF7A1A] block">
                        "Your Dream Trip, One Click Away"
                    </span>
                    <span className="text-[30px] text-[#4B2E83] block mt-4">
                        Explore the world with AI-crafted itineraries made just for you.
                    </span>
                </h1>

            
                <Button onClick = {()=>{navi('/create-trip')}} className="mt-6">Get Started, Now</Button>

                <NoUser />
                

                
            </div>

        </>



    )
}

import { db } from '@/service/firebase'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Information from '../components/info.jsx'
import Hotels from '../components/Hotels.jsx'
import Itinerary from '../components/itinerary.jsx'

export default function Viewtrip() {

    const [trip, settrip] = useState()

    const { tripid } = useParams()
    useEffect(() => {
        tripid && Gettripdata()
    }, [tripid])

    const HotelInfo = () => {
        if (trip) console.log("Trip updated:", trip.tripData.hotelOptions);
    };



    const Gettripdata = async () => {
        const docref = doc(db, 'AITrip', tripid)
        const docsnap = await getDoc(docref)
        if (docsnap.exists()) {
            console.log(docsnap.data())
            settrip(docsnap.data())

        }
        else {
            console.log("Unable to fetch the data")
        }

        

    }
    return (

        <div className='p-10 md:px-20 lg:px-40 xl:px-60'>
            {/* View-Trip ID: {tripid} */}
            {/* Information Section */}
            <Information trip={trip} />
            {HotelInfo()}
            <Hotels trip={trip}/>
            <Itinerary trip={trip} />

        </div>
    )
}


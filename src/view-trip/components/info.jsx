import React, { useEffect, useState } from 'react'
import GetPlaceDetails from '@/service/gloablapi.jsx';

export default function Information({ trip }) {

    const [photo, setphoto] = useState()

    useEffect(() => {
        if (
            trip?.userSelection?.location &&
            trip?.tripData?.itinerary?.day1?.activities?.length > 0
        ) {
            Getphoto();
        }
    }, [trip]);

    const Getphoto = async () => {
        try {
            const data = {
                textQuery: `${trip.userSelection.location} ${trip.tripData.itinerary.day1.activities[0].placeName}`,
            };

            const resp = await GetPlaceDetails(data);
            console.log("Raw response from GetPlaceDetails:", resp);

            if (
                !resp?.data?.places?.[0]?.photos ||
                resp.data.places[0].photos.length === 0
            ) {
                console.error("No photos found in place details.");
                return;
            }

            const photo = resp.data.places[0].photos[0]; // safer than photos[8]
            const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=600&maxWidthPx=800&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;

            setphoto(photoUrl);
        } catch (error) {
            console.error("Error fetching place details:", error);
        }
    };


    if (!trip) {
        return <p>Loading trip data...</p>; // Or return null or a spinner
    }
    return (
        // <div className='my-5 flex flex-col ap-2'>
        //   <h2 className='font-bold text-3xl'>{trip.userSelection.location ?? "No Location"}</h2>
        // </div>
        <div>
            <div >
                <img className='w-400 h-120 rounded - full' src={photo} alt="" />
            </div>
            <div className='my-5 flex flex-col gap-2'>
                <h2 className='font-bold text-xl'>{trip.userSelection.location ?? "No Location"}</h2>
                <div className='hidden sm:flex gap-5' >
                    <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text xs md: text md'>🕔 Duration: {trip.userSelection.Days} Days</h2>
                    <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text xs md: text md'>💸 Budget: {trip.userSelection.Budget} INR</h2>
                    <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text xs md: text md'>👩‍👧‍👦 No.of Travellers: {trip.userSelection.People} People</h2>
                </div>
            </div>


        </div>




    )
}

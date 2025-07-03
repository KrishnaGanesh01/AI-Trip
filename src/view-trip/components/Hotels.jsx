import React, { useState, useEffect } from 'react';
import GetPlaceDetails from '@/service/gloablapi.jsx';

export default function Hotels({ trip }) {
    const [hotelPhotos, setHotelPhotos] = useState({});

    useEffect(() => {
        const fetchAllPhotos = async () => {
            if (!trip?.tripData?.hotelOptions || !trip?.userSelection?.location) return;

            const newPhotos = {};

            for (const hotel of trip.tripData.hotelOptions) {
                try {
                    const data = {
                        textQuery: `${trip.userSelection.location} ${hotel.hotelName}`,
                    };

                    const resp = await GetPlaceDetails(data);

                    if (
                        resp?.data?.places &&
                        resp.data.places[0]?.photos &&
                        resp.data.places[0].photos.length > 0
                    ) {
                        const name = resp.data.places[0].photos[0].name;
                        const photourl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600&maxWidthPx=800&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
                        newPhotos[hotel.hotelName] = photourl;
                    } else {
                        newPhotos[hotel.hotelName] = '/fallback-hotel.jpg';
                    }
                } catch (err) {
                    console.error("Error fetching photo for", hotel.hotelName, err);
                    newPhotos[hotel.hotelName] = '/fallback-hotel.jpg';
                }
            }

            setHotelPhotos(newPhotos);
        };

        fetchAllPhotos();
    }, [trip]);

    if (!trip?.tripData?.hotelOptions) {
        return <p className="text-center text-gray-600">Loading hotel data...</p>;
    }

    const hotels = trip.tripData.hotelOptions;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-[#FF7A1A] mb-6 text-center">🏨 Hotel Recommendations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel, index) => (
                    <div
                        key={index}
                        className="border rounded-xl shadow-lg p-4 bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                        <img
                            src={hotelPhotos[hotel.hotelName] || '/fallback-hotel.jpg'}
                            alt={hotel.hotelName}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        <h3 className="mt-3 text-lg font-bold text-[#4B2E83]">{hotel.hotelName}</h3>
                        <p className="text-sm text-gray-700">{hotel.description}</p>
                        <p className="text-sm"><strong>📍 Address:</strong> {hotel.hotelAddress}</p>
                        <p className="text-sm"><strong>💰 Price:</strong> ₹{hotel.price}</p>
                        <p className="text-sm"><strong>⭐ Rating:</strong> {hotel.rating}</p>
                        {hotel.geoCoordinates && (
                            <p className="text-sm text-blue-600">
                                <a
                                    href={`https://maps.google.com/?q=${hotel.hotelName}, ${trip.userSelection.location}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    View on Map
                                </a>
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

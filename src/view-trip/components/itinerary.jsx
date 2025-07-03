import React, { useEffect, useState } from 'react';
import GetPlaceDetails from '@/service/gloablapi.jsx'; // adjust if the path differs

export default function Itinerary({ trip }) {
  const [activityPhotos, setActivityPhotos] = useState({});

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!trip?.tripData?.itinerary || !trip?.userSelection?.location) return;

      const newPhotos = {};

      const itinerary = trip.tripData.itinerary;
      const dayKeys = Object.keys(itinerary);

      for (const dayKey of dayKeys) {
        const activities = itinerary[dayKey].activities || [];

        for (const place of activities) {
          const query = `${trip.userSelection.location} ${place.placeName}`;

          try {
            const data = { textQuery: query };
            const resp = await GetPlaceDetails(data);

            if (
              resp?.data?.places?.[0]?.photos?.length > 0
            ) {
              const name = resp.data.places[0].photos[0].name;
              const photoURL = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600&maxWidthPx=800&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
              newPhotos[place.placeName] = photoURL;
            } else {
              newPhotos[place.placeName] = '/fallback-place.jpg';
            }
          } catch (err) {
            console.error(`Failed to fetch photo for ${place.placeName}`, err);
            newPhotos[place.placeName] = '/fallback-place.jpg';
          }
        }
      }

      setActivityPhotos(newPhotos);
    };

    fetchPhotos();
  }, [trip]);

  if (!trip?.tripData?.itinerary) {
    return <p className="text-center text-gray-600">Loading itineraries...</p>;
  }

  const itinerary = trip.tripData.itinerary;

  // Sort day keys like "day1", "day2"
  const sortedDayKeys = Object.keys(itinerary).sort((a, b) => {
    const numA = parseInt(a.replace('day', ''), 10);
    const numB = parseInt(b.replace('day', ''), 10);
    return numA - numB;
  });

  return (
    <div className="mt-16 max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-extrabold text-[#FF7A1A] mb-8 text-center">🗺️ Suggested Itinerary</h2>
      {sortedDayKeys.map((dayKey, idx) => {
        const dayPlan = itinerary[dayKey];
        const activities = Array.isArray(dayPlan.activities) ? dayPlan.activities : [];

        return (
          <div key={idx} className="mb-12">
            <h3 className="text-xl font-bold text-[#4B2E83] mb-4 capitalize">
              {dayKey.replace(/day/, 'Day ')} {dayPlan.theme && ` - ${dayPlan.theme}`}
            </h3>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((place, index) => (
                <div key={index} className="border rounded-lg shadow-md p-4 bg-white">
                  <img
                    src={activityPhotos[place.placeName] || '/fallback-place.jpg'}
                    alt={place.placeName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/fallback-place.jpg';
                    }}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                  <h4 className="text-lg font-semibold text-[#4B2E83]">{place.placeName}</h4>
                  <p className="text-sm text-gray-700 mb-1">{place.placeDetails}</p>
                  <p className="text-sm"><strong>💸 Ticket:</strong> ₹{place.ticketPricing}</p>
                  <p className="text-sm"><strong>🚗 Travel Time:</strong> {place.timeToTravel}</p>
                  <p className="text-sm"><strong>⏰ Best Time:</strong> {place.bestTimeToVisit}</p>
                  {place.geoCoordinates && (
                    <p className="text-sm text-blue-600 mt-2">
                      <a
                        href={`https://maps.google.com/?q=${place.geoCoordinates.latitude},${place.geoCoordinates.longitude}`}
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
      })}
    </div>
  );
}

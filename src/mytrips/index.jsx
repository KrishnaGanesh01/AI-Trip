import { db } from '@/service/firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Pencil } from 'lucide-react';
import GetPlaceDetails from '@/service/gloablapi';

export default function Mytrips() {
  const [data, setData] = useState([]);
  const [hotelPhotos, setHotelPhotos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await UsertripsInfo();
      setData(res);
    };
    fetchData();
  }, []);

  const UsertripsInfo = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const q = query(collection(db, 'AITrip'), where('userdetails', '==', user.email));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  };

  // Fetch photos once trip data is loaded
  useEffect(() => {
    const fetchAllPhotos = async () => {
      const newPhotos = {};

      for (const trip of data) {
        try {
          const firstHotel = trip.tripData?.hotelOptions?.[0];
          if (!firstHotel || !trip.userSelection?.location) {
            newPhotos[trip.id] = '/fallback-hotel.jpg';
            continue;
          }

          const payload = {
            textQuery: `${trip.userSelection.location} ${firstHotel.hotelName}`,
          };

          const resp = await GetPlaceDetails(payload);

          if (
            resp?.data?.places &&
            resp.data.places[0]?.photos &&
            resp.data.places[0].photos.length > 0
          ) {
            const name = resp.data.places[0].photos[0].name;
            const photourl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=600&maxWidthPx=800&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
            newPhotos[trip.id] = photourl;
          } else {
            newPhotos[trip.id] = '/fallback-hotel.jpg';
          }
        } catch (err) {
          console.error("Error fetching photo for trip", trip.id, err);
          newPhotos[trip.id] = '/fallback-hotel.jpg';
        }
      }

      setHotelPhotos(newPhotos);
    };

    if (data.length > 0) {
      fetchAllPhotos();
    }
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'AITrip', id));
      setData((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      console.error('Error deleting trip:', err);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold text-[#FF7A1A] mb-6 text-center">🧳 My Trips</h2>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((trip) => (
            <div
              key={trip.id}
              className="border rounded-xl shadow-lg p-4 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(`/view-trip/${trip.id}`)}
            >
              <img
                src={hotelPhotos[trip.id] || '/fallback-hotel.jpg'}
                alt="hotel"
                className="w-full h-40 object-cover rounded-md mb-3"
              />

              <h3 className="text-lg font-bold text-[#4B2E83]">
                {trip.userSelection?.location}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>📅 Days:</strong> {trip.userSelection?.Days}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>💰 Budget:</strong> ₹{trip.userSelection?.Budget}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>👥 People:</strong> {trip.userSelection?.People}
              </p>

              {trip.userSelection?.Date && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>🗓️ Date:</strong> {trip.userSelection.Date}
                </p>
              )}

              {/* Action Buttons */}
              <div
                className="flex justify-between gap-2 mt-4"
                onClick={(e) => e.stopPropagation()} // Prevent navigation
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-1 text-sm"
                  onClick={() => navigate(`/view-trip/${trip.id}`)}
                >
                  <Eye size={16} /> View
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-1 text-sm"
                  onClick={() => navigate(`/create-trip?edit=${trip.id}`)}
                >
                  <Pencil size={16} /> Edit
                </Button>

                <Button
                  style={{ color: '#FF7A1A' }}
                  className="flex items-center gap-1 text-sm "
                  onClick={() => handleDelete(trip.id)}
                >
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">No trips found.</p>
      )}
    </div>
  );
}

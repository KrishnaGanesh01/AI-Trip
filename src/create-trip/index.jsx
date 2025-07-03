import React, { useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Genai from '@/service/ai-model';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebase';
import { useNavigate } from 'react-router-dom';
import { RiAlbumLine } from "react-icons/ri";


function CreateTrip() {
    const [place, setPlace] = useState()
    const [budget, setBudget] = useState()
    const [people, setpeople] = useState()
    const [days, setDays] = useState()
    const [dialogue, setDailogue] = useState(false)
    const [loading, setloading] = useState()
    const [formData, setformData] = useState([])
    const user = localStorage.getItem('user')
    const navi = useNavigate()


    const handleinput = (name, value) => {
        setformData({
            ...formData,
            [name]: [value]
        })

    }

    


    function removeUndefined(obj) {
        if (Array.isArray(obj)) {
            return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === "object") {
            const cleaned = {};
            for (const key in obj) {
                if (obj[key] !== undefined) {
                    cleaned[key] = removeUndefined(obj[key]);
                }
            }
            return cleaned;
        }
        return obj;
    }

    const GenerateTrip = async () => {
        if (days > 10 || !place || !budget || !people) {
            toast("Please check if you have filled every field with valid data");
            return;
        }

        if (!user) {
            setDailogue(true);
            return;
        }

        const final_prompt = `
                                Generate a Travel Plan for the following:

                                - Location: ${place}
                                - Duration: ${days} day(s)
                                - Number of people: ${people}
                                - Budget: ₹${budget} INR

                                Return a JSON object with the following two fields:

                                1. hotelOptions (an array of 3 to 6 hotels):
                                - hotelName
                                - hotelAddress
                                - price (number)
                                - hotelImageURL
                                - geoCoordinates: { latitude, longitude }
                                - rating (out of 5)
                                - description

                                2. itinerary (an object with keys like "day1", "day2", etc.):
                                Each day should include:
                                - theme (optional)
                                - activities (minimum of 3 per day): an array of places to visit with the following for each:
                                    - placeName
                                    - placeDetails
                                    - placeImageURL
                                    - geoCoordinates: { latitude, longitude }
                                    - ticketPricing (number)
                                    - timeToTravel
                                    - bestTimeToVisit

                                Please return only a valid JSON object with no extra text.
                                `;

        try {

            setloading(true)
            const rawResponse = await Genai(final_prompt);
            console.log("Raw Response:", rawResponse);

            let tripData;

            try {
                tripData = JSON.parse(rawResponse);
            } catch (err) {
                console.error("Failed to parse JSON:", err);
                toast("Could not parse AI response. Try again.");
                return;
            }

            // ✅ Make sure tripData is valid before writing
            if (!tripData || typeof tripData !== "object") {
                toast("Trip data is empty or invalid.");
                return;
            }

            // console.log(tripData,user.email,new Date())
            const cleanedTripData = removeUndefined(tripData);
            const userdet = JSON.parse(localStorage.getItem('user'))
            const docID = Date.now().toString()

            await setDoc(doc(db, "AITrip", docID), {
                userSelection: { 'location': place, 'Days': days, 'Budget': budget, 'People': people },
                userdetails: userdet.email,
                createdAt: new Date(),
                tripData: cleanedTripData,
                docid: docID,
            });
            toast("Trip successfully saved!");
            navi('/view-trip/' + docID)
        } catch (err) {
            console.error("Error generating or saving trip:", err);
            toast("Failed to generate/save trip.");
        }
        setloading(false)





    };



    // const savetrip = async (trip) => {
    //     const user = JSON.parse(localStorage.getItem('user'))
    //     const docid = Date.now().toString()
    //     setloading(true)
    //     await setDoc(doc(db, 'AITrip', docid), {
    //         userSelection: { 'Location': place, 'No.of Days': days, 'No.of People': people, 'Budget': budget },
    //         tripData: trip,
    //         useremail: user.email,
    //         id: docid


    //     });
    //     setloading(false)

    // }




    const login = useGoogleLogin({
        onSuccess: (codeResp) => { getuser(codeResp) },
        onError: (error) => { console.log(error) }
    })

    const getuser = (tokeninfo) => {
        axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?acess_token=${tokeninfo.access_token}`, {
            headers: {
                Authorization: `Bearer ${tokeninfo.access_token}`,
                Accept: 'Application/json'

            }
        }).then((resp) => {
            console.log(resp)
            localStorage.setItem('user', JSON.stringify(resp.data))
            setDailogue(false)
            GenerateTrip
        })
    }

    return (


        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-24 py-10">

            
            <h2 className="font-extrabold text-4xl text-center leading-snug">
                <span className="text-[#FF7A1A] block">
                    What are your travel preferences?
                </span>
                <span className="text-[24px] sm:text-[30px] text-[#4B2E83] block mt-3 font-medium">
                    Just fill out some basic info and let us plan your trip in no time.
                </span>
            </h2>

            <div className="mt-12 space-y-10">
                {/* Destination */}
                <div>
                    <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">What is your destination of choice?</h3>
                    <GooglePlacesAutocomplete
                        apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                        selectProps={{
                            place,
                            onChange: (v) => {
                                setPlace(v.label)
                                handleinput('location', v)
                                console.log(v)
                            },
                            styles: {
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#FF7A1A',
                                    boxShadow: 'none',
                                    '&:hover': { borderColor: '#FF7A1A' },
                                }),
                            },
                        }}
                    />
                </div>

                {/* Duration */}
                <div>
                    <h3 className="text-lg font-semibold text-[#4B2E83] mb-2">How many days do you want to go?</h3>
                    <Input placeholder="Ex: 3" type="number" className="w-full border border-[#FF7A1A] focus:ring-[#FF7A1A]" onChange={(event) => {
                        setDays(event.target.value),
                            handleinput('noOfDays', days)
                    }} />
                </div>

                {/* Preferences */}
                <div className="max-w-3xl mx-auto mt-10 px-4 space-y-12">
                    {/* Budget Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-[#FF7A1A] mb-2">What is Your Budget?</h2>
                        <p className="text-gray-600 mb-4">
                            The budget is exclusively allocated for activities and dining purposes.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                className={`px-6 py-4 rounded-lg border text-center transition-all duration-200 ${budget === 10000
                                        ? "bg-orange-100 dark:bg-orange-300 text-black"
                                        : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-orange-100 dark:hover:bg-orange-300"
                                    } border-gray-300 dark:border-gray-600 shadow`}
                                onClick={() => {
                                    setBudget(10000);
                                    handleinput('Budget', 10000);
                                }}
                            >
                                <p className="font-semibold">Low</p>
                                <p className="text-sm">1–10,000 INR</p>
                            </button>

                            <button
                                className={`px-6 py-4 rounded-lg border text-center transition-all duration-200 ${budget === 20000
                                        ? "bg-orange-100 dark:bg-orange-300 text-black"
                                        : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-orange-100 dark:hover:bg-orange-300"
                                    } border-gray-300 dark:border-gray-600 shadow`}
                                onClick={() => {
                                    setBudget(20000);
                                    handleinput('Budget', 20000);
                                }}
                            >
                                <p className="font-semibold">Medium</p>
                                <p className="text-sm">10,000–20,000 INR</p>
                            </button>

                            <button
                                className={`px-6 py-4 rounded-lg border text-center transition-all duration-200 ${budget === 30000
                                        ? "bg-orange-100 dark:bg-orange-300 text-black"
                                        : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-orange-100 dark:hover:bg-orange-300"
                                    } border-gray-300 dark:border-gray-600 shadow`}
                                onClick={() => {
                                    setBudget(30000);
                                    handleinput('Budget', 30000);
                                }}
                            >
                                <p className="font-semibold">High</p>
                                <p className="text-sm">20,000+ INR</p>
                            </button>
                        </div>

                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-[#FF7A1A] mb-4">
                            Who are you traveling with?
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className={`bg-[#F9FAFB] hover:bg-orange-100 px-4 py-4 rounded-lg border shadow text-center  ${people === 1 ? "bg-orange-100" : "bg-gray-100 hover:bg-orange-100"}`} onClick={() => {
                                setpeople(1)
                                handleinput('People', people)
                            }}>
                                <p className="text-lg">👤</p>
                                <p className="mt-2 font-medium">Solo</p>
                            </button>
                            <button className={`bg-[#F9FAFB] hover:bg-orange-100 px-4 py-4 rounded-lg border shadow text-center ${people === 2 ? "bg-orange-100" : "bg-gray-100 hover:bg-orange-100"}`} onClick={() => { setpeople(2); handleinput('People', people) }}>
                                <p className="text-lg">💕</p>
                                <p className="mt-2 font-medium">Couple</p>
                            </button>
                            <button className={`bg-[#F9FAFB] hover:bg-orange-100 px-4 py-4 rounded-lg border shadow text-center  ${people === 4 ? "bg-orange-100" : "bg-gray-100 hover:bg-orange-100"}`} onClick={() => { setpeople(4); handleinput('People', people) }}>
                                <p className="text-lg">👨‍👩‍👧</p>
                                <p className="mt-2 font-medium">Family</p>
                            </button>
                            <button className={`bg-[#F9FAFB] hover:bg-orange-100 px-4 py-4 rounded-lg border shadow text-center  ${people === 6 ? "bg-orange-100" : "bg-gray-100 hover:bg-orange-100"}`} onClick={() => { setpeople(6); handleinput('People', people) }}>
                                <p className="text-lg">👥</p>
                                <p className="mt-2 font-medium">Friends</p>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            <div className='mt-6 text-center'>
            <Button onClick={GenerateTrip}>
                {
                    loading ? <span className='flex gap-2'> <RiAlbumLine  /> Loading Please Wait</span>  : 'Generate Trip'
                }
                </Button>
            <Dialog open={dialogue} >
                <DialogContent>
                    <DialogHeader>
                        <DialogDescription>
                            <div className='display flex'>
                                <img src="logo1.svg" />
                                <h1 className="flex font-bold text-4xl">
                                    <span style={{ color: '#FF7A1A' }}>AI</span>
                                    <span style={{ color: '#4B2E83' }}>-</span>
                                    <span style={{ color: '#8F73D1' }}>Trip</span>
                                </h1>
                            </div>
                            <h2 className='font-bold text-2xl'>Sign In with Google</h2>
                            <p className='font-light text-lg mt-2'>Use Google OAuthentication for Secure Sign-In</p>

                            <Button className='w-full mt-5'
                                onClick={login}
                            >
                                <FcGoogle />
                                Sign-In with Google</Button>

                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            </div>

        </div>
    );
}

export default CreateTrip;

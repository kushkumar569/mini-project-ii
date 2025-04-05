import Header from "../Header";
import { useState, useEffect } from "react";
import showToast from "./alert";
import Logout from "../Login/Logout";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { roll } from "../atoms/attendence";

function Student() {
    const [email, setEmail] = useState(null);
    const [view, setView] = useState(false);
    const [live, setLive] = useState(false);
    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [time, setTime] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        setDataFetched(false); // Reset before fetching
        const fetchData = async () => {
            try {
                // Fetch user data
                const token = localStorage.getItem("token");
                const userResponse = await fetch(`https://mini-project-ii-ypu6.onrender.com/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!userResponse.ok) throw new Error("Failed to fetch user");
                const userData = await userResponse.json();
                if (userData.user) {
                    console.log(userData.user.email, "heloooo");
                    setEmail(userData.user.email);
                }

                // Fetch status data
                const statusResponse = await fetch(`https://mini-project-ii-ypu6.onrender.com/get/status`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: "67e71052258dbe80e2a60119" }),
                });

                if (!statusResponse.ok) {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.error || "Failed to fetch status");
                }

                const statusInfo = await statusResponse.json();
                setLive(statusInfo.data.isLive);
                setLat(statusInfo.data.TeacherLatitude);
                setLon(statusInfo.data.TeacherLongitude);
                setTime(statusInfo.data.time);

                console.log(statusInfo.data.isLive, statusInfo.data.TeacherLatitude, statusInfo.data.TeacherLongitude, statusInfo.data.time);

                const response = await fetch(`https://mini-project-ii-ypu6.onrender.com/get/class`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: "67e71048258dbe80e2a60117" }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch class data");
                }

                const classInfo = await response.json();
                setClasses({
                    courseCode: classInfo.data.courseCode,
                    courseName: classInfo.data.courseName,
                    semester: classInfo.data.semester,
                    department: classInfo.data.department,
                    section: classInfo.data.section,
                    day: classInfo.data.day,
                    date: classInfo.data.date,
                    time: classInfo.data.time
                })
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setDataFetched(true); // Ensure this runs even if there's an error
            }
        }
        fetchData();
    }, []);

    return (
        <>
            <Header />

            {/* Show a loading message until data is fetched */}
            {!dataFetched ? (
                <p>Loading...</p>
            ) : (
                <>
                    {live ? <Timer time={time} live={live} email={email} classes={classes} /> : null}

                        {view ? <View /> : <Main latTeacher={lat} lonTeacher={lon} live={live} email={email} classes={classes} setView={setView} />}

                    <Logout />
                </>
            )}
        </>
    );
}


function Timer({ time, live, email, classes }) {
    const navigate = useNavigate();
    const [difference, setDifference] = useState(0);
    const [timee, setTimee] = useState(120); // Default 5 min countdown
    const rol = useRecoilValue(roll);
    // console.log(roll);

    // Calculate absolute time difference
    useEffect(() => {
        if (!time) return;

        function getAbsoluteTimeDifferenceInSeconds(t1, t2) {
            const [h1, m1, s1] = t1.split(":").map(Number);
            const [h2, m2, s2] = t2.split(":").map(Number);

            const totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
            const totalSeconds2 = h2 * 3600 + m2 * 60 + s2;

            return Math.abs(totalSeconds1 - totalSeconds2); // Absolute difference in seconds
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const diff = getAbsoluteTimeDifferenceInSeconds(currentTime, time);
        setDifference(diff);
        setTimee(120 - diff); // Start with (5 min - difference)
    }, [time]);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function setAttendence() {
        try {
            const response = await fetch(`https://mini-project-ii-ypu6.onrender.com/setData/setStudentAttendence`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseCode: classes.courseCode,
                    courseName: classes.courseName,
                    semester: classes.semester,
                    department: classes.department,
                    section: classes.section,
                    Day: classes.day,
                    Date: classes.date,
                    Time: classes.time,
                    roll: rol
                })
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log("Updated Time:", data);
                navigate("/view")
            } else {
                const errorText = await response.text();
                console.error("Error Response:", errorText);
                navigate("/view")
                throw new Error(`Failed to update Time: ${errorText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
    // Countdown timer
    useEffect(() => {
        let timer;
        if (timee > 0) {
            timer = setInterval(() => {
                setTimee(prevTime => {
                    if (prevTime <= 1) {
                        new Promise(resolve => setTimeout(resolve, 2000));
                        clearInterval(timer);
                        (async () => {
                            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for 2 seconds
                            showToast("Time Over");
                            await setAttendence();
                        })();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timee]); // Restart effect if `timee` updates

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return (
        <div className="text-lg font-bold text-gray-800">
            Time Remaining: {formatTime(timee)} {live}
        </div>
    );
}


function Main({ latTeacher, lonTeacher, live, email, classes, setView }) {
    const [numbers, setNumbers] = useState([]);

    const [mark, setMark] = useState(false);
    const [underRange, setUnderRange] = useState(false);
    const [isFind, setIsFind] = useState(false);
    const [message, setMessage] = useState("");
    const [dataFetched, setDataFetched] = useState(false);
    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [distance, setDistance] = useState(null);
    console.log(mark);

    useEffect(() => {
        setDataFetched(false);
        async function location() {

            async function getLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(await showPosition, await showError);
                } else {
                    setIsFind(false);
                    setMark(false);
                }
            }

            async function showPosition(position) {
                const latNow = position.coords.latitude;
                const lonNow = position.coords.longitude;
            
                setLat(latNow);
                setLon(lonNow);
                setIsFind(true);
            
                const dis = await vincenty(latTeacher, lonTeacher, latNow, lonNow);
                setDistance(dis);
            
                if (dis <= 10) {
                    setUnderRange(true);
                    setMessage("Inside Range - Present");
                } else {
                    setUnderRange(false);
                    setMessage("Out of Range");
                    setMark(false);
                }
            }
            

            function showError(error) {
                setIsFind(false);
                setMark(false);
                setMessage("Failed to fetch location, Turn On GPS and Try Again.");
            }

            await getLocation();
            setDataFetched(true);
        }

        location();
    }, []);

    async function vincenty(lat1, lon1, lat2, lon2) {
        const a = 6378137; // semi-major axis (meters)
        const f = 1 / 298.257223563; // flattening
        const b = (1 - f) * a;

        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const L = ((lon2 - lon1) * Math.PI) / 180;

        const tanU1 = (1 - f) * Math.tan(φ1);
        const tanU2 = (1 - f) * Math.tan(φ2);

        const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
        const sinU1 = tanU1 * cosU1;
        const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
        const sinU2 = tanU2 * cosU2;

        let λ = L;
        let sinσ, cosσ, σ, sinα, cos2α, cos2σm, C, sinλ, cosλ;
        let prevλ, iterLimit = 1000;

        do {
            prevλ = λ;
            sinλ = Math.sin(λ);
            cosλ = Math.cos(λ);
            sinσ = Math.sqrt(
                (cosU2 * sinλ) * (cosU2 * sinλ) +
                (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) *
                (cosU1 * sinU2 - sinU1 * cosU2 * cosλ)
            );

            if (sinσ === 0) return 0; // Identical points

            cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
            σ = Math.atan2(sinσ, cosσ);
            sinα = (cosU1 * cosU2 * sinλ) / sinσ;
            cos2α = 1 - sinα * sinα;

            if (cos2α !== 0) {
                cos2σm = cosσ - (2 * sinU1 * sinU2) / cos2α;
            } else {
                cos2σm = 0; // Avoid NaN
            }

            C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
            λ =
                L +
                (1 - C) *
                f *
                sinα *
                (σ +
                    C *
                    sinσ *
                    (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm)));

        } while (Math.abs(λ - prevλ) > 1e-12 && --iterLimit > 0);

        if (iterLimit === 0) return NaN; // No convergence

        const u2 = (cos2α * (a * a - b * b)) / (b * b);
        const A =
            1 +
            (u2 / 16384) *
            (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
        const B =
            (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

        const Δσ =
            B *
            sinσ *
            (cos2σm +
                (B / 4) *
                (cosσ * (-1 + 2 * cos2σm * cos2σm) -
                    (B / 6) *
                    cos2σm *
                    (-3 + 4 * sinσ * sinσ) *
                    (-3 + 4 * cos2σm * cos2σm)));

        const d = b * A * (σ - Δσ);
        console.log(d);
        return d;
    }

    return (
        <div className="bg-white flex items-center justify-center p-6">
            <div className="relative w-full max-w-lg bg-gray-200 rounded-2xl shadow-lg flex flex-col p-6 items-center">
                <div className="absolute top-1 left-2 flex items-center space-x-1">
                    <img src="/logo.png" alt="Logo" className="w-14 h-14" />
                    <span className="text-gray-500 text-lg font-semibold">
                        Geo-Fencing Attendance Manager
                    </span>
                </div>
                <div className="mt-8 text-center">

                    {dataFetched ? (
                        underRange && live ? (
                            mark ? <View marks={mark} /> : <Btn setMark={setMark} email={email} classes={classes} setView={setView} lat={lat} lon={lon} distance={distance} />
                        ) : (
                            <Error msg={message} live={live} distance={distance}/>
                        )
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Btn({ setMark, email, classes, setView, lat, lon, distance }) {
    const navigate = useNavigate();
    console.log(lat, lon, distance);
    const setRoll = useSetRecoilState(roll);
    
    async function marks() {
        showToast(`Mark Attendance Successful ${email}`);
        const rol = parseInt(email.substring(6, 8))
        setRoll(rol)
        setMark(true);
        setView(true)
    }

    return (
        <div>
            <div className="font-bold">
                <span className="text-red-600"><b>Your Cordinate:-</b>{lat},{lon} And Distance:- {distance} from Teacher</span><br />
                <span>Course Code: {classes.courseCode}</span><br />
                <span>Course Name: {classes.courseName}</span><br />
                <span>Date: {classes.date}</span><br />
                <span>Section: {classes.section}</span><br />
            </div>
            <button
                className="bg-green-600 hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4 w-full mt-16"
                onClick={marks}
            >
                Mark Attendance
            </button>
        </div>
    );
}


function Error({ msg, live,distance}) {
    const navigate = useNavigate();
    function view() {
        navigate("/view")
    }
    return (
        <span className="text-red-600 font-semibold">
            {msg=="Out of Range" && live ? ` Distance from Teacher:- ${distance}` : null}<br/>
            {live ? msg : "No Classes"}<br />
            <button className="bg-green-600 hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4 w-full mt-16" onClick={view}>
                View Attendences
            </button>
        </span>
    );
}

function View({ marks }) {
    console.log(marks);
    function view() {
        showToast("Wait For Class Over")
    }
    return (
        <>
            {marks && <Success />}
            <button className="bg-green-600 hover:bg-orange-400 active:bg-orange-400 text-white py-2 px-6 rounded-md font-semibold mb-4 w-full mt-16" onClick={view}>
                View Attendece
            </button>
        </>
    );
}

function Success() {
    return (
        <span className="text-red-600 font-semibold">
            Thank You, Your Attendance is Marked ✅.
        </span>
    )
}

export default Student;

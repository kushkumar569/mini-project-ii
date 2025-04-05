import { useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { time as timeAtom, live } from "../atoms/attendence";

function Time() {
    const [time, setTime] = useRecoilState(timeAtom);
    const setLive = useSetRecoilState(live);

    useEffect(() => {
        if (time > 0) {
            const timer = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setLive(false); // Stop live attendance
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [time, setTime, setLive]);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return (
        <>
            {time > 0 && (
                <div className="text-lg font-bold text-gray-800">
                    Time Remaining: {formatTime(time)}
                </div>
            )}
        </>
    );
}

export default Time;

require("dotenv").config();
const express = require("express");
const { Router } = require("express");
const Class = Router();
const { subject } = require("../DataBase/subject.cjs");
const { course, schedule } = require("../DataBase/TImeTable.cjs");

const app = express();
app.use(express.json());

Class.post("/data", async (req, res) => {
    function getCurrentDateTime() {
        const now = new Date();
    
        const formatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    
        const parts = formatter.formatToParts(now);
        
        let day = '', date = '', month = '', year = '', hours = '', minutes = '', seconds = '';
        parts.forEach(part => {
            if (part.type === 'weekday') day = part.value;
            if (part.type === 'day') date = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'year') year = part.value;
            if (part.type === 'hour') hours = part.value;
            if (part.type === 'minute') minutes = part.value;
            if (part.type === 'second') seconds = part.value;
        });
    
        const formattedDate = `${date}/${month}/${year}`;
        const times = `${hours}:${minutes}:${seconds}`;
    
        return { day, time: hours, formattedDate, times };
    }
    


    const { day, time, formattedDate,times} = getCurrentDateTime(); //  Fixed variable names
    const { email } = req.body;
    console.log(time,"htyyyy");
    
    try {
        const users = await subject.find({ email }); // Get user subjects
        // console.log(users,"gfsdafsgsd");

        let matchedClasses = [];

        for (const user of users) {
            const matchedSchedule = await schedule.findOne({
                courseCode: user.courseCode,
            });

            if (matchedSchedule) {
                console.log(matchedSchedule)
                // Find the index where the day matches
                const index = matchedSchedule.day.findIndex((d) => d === day);
                console.log(index);
                console.log(matchedSchedule.time[index]);
                console.log(time,"times");
                console.log(matchedSchedule.time[index].startsWith(time));
                                
                
                if (index !== -1 && matchedSchedule.time[index].startsWith(time)) {
                    matchedClasses.push({
                        ...user.toObject(),
                        section: matchedSchedule.section,
                        day:day,
                        Date: formattedDate,
                        time: times
                    });
                }
            }
        }

        console.log(matchedClasses);
        res.status(200).json({ matchedClasses:matchedClasses });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

Class.post("/extra", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await subject.find({ email }); // Await the database query

        if (user.length > 0) {
            res.status(200).json({ Classes: user });
        } else {
            res.status(404).json({ error: "No classes found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {
    Class: Class
};

require("dotenv").config();
const express = require("express");
const { Router } = require("express");
const Get = Router();
const { ClassDetail, Live,Location} = require("../DataBase/ClassDetail.cjs")
const { detail, Attendence } = require("../DataBase/Attendence.cjs")
const { subject } = require("../DataBase/subject.cjs")
const {schedule} = require("../DataBase/TImeTable.cjs")
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

Get.post("/status", async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "ID is required" }); // 400 for bad request
        }

        const status = await Live.findOne({ _id: id });

        if (!status) {
            return res.status(404).json({ error: "Status not found" }); // 404 for not found
        }

        // console.log(status);

        return res.status(200).json({ message: "Successfully fetched", data: status });

    } catch (error) {
        console.error("Error fetching status:", error); // Log the actual error for debugging
        return res.status(500).json({ error: "Internal server error" });
    }
});

Get.post("/class", async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "ID is required" }); // 400 for bad request
        }

        const classes = await ClassDetail.findOne({ _id: id });

        if (!classes) {
            return res.status(404).json({ error: "Status not found" }); // 404 for not found
        }

        return res.status(200).json({ message: "Successfully fetched", data: classes });

    } catch (error) {
        console.error("Error fetching status:", error); // Log the actual error for debugging
        return res.status(500).json({ error: "Internal server error" });
    }
})

Get.get("/AllClassDetail", async (req, res) => {

    try {
        const data = await detail.find({});
        res.json(data);
    } catch {
        res.status(500).json({ error: error.message });
    }
})

Get.post("/GetAttendence", async (req, res) => {
    console.log("hello");

    try {
        const { id } = req.body;
        console.log(id);

        const findAttendence = await Attendence.find({ ids: id })
        console.log(findAttendence);

        res.status(200).json(findAttendence);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

Get.post("/TodayAttendence", async (req, res) => {
    console.log("hyyyy");
    const { courseCode, Date, Time, Day } = req.body;
    console.log(courseCode, Date, Time, Day);

    try {
        const findIds = await detail.findOne({ courseCode: courseCode });
        if (!findIds) {
            return res.status(404).json({ message: "CourseCode Not found" })
        }
        console.log(findIds);
        const Ids = findIds._id;
        console.log(Ids);
        const att = await Attendence.findOne({
            ids: Ids,
            Date: Date,
            Time: Time,
            Day: Day
        })
        if (!att) {
            return res.status(404).json({ message: "Attendence Not found" })
        }
        console.log(att);
        return res.status(200).json(att.atted);
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }

})

Get.post("/TodaySchedule", async (req, res) => {
    const { email } = req.body;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const dayName = days[today.getDay()];

    try {
        const classes = await subject.find({ email: email });
        if (!classes || classes.length === 0) {
            return res.status(404).json({ message: "No Classes Found" });
        }

        const schedules = await schedule.find(); // Assuming `schedule` is your schedule model
        const todayClasses = [];

        classes.forEach(cls => {
            const matchedSchedule = schedules.find(
                sched => sched.courseCode === cls.courseCode && sched.day.includes(dayName)
            );

            if (matchedSchedule) {
                const dayIndex = matchedSchedule.day.indexOf(dayName);
                const classTime = matchedSchedule.time[dayIndex];

                todayClasses.push({
                    ...cls._doc, // Include all class details
                    time: classTime,
                    section: matchedSchedule.section
                });
            }
        });

        return res.status(200).json(todayClasses);
    } catch (error) {
        console.error("Error in /TodaySchedule:", error);
        return res.status(500).json({ error: error.message });
    }
});

Get.post("/getVanue", async (req,res) =>{
    console.log("from venue....");
    
    const {vanue} = req.body;
    try{
        const result = await Location.findOne({vanue:vanue})
        if(!result){
            return res.status(404).json({message: "Vanue Not Matched"})
        }
        console.log(result);
        
        return res.status(200).json(result);
    }catch(err){
        return res.status(500).json({error: error.message})
    }
})


module.exports = {
    Get: Get
};
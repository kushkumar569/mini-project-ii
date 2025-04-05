require("dotenv").config();
const express = require("express");
const { Router } = require("express");
const SetData = Router();
const { ClassDetail, Live } = require("../DataBase/ClassDetail.cjs")
const { Attendence, detail } = require("../DataBase/Attendence.cjs")

const app = express();
app.use(express.json());

SetData.put("/set", async (req, res) => {

    try {
        const { _id, courseCode, courseName, semester, department, section, day, date, time } = req.body;
        if (!_id) {
            return res.status(400).json({ message: "Does not match data" });
        }
        // console.log(_id); 
        const setClass = await ClassDetail.findOneAndUpdate(
            { _id },
            { courseCode, courseName, semester, department, section, day, date, time },
            { new: true }
        )

        if (!setClass) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User updated successfully", setClass });
    } catch (error) {
        res.status(500).json({ message: "Error while updating class Deatils in database", error })
    }
})

SetData.put("/setTime", async (req, res) => {

    try {
        const { _id, TeacherLatitude, TeacherLongitude, isLive, time } = req.body;
        if (!_id) {
            return res.status(400).json({ message: "Does not match data" });
        }
        // console.log(_id); 
        // console.log(typeof TeacherLatitude,typeof TeacherLongitude,typeof time,typeof isLive);

        const setTime = await Live.findOneAndUpdate(
            { _id },
            { TeacherLatitude, TeacherLongitude, isLive, time },
            { new: true }
        )
        // console.log(setTime,"sdghfsdgf");

        if (!setTime) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User updated successfully", setTime });
    } catch (error) {
        res.status(500).json({ message: "Error while updating Time Deatils in database", error })
    }
})

SetData.put("/setAttendence", async (req, res) => {
    const { courseCode, courseName, section, Date, department, semester, Day, Time, atted } = req.body;
    // console.log(courseCode, courseName, section, Date, department, semester, Day, Time, atted);
    try {
        // const { courseCode, courseName, section, Date, department, semester, Day, Time, atted } = req.body;

        // console.log(courseCode, courseName, section, Date, department, semester, Day, Time, atted);

        let Details;
        try {
            // Try inserting into Detail (skips if duplicate)
            Details = await detail.create({ semester, department, section, courseCode, courseName });
        } catch (error) {
            if (error.code === 11000) {
                // console.log("Duplicate entry: This record already exists!");

                // If duplicate, fetch existing document
                Details = await detail.findOne({ semester, department, section, courseCode, courseName });
                // console.log("findedddd");
                
            } else {
                return res.status(500).json({ message: "Error inserting into Detail", error });
            }
        }

        if (!Details) {
            return res.status(404).json({ message: "Detail entry not found" });
        }

        // Fetch _id of Detail (whether new or existing)
        const ids = Details._id;

        // console.log(typeof atted,typeof ids);
        
        // Insert into Attendence using detailId
        const setAttendance = await Attendence.create({
            ids,Date, Day, Time, atted,
        });

        // console.log("doneeeeeee");
        

        return res.status(200).json({ message: "Attendance recorded successfully", setAttendance });

    } catch (error) {
        return res.status(500).json({ message: "Error while processing attendance", error });
    }
});

SetData.put("/setStudentAttendence", async (req, res) => {
    const { courseCode, courseName, section, Date, department, semester, Day, Time, roll } = req.body;
    console.log(courseCode, courseName, section, Date, department, semester, Day, Time, roll);
    try {
        // console.log(courseCode, courseName, section, Date, department, semester, Day, Time, atted);
        if(roll==null){
            return res.status(404).json({messgae: "Student Not Found"})
        }
        let Details;
            // Try inserting into Detail (skips if duplicate)
            Details = await detail.findOne({ semester, department, section, courseCode, courseName });
            if(!Details){
                return res.status(404).json({messgae: "Classes Not Found"})
            }

            const ids = Details._id;
            console.log(ids,Date,Time,Day);
            
            const setAttend = await Attendence.findOneAndUpdate(
                { ids,Date,Day,Time },
                { $push: {atted:roll} },
                { new: true }
            )

            if(!setAttend){
                return res.status(404).json({messgae: "Not put Attendenec in database"})
            }
            return res.status(200).json({message: "Put Attendence Successfull"})

        } catch (error) {
            return res.status(500).json({error})
        }
});


module.exports = {
    SetData: SetData
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const ClassDetail = new Schema({
    courseCode: String,
    courseName:String,
    semester: String,
    department: String,
    section: String,
    day: String,
    date: String,
    time: String,
    Attend: []
})

const Live = new Schema({
    TeacherLatitude: Number,
    TeacherLongitude: Number,
    isLive: Boolean,
    time: String
})

const Location = new Schema({
    vanue: {type: String, required: true, unique: true},
    latitude: Number,
    longitude: Number,
})

const ClassModel = mongoose.model('ClassDetail',ClassDetail);
const LiveModel = mongoose.model('IsLIve',Live);
const LocationModel = mongoose.model('Location',Location);

module.exports = {
    Location: LocationModel,
    ClassDetail: ClassModel,
    Live: LiveModel
};
const mongoose = require('mongoose');
const { course } = require('./TImeTable.cjs');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const subject = new Schema({
    email: {type: String},
    courseCode: String,
    couseName: String,
    semester: { type: String, required: true },
    department: { type: String, required: true },
})

const subjectModel = mongoose.model('subject',subject);
module.exports = {
    subject: subjectModel
}
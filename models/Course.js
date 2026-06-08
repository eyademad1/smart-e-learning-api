const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    }, 
    description : String,
    price : {
        type : Number,
        default : 0
    },
    category : String,
    thumbnail: String,
    lessons: [
        {
            title: String,
            content: String,
            videoUrl: String
        }
    ],
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
    },
},
{timestamps : true}
);

module.exports = mongoose.model('Course', courseSchema);
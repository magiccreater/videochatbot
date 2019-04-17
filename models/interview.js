var mongoose = require('mongoose');

// Interview Schema
var InterviewSchema = mongoose.Schema({
   
    emailid: {
        type: String,
        required: true
    },
    skypeid: {
        type: String
    },
    cellnumber: {
        type: Number,
        required: true
    },
    weblink: {
        type: String,
        required: true
    },
    skypelink: {
        type: String,
        required: false
    },
    status:{
        type: String,
        required: true
        
    }
    
});

var Interview = module.exports = mongoose.model('Interview', InterviewSchema);


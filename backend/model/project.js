const mongoose = require('mongoose')
const ProjectSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startDate:{
        type:String,
    },
    
    endDate:{
        type:String,
    },
    dueDate: {  
        type: Date,
        required: false 
    },
    assignedTeam: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencing the User model (make sure User model exists)
    }],

    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }

});


module.exports = mongoose.model('Project', ProjectSchema);
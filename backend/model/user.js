const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

// UserSchema.pre('save', async function (next) {
//     if (this.role === 'admin') {
//         const existingAdmin = await mongoose.model('User').findOne({ role: 'admin' });

//         if (existingAdmin) {
//             const error = new Error('Admin already exists. Only one admin can be created.');
//             return next(error);
//         }
//     }
//     next();
// });
 
const User = mongoose.model('User', UserSchema);

module.exports = User;
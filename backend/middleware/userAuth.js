
const jwt = require('jsonwebtoken');

const User = require('../model/user'); 

const checkAdminLimit = async (req, res, next) => {
    try {
        if (req.body.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });

            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin already exists. Only one admin can be created.' });
            }
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// const Authentication = async(req,res,next)=>{
//     try{    
//         // console.log(req.cookies)
//         const token = req.cookies.token
//             // console.log(token)
//         if(!token){
//             return res.status(401).json({error:"Please login first"})
//         }
//         const decoded = jwt.verify(token,'mysecretkey');
//         next()
//     }

//     catch(error){
//         console.log(error);
//         }
// }



const Authentication = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Support Authorization Header

        if (!token) {
            return res.status(401).json({ error: "Please login first" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');

        // ✅ Fetch the user from DB
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found. Please login again." });
        }

        req.user = user; // Store user info in request object
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ error: "Invalid token. Please login again." });
    }
};


const checkAdminRole = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, 'mysecretkey'); // Use env variable
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Check if the **logged-in user** is an admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admin can perform this action" });
        }

        // ✅ Admin verified, proceed to next middleware or route
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports ={ Authentication ,checkAdminLimit,checkAdminRole };
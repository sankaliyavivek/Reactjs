// const express = require("express");
// const router = express.Router();
// const User = require("../model/user"); // Your User model
// const { adminAuthentication } = require("../middleware/userAuth");
// // const { authenticateToken } = require("../middleware/authMiddleware");

// router.get('/admin',adminAuthentication ,async (req, res) => {
    
//     try {
//         if (req.body.role === "admin") {
//             // Admin sees all users
//             const users = await User.find({});
//             res.json(users);
//         } else {
//             // Non-admin users can only see their own profile
//             const user = await User.findById(req.user.id);
//             res.json(user);
//         }
//     } catch (error) {
//         console.error(error);
//     }
// })

// module.exports = router;
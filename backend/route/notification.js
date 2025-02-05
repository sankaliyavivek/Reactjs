const express = require('express');
const Notification = require('../model/notification');
const router = express.Router();

// Get all notifications
router.get('/get', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }); 
        // console.log(notifications)
        res.json({ message: 'Notifications fetched successfully', data: notifications });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
     const notification =   await Notification.findByIdAndDelete(req.params.id);
    //  console.log(notification)
        res.json({ success: true, message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting notification' });
    }
    });

module.exports = router;

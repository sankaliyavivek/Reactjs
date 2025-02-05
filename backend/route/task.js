const express =require('express');
const TaskSchema = require('../model/task');
const router = express.Router();
const Notification  = require('../model/notification');
const {Authentication} = require('../middleware/userAuth');
const { getIO } = require('../socket');
const {updateTaskStatistics} = require('../utils/taskStatistics');


router.post('/taskcreate', Authentication,async(req,res)=>{
    const {title,description,status,priority,assigneeId }=req.body;
    console.log(req.body)
 try {
    const task = new TaskSchema({
        title:title,
        description:description,
        status:status,
        priority:priority,
        assigneeId:assigneeId
      
    })
    
    await task.save();

    res.json({message: "Task created successfully"});
 } catch (error) {
        console.error(error);
 }
});

// niche ni link  data show karva mate get method
router.get('/showtask',async(req,res)=>{
     const TaskData = await TaskSchema.find();
     res.json({message:"deta fetch successfully",data:TaskData});
})
 // Import socket instance

router.put('/taskupdate', async (req, res) => {
    try {
        const { id, title, description, status, priority } = req.body;

        const task = await TaskSchema.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;

        await task.save();

        const notification = new Notification({
            message: `Task "${task.title}" has been updated.`,
            type: 'task',
            taskId: task._id
        });
        await notification.save();

        // Emit notification to frontend
        const io = getIO();
        io.emit('taskUpdated', notification);

        await updateTaskStatistics();

        //   // Calculate updated statistics
        //   const tasks = await TaskSchema.find();
        
        //   // Count the tasks in each status
        //   const backlogTasks = tasks.filter(task => task.status === 'Backlog').length;
        //   const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
        //   const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  
        //   const taskCompletionRate = (completedTasks / tasks.length) * 100;
  
        //   const statusCounts = {
        //       Backlog: backlogTasks,
        //       'In Progress': inProgressTasks,
        //       Completed: completedTasks
        //   };
  
        //   const productivity = tasks.reduce((acc, task) => {
        //       if (task.assigneeId) {
        //           acc[task.assigneeId] = (acc[task.assigneeId] || 0) + 1;
        //       }
        //       return acc;
        //   }, {});
  
        //   // Emit updated statistics to all clients
        //   io.emit('updateStatistics', {
        //       taskCompletionRate: taskCompletionRate.toFixed(2),
        //       statusDistribution: statusCounts,
        //       teamProductivity: productivity,
        //   });
  
  


        res.json({ message: "Task updated successfully", task });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/taskedit/:id',async(req,res)=>{
        const {id} = req.params;
        const TaskData = await TaskSchema.findById(id);
        res.json({message:"data fetch successfully",data:TaskData});
})

router.delete('/taskdelete/:id',async(req,res)=>{
        try {
            const {id} = req.params;
            const deleted = await TaskSchema.findByIdAndDelete(id);
            res.json({message:"task deleted successfully"});
        } catch (error) {
            console.error(error);
            
        }
})

router.put('/assignTask', Authentication, async (req, res) => {
    const { taskId, userId } = req.body;

    try {
        const task = await TaskSchema.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.assigneeId = userId;
        await task.save();

        res.json({ message: `Task assigned to user ${userId} successfully`, task });
    } catch (error) {
        console.error("Error assigning task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// router.get('/showusertask', async (req, res) => {
//     try {
//         const TaskData = await TaskSchema.find().populate('assigneeId', 'name email'); // Fetch user details
//         res.json({ message: "Data fetched successfully", data: TaskData });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

router.get('/showusertask', async (req, res) => {
    try {
        const TaskData = await TaskSchema.find().populate('assigneeId', 'username email'); // Fetch user details
        res.json({ message: "Data fetched successfully", data: TaskData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports =router;
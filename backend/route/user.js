    const express = require('express');
    const router = express.Router();
    const User = require('../model/user');
    const  Project = require('../model/project');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const { checkAdminLimit, Authentication, checkAdminRole } = require('../middleware/userAuth')

    // niche aapel router ma ragister create karva ma jo admin  pela thi banelo hoy to checkAdminLimit check kari ne 
    // and response apse and bijo admin create thse nai and authentication no user karse
    router.post('/register', checkAdminLimit, async (req, res) => {
        const { name, password, email, phone,role } = req.body;
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: 'Email already exist' });
        };
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = User.create({ name, password: hashedPassword, email, phone,role });
        res.json({ message: 'User created successfully', user })
    });

    router.post('/login', async (req, res) => {
        try {
            const { password, email } = req.body;
            // console.log(req.body);
            if (!email || !password) {
                return res.status(400).json({ message: 'Please enter both email and password' });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Email not found' });
            };
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                res.status(400).json({ message: 'Invalid password' });
            }

            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                'mysecretkey', // Use environment variable
                { expiresIn: '24h' } // Token expiration time
            )
            res.cookie("token", token, {
                httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Ensures cookie is sent only over HTTPS in production
                sameSite: 'strict', // Protects against CSRF attacks
                maxAge: 24 * 60 * 60 * 1000 // Sets cookie expiration (1 day in milliseconds)
            });

            res.json({ message: 'User login successfully', token, user: user.name, role: user.role })

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.post('/logout', (req, res) => {
        try {
            res.cookie("token", "", {
                httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === true,// Use HTTPS for secure cookies
                sameSite: 'strict', // Protects against CSRF attacks
                maxAge: 0, // Expire the cookie immediately
                path: '/' // Ensure the path is the same as when it was set
            });
            res.json({ message: 'User logout successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.get('/users', Authentication, async (req, res) => {
        try {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, 'mysecretkey'); // Use env variable

            if (!decoded) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // const role = localStorage.setItem('admin')
            if (user.role === 'admin') {
                // Admin sees all users
                const users = await User.find({ role: { $ne: 'admin' } }, { password: 0 }); // Exclude password field
                return res.json(users);
            } else {
                // Regular user sees only their own data
                return res.json({ name: user.name, email: user.email, phone: user.phone, role: user.role });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    router.delete('/deleteuser/:id',Authentication,checkAdminRole,async(req,res)=>{
            try {
                // const userId=req.params.id;
                const{ id } =req.params;
            const deleteUser =  await User.findByIdAndDelete(id);
            console.log(deleteUser);
                res.json({ message: 'User deleted successfully' });
                //  console.log(message)
                
            } catch (error) {
                    console.error(error);
            }
    });

    // router.put()
    router.put('/edituser/:id', Authentication, checkAdminRole, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone, } = req.body;

            const update = await User.findByIdAndUpdate(id,{
                name,
                email,
                phone
            }, {new:true})
            // Save the updated user
            await update.save();
            res.json({ message: 'User details updated successfully', update });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    router.get('/getuser/:id', Authentication, checkAdminRole, async (req, res) => {
        try {
            const { id } = req.params;
            const showUserData = await User.findById(id);
    
            if (!showUserData) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.json({ message: 'user detail fetch successfully', showUserData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.get('/alluser',async(req,res)=>{
        try {
            const allUser = await User.find();
            res.json({ message: 'all user fetch successfully', allUser });
        } catch (error) {
                console.error(error);
        }
    })

    const { getIO } = require('../socket'); // Import the Socket.IO instance

    const Notification = require('../model/notification'); // Assuming you have this model

    router.put('/assignuser/:projectId', Authentication, checkAdminRole, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { userIds } = req.body;
    
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ message: 'No valid user IDs provided' });
            }
    
            const users = await User.find({ '_id': { $in: userIds } });
            if (users.length !== userIds.length) {
                return res.status(400).json({ message: 'Some user IDs are invalid' });
            }
    
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
    
            project.assignedTeam = [...new Set([...project.assignedTeam, ...userIds])];
            await project.save();
    
            // Save notification in the backend
            const notification = new Notification({
                message: `Users assigned to project "${project.title}"`,
                type:'project',
                projectId: project._id,
                userIds: userIds,
            });
            await notification.save();
    
            // Emit a Socket.IO event for user assignment
            const io = getIO();
            io.emit('userAssigned', {
                projectId,
                userIds,
                projectTitle: project.title,
                message: `Users assigned to project "${project.title}"`,
            });
    
            res.json({ message: 'Users assigned to the project successfully', project });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error assigning users to the project' });
        }
    });  
    
    router.delete('/removeuser/:projectId/:userId', Authentication, checkAdminRole, async (req, res) => {
        try {
            const { projectId, userId } = req.params;
    
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
    
            project.assignedTeam = project.assignedTeam.filter(id => id.toString() !== userId);
            await project.save();
    
            // Save notification in the backend
            const notification = new Notification({
                message: `User removed from project "${project.title}"`,
                type: 'project',
                projectId: project._id,
                userIds: [userId],
            });
            await notification.save();
    
            // Emit a Socket.IO event for user removal
            const io = getIO();
            io.emit('userRemoved', {
                projectId,
                userId,
                projectTitle: project.title,
                message: `User removed from project "${project.title}"`,
            });
    
            res.status(200).json({ message: 'User removed successfully', project });
        } catch (error) {
            console.error('Error removing user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    
    
    module.exports = router;
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Project = require("../model/project"); // Adjust path based on your structure

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sankaliyavivek9797@gmail.com",
    pass: "mslt tmyd fejx wgib", // Use environment variables for sensitive data
  },
});

// Function to check for upcoming deadlines and send email reminders
const sendDeadlineReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find projects with due dates within the next 24 hours
    const projects = await Project.find({
      dueDate: { $gte: today, $lte: tomorrow }, // Check if the due date is within the next 24 hours
    });

    if (projects.length === 0) {
      console.log("No projects due for reminders.");
      return;
    }

    projects.forEach(async (project) => {
      // Skip projects that have already passed due date
      if (new Date(project.dueDate) < new Date()) {
        console.log(`Skipping reminder for project: ${project.title} as it is past due.`);
        return;
      }

      const mailOptions = {
        from: "sankaliyavivek9797@gmail.com",
        to: "recipient-email@gmail.com", 
        subject: `Reminder: Project "${project.title}" is due soon!`,
        text: `The project "${project.title}" is due on ${new Date(project.dueDate).toLocaleDateString()}. Please make sure all necessary work is completed.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent for project: ${project.title}`);
      } catch (error) {
        console.error(`Error sending email for project ${project.title}:`, error);
      }
    });
  } catch (error) {
    console.error("Error sending deadline reminders:", error);
  }
};

// Schedule the task to run daily at 9 PM
cron.schedule("0 21 * * *", () => {  
  console.log("Running daily project deadline reminder check...");
  sendDeadlineReminders();
});

module.exports = { sendDeadlineReminders };

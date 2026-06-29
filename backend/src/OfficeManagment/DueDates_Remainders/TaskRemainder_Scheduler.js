const cron = require("node-cron");
const {
  processOverdueTasks,
  processPendingReminders,
} = require("./duedates.service");

let schedulerStarted = false;

const startScheduler = async () => {
  if (schedulerStarted) return;

  schedulerStarted = true;

  try {
    const overdueResult = await processOverdueTasks();
    // console.log(
    //   `[Scheduler] Initial overdue tasks marked: ${overdueResult.updated}`
    // );
    const reminderResult = await processPendingReminders();
    // console.log(
    //   `[Scheduler] Initial reminders processed: ${reminderResult.processed}`
    // );
  } catch (err) {
    console.error("[Scheduler] Initial run failed:", err);
  }

  // Every 5 minutes - Process Reminders
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("[Scheduler] Processing pending reminders...");
      const result = await processPendingReminders();
      console.log(
        `[Scheduler] Reminders processed: ${result.processed}`
      );
    } catch (err) {
      console.error(
        "[Scheduler] Reminder processing failed:",
        err.message
      );
    }
  });

  // Every 5 minutes - Check Overdue Tasks
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await processOverdueTasks();
      console.log(
        `[Scheduler] Tasks marked overdue: ${result.updated}`
      );
    } catch (err) {
      console.error(
        "[Scheduler] Overdue task processing failed:",
        err.message
      );
    }
  });

  console.log("Scheduler started successfully");
};

module.exports = { startScheduler };
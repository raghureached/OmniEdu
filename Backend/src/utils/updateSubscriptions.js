const cron = require("node-cron");
const Organization = require("../models/globalAdmin/Organization/organization_model");
function startSubscriptionUpdater() {

  cron.schedule("0 12 * * *", async () => {
    try {
      const now = new Date();

      const result = await Organization.updateMany(
        {
          end_date: { $lt: now },
          status: "Active"
        },
        {
          $set: { status: "Inactive" }
        }
      );
      console.log(`Expired subscriptions updated: ${result.modifiedCount}`);
    } catch (error) {
      console.error("Subscription expiry job failed", error);
    }
  });
}

module.exports = startSubscriptionUpdater;

"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // Every 1st of the month increment all condidates connects
  "0 0 0 1 * *": async () => {
    const users = await strapi.db.query("user", "users-permissions").find();
    users.map(async (user) => {
      if (user.accountType === "condidate") {
        console.log("adding 10 connects to condidate ", user.username);
        await strapi.db
          .query("user", "users-permissions")
          .update({ id: user.id }, { connects: user.connects + 15 });
      }
    });
  },
};

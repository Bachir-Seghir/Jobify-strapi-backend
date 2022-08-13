"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  const users = await strapi.db.query("user", "users-permissions").find();
  users.map(async (user) => {
    if (user.accountType === "condidate") {
      console.log("setting 30 connects to condidate ", user.username);
      await strapi.db
        .query("user", "users-permissions")
        .update({ id: user.id }, { connects: 30 });
    }
  });
  /* const job = await strapi.query("job").findOne({ id: 17 });
  job.applicants.map((user) => console.log(user.username)); */
};

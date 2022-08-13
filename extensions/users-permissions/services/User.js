"use strict";

module.exports = {
  /**
   * Promise to fetch authenticated user.
   * @return {Promise}
   */
  fetchAuthenticatedUser(id) {
    return strapi
      .query("user", "users-permissions")
      .findOne({ id }, [
        "role",
        "postedJobs.applicants",
        "job_applieds.applicants",
        "job_applieds.company",
        "saved_jobs",
        "company",
        "order",
        "skills",
        "testimonials",
        "notifications",
      ]);
  },
};

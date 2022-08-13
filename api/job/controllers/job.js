"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

module.exports = {
  // this method is called when api to create job is called
  async create(ctx) {
    // add user from the request and add it to the body of request
    ctx.request.body.user = ctx.state.user.id;
    // add company from the request and add it to the body of request
    ctx.request.body.company = ctx.state.user.company;
    // call the function to creating job with data
    let entity = await strapi.services.job.create(ctx.request.body);
    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.job });
  },
  async update(ctx) {
    // get the id of job which is updated
    const { id } = ctx.params;
    // finding the job for user and id
    const [job] = await strapi.services.job.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });
    // job does not exist send error
    if (!job) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    // update the job
    let entity = await strapi.services.job.update({ id }, ctx.request.body);
    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.job });
  },
  async delete(ctx) {
    // get the id of job which is deleted
    const { id } = ctx.params;
    // finding the job for user and id
    const [job] = await strapi.services.job.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });
    // job does not exist send error
    if (!job) {
      return ctx.unauthorized(`You can't delete this entry`);
    }
    // delete the job
    let entity = await strapi.services.job.delete({ id });
    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.job });
  },
  async apply(ctx) {
    // get authenticated user who will apply
    const user = ctx.state.user;

    // get the id of job to apply
    const { id } = ctx.params;

    // finding the job for id
    const [job] = await strapi.services.job.find({
      id,
    });

    // job does not exist send error
    if (!job) {
      return ctx.unauthorized(`Job Post Not Existed !`);
    }
    // check if the applicant has an condidate account type
    if (user.accountType === "employer") {
      return ctx.unauthorized(
        `Sorry, You can't apply with en (Employer) account, please register as Condidate and apply !`
      );
    }
    // check if the applicant has enough connects to apply
    if (user.connects < job.connects) {
      return ctx.unauthorized(
        `Sorry, You don't have enough connects to apply !`
      );
    }
    // get all applications of this job
    const applicants = job.applicants;

    // check if this user is already applied
    const [isApplied] = applicants.filter(
      (applicant) => user.id === applicant.id
    );
    if (isApplied) {
      return ctx.unauthorized(`You are already applied`);
    }
    // push user to applicants  array
    applicants.push(user);

    // update the job
    let entity = await strapi.services.job.update({ id }, { applicants });

    // send notification to employer for new applicant
    const notifications = job.user.notifications;
    const newNotif = {
      subject: `You have a new applicant for ${job.title}`,
      message: `${user.fullname} has applied to ${job.title}`,
      date: new Date().toISOString(),
      read: false,
      from: user,
    };
    notifications.push(newNotif);

    const data = await strapi.plugins["users-permissions"].services.user.edit(
      { id: job.user.id },
      {
        notifications: [...notifications],
      }
    );

    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.job });
  },
};

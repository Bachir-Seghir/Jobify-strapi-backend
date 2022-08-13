"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // this method is called when api to create company is called
  async create(ctx) {
    const { user } = ctx.state;
    // if the user have a company can't create another one
    if (user.company) {
      return ctx.unauthorized(`you can create just One Company per Account`);
    }
    // add user from the request and add it to the body of request
    ctx.request.body.user = ctx.state.user.id;
    // call the function to creating company with data
    let entity = await strapi.services.company.create(ctx.request.body);
    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.company });
  },
  async update(ctx) {
    // get the id of company which is updated
    const { id } = ctx.params;
    // finding the company for user and id
    const [company] = await strapi.services.company.find({
      id,
      "user.id": ctx.state.user.id,
    });
    // company does not exist send error
    if (!company) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    // update the company
    let entity = await strapi.services.company.update({ id }, ctx.request.body);
    // return data for api after removing field which are not exported
    return sanitizeEntity(entity, { model: strapi.models.company });
  },
  async delete(ctx) {
    // get the id of company which is updated
    const { id } = ctx.params;
    // finding the company for user and id
    const [company] = await strapi.services.company.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });
    // company does not exist send error
    if (!company) {
      return ctx.unauthorized(`You can't update this entry`);
    }
    // delete the company
    let entity = await strapi.services.company.delete({ id });
    // return data for api after removing field which are not exported
    //return sanitizeEntity(entity, { model: strapi.models.company });
    return "deleted successfully";
  },
};

"use strict";

/**
 * api/password/controllers/password.js
 */

const { sanitizeEntity } = require("strapi-utils");
const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
  index: async (ctx) => {
    // get posted params
    const params = ctx.request.body;

    // Required identifier [email]
    if (!params.identifier) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.provide",
          message: "Please provide your Email",
        })
      );
    }

    // Password is required
    if (!params.password) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your Password",
        })
      );
    }

    // New Password is required
    if (!params.newPassword) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your New Password",
        })
      );
    }

    // New Password Confirmation is required
    if (!params.confirmPassword) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your New Password Confirmation",
        })
      );
    }
    if (
      params.password &&
      params.confirmPassword &&
      params.newPassword !== params.confirmPassword
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.matching",
          message: "New Passwords do not match",
        })
      );
    }

    // get User based on identifier [email]
    const user = await strapi.query("user", "users-permissions").findOne({
      email: params.identifier,
    });

    // validate given password against user query result password
    const validPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(params.password, user.password);

    if (!validPassword) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.invalid",
          message: "Invalid identifier or password",
        })
      );
    } else {
      // Generate new hash password
      const password = await strapi.plugins[
        "users-permissions"
      ].services.user.hashPassword({ password: params.newPassword });
      // Update user password
      await strapi
        .query("user", "users-permissions")
        .update({ id: user.id }, { resetPasswordToken: null, password });

      // Return new JWT
      ctx.send({
        jwt: strapi.plugins[("user", "users-permissions")].services.jwt.issue({
          id: user.id,
        }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query("user", "users-permissions").model,
        }),
      });
    }
  },
};

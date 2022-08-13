"use strict";
const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);

/**
 * Given a dollar amount, return the amount in cents
 * @param {number} number
 */
const fromDecToInt = (number) => parseInt(number * 100);

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Only Returns orders that belongs to logged in user
   * @param {any} ctx
   */
  async find(ctx) {
    const userId = ctx.state.user.id;
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.order.search({
        ...ctx.query,
        user: user.id,
      });
    } else {
      entities = await strapi.services.order.find({
        ...ctx.query,
        user: userId,
      });
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, {
        model: strapi.models.order,
      })
    );
  },
  /**
   * Returns one order as long as it belongs to logged in user
   * @param {any} ctx
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user.id;

    const entity = await strapi.services.order.findOne({ id, user: userId });

    return sanitizeEntity(entity, {
      model: strapi.models.order,
    });
  },

  /**
   * Create an order and sets up the Stripe checkout session for the frontend
   * @param {any} ctx
   */
  async create(ctx) {
    const plan = ctx.request.body;

    if (!plan) {
      return ctx.throw(400, "Please specify a plan");
    }

    const realPlan = await strapi.services.plan.findOne({ id: plan.id });
    if (!realPlan) {
      return ctx.throw(404, "No plan with such id");
    }

    const { user } = ctx.state;
    const BASE_URL = ctx.request.headers.origin || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: realPlan.title,
            },
            unit_amount: fromDecToInt(realPlan.price),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
    });

    //create the order
    const newOrder = await strapi.services.order.create({
      user: user.id,
      plan: realPlan.id,
      price: realPlan.price,
      status: "unpaid",
      checkout_session: session.id,
    });
    return { id: session.id };
  },

  /**
   * Given a checkout_session, verifies payment and update the order
   * @param {any} ctx
   */
  async confirm(ctx) {
    const { checkout_session } = ctx.request.body;
    console.log(checkout_session);
    const session = await stripe.checkout.sessions.retrieve(checkout_session);

    if (session.payment_status === "paid") {
      const updateOrder = await strapi.services.order.update(
        {
          checkout_session,
        },
        {
          status: "paid",
        }
      );
      return sanitizeEntity(updateOrder, { model: strapi.models.order });
    } else {
      ctx.throw(400, "The Payment wasn't successfull, please call support");
    }
  },
};

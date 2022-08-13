module.exports = async (ctx, next) => {
  const params = ctx.request.body;

  if (ctx.state.user.id === params.id) {
    return await next();
  }

  ctx.unauthorized(`You're not Authorized`);
};

module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "ff985aa8686fce3e417b36f50367170c"),
    },
  },
  cron: {
    enabled: true,
  },
});

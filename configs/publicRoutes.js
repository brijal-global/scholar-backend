export default [
  {
    methods: ["GET"],
    route: "/health",
  },
  {
    methods: ["GET"],
    route: "/favicon.ico",
  },
  {
    methods: ["GET"],
    route: "/api/auth/reset-superadmin",
  },
  {
    methods: ["POST"],
    route: "/api/auth/signin",
  },
  {
    methods: ["GET"],
    route: "/api/auth/refresh",
  },
  {
    methods: ["GET"],
    route: "/api/auth/signout",
  },
  // signup routes: modify this as per need for new roles
  {
    methods: ["POST"],
    route: "/api/auth/signup/customer",
  },
];

export default [
  {
    methods: ["GET"],
    route: "/favicon.ico",
  },
  {
    methods: ["GET"],
    route: "/health",
  },
  {
    methods: ["GET"],
    route: "/api/auth/reset-superadmin",
  },
  {
    methods: ["GET"],
    route: "/api/auth/oauth/configs",
  },
  {
    methods: ["GET"],
    route: "/api/auth/google",
  },
  {
    methods: ["GET"],
    route: "/api/auth/google/callback",
  },
  {
    methods: ["POST"],
    route: "/api/auth/signup/college-owner",
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
  {
    methods: ["POST"],
    route: "/api/inquiries",
  },
];

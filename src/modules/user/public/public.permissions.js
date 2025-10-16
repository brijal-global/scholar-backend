export default [
  {
    methods: ["GET"],
    route: "/",
  },
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
    route: "/api-docs",
  },
  {
    methods: ["GET"],
    route: "/api-docs/*",
  },
  {
    methods: ["GET"],
    route: "/api-docs.json",
  },
  {
    methods: ["GET"],
    route: "/api/auth/reset-superadmin",
  },
  {
    methods: ["POST"],
    route: "/api/auth/signup/:userType",
  },
  {
    methods: ["GET"],
    route: "/api/auth/verify-email/:token",
  },
  {
    methods: ["GET"],
    route: "/api/auth/resend-verification-email/:userType/:email",
  },
  {
    methods: ["POST"],
    route: "/api/auth/signin/:userType",
  },
  {
    methods: ["GET"],
    route: "/api/auth/signout",
  },
  {
    methods: ["GET"],
    route: "/api/auth/signin/google/:userType",
  },
  {
    methods: ["GET"],
    route: "/api/auth/google/callback",
  },
  {
    methods: ["GET"],
    route: "/api/auth/signin/linkedin/:userType",
  },
  {
    methods: ["GET"],
    route: "/api/auth/linkedin/callback",
  },
];

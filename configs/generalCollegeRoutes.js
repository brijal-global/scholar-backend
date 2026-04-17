export default [
  {
    methods: ["GET", "POST"],
    route: "/api/programs",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/programs/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/batches",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/batches/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/groups",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/groups/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/modules",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/modules/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/classes",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/classes/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/attendances",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/attendances/:id",
  },
  {
    methods: ["GET"],
    route: "/api/attendance-by-group",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/exams",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/exams/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/exam-modules",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/exam-modules/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/module-marks",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/module-marks/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/student-details",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/student-details/:id",
  },
  {
    methods: ["GET"],
    route: "/api/students-with-info",
  },
  {
    methods: ["GET"],
    route: "/api/results-by-group",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/student-remarks",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/student-remarks/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/organization-employees",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/organization-employees/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/college-custom-role-groups",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/college-custom-role-groups/:id",
  },
  {
    methods: ["GET", "POST"],
    route: "/api/college-custom-role-permissions",
  },
  {
    methods: ["GET", "PUT", "DELETE"],
    route: "/api/college-custom-role-permissions/:id",
  },
  {
    methods: ["GET"],
    route: "/api/colleges",
  },
  {
    methods: ["GET", "PUT"],
    route: "/api/colleges/:id",
  },
  {
    methods: ["POST"],
    route: "/api/register-student",
  },
  {
    methods: ["GET"],
    route: "/api/users",
  },
  {
    methods: ["GET"],
    route: "/api/users/:id",
  },
];

import { models, ids } from "../../../configs/server.config.js";

const {
  users,
  roles,
  organizationEmployees,
  colleges,
  subscriptions,
  studentDetails,
  groups,
  batches,
  programs,
} = models;

export const getCustomUserForMeRoute = async (userId, roleId) => {
  let user;

  if (roleId === ids.organizationEmployeeRoleId) {
    user = await users.findOne({
      where: { id: userId },
      include: [
        { model: roles, as: "role", attributes: ["id", "name", "slug"] },
        {
          model: organizationEmployees,
          as: "organizationEmployees",
          attributes: [
            "id",
            "collegeId",
            "collegeCustomRoleGroupId",
            "designation",
          ],
          required: false,
          include: [
            {
              model: colleges,
              as: "college",
              attributes: ["id", "name", "collegeType", "logo", "coverImage"],
              required: false,
            },
          ],
        },
      ],
    });

    user = user.toJSON();

    user.college = user?.organizationEmployees?.[0]?.college;
    user.organizationEmployee = user?.organizationEmployees?.[0]
      ? {
          id: user.organizationEmployees[0].id,
          collegeId: user.organizationEmployees[0].collegeId,
          collegeCustomRoleGroupId:
            user.organizationEmployees[0].collegeCustomRoleGroupId,
          designation: user.organizationEmployees[0].designation,
        }
      : null;
  } else if (roleId === ids.studentRoleId) {
    user = await users.findOne({
      where: { id: userId },
      include: [
        { model: roles, as: "role", attributes: ["id", "name", "slug"] },
        {
          model: studentDetails,
          as: "studentDetails",
          attributes: ["id", "groupId", "dob"],
          required: false,
          include: [
            {
              model: groups,
              as: "group",
              attributes: ["id", "name", "batchId"],
              required: false,
              include: [
                {
                  model: batches,
                  as: "batch",
                  attributes: ["id", "name", "programId"],
                  required: false,
                  include: [
                    {
                      model: programs,
                      as: "program",
                      attributes: ["id", "name", "collegeId"],
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    user = user.toJSON();

    const detail = user?.studentDetails?.[0];
    user.student = detail || null;
    user.college = detail?.group?.batch?.program
      ? { id: detail.group.batch.program.collegeId }
      : null;
  } else {
    user = await users.findOne({
      where: { id: userId },
      include: [
        { model: roles, as: "role", attributes: ["id", "name", "slug"] },
      ],
    });
    user = user.toJSON();
  }

  return user;
};

export const createUser = async (payload) => {
  return await users.create(payload);
};

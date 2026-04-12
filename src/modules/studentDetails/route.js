import { hashPassword } from "../../../server/lib/bcrypt.js";
import successResponse from "../../../server/utils/responses/successResponse.js";
import {
  ConflictException,
  HttpException,
} from "../../../server/exceptions/index.js";
import { models, ids } from "../../../configs/server.config.js";

const { users, roles, studentDetails } = models;

export default (router) => {
  router.route("/register-student").post(async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        gender,
        address,
        groupId,
        dob,
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        throw new HttpException(
          400,
          "First name, last name, email, and password are required!",
          "register-student",
        );
      }

      if (!groupId || !dob) {
        throw new HttpException(
          400,
          "Group and date of birth are required!",
          "register-student",
        );
      }

      const existingUser = await users.findOne({
        where: { email },
        raw: true,
      });

      if (existingUser) {
        throw new ConflictException(
          "A user with this email already exists!",
          "register-student",
        );
      }

      const studentRoleId = ids.studentRoleId;

      const studentRole = await roles.findOne({
        where: { id: studentRoleId },
        raw: true,
      });

      if (!studentRole) {
        await roles.create({
          id: studentRoleId,
          name: "student",
          slug: "student",
          description: "Student role",
          ip: req.ip,
          isActive: true,
        });
      }

      const hashedPassword = await hashPassword(password);

      const createdUser = await users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || null,
        gender: gender || "other",
        address: address || "",
        roleId: studentRoleId,
        isTermsAndConditionsAccepted: true,
        isEmailVerified: false,
        ip: req.ip,
        createdBy: req?.user?.id || null,
        updatedBy: req?.user?.id || null,
      });

      const createdStudentDetails = await studentDetails.create({
        userId: createdUser.id,
        groupId,
        dob,
        ip: req.ip,
        createdBy: req?.user?.id || null,
        updatedBy: req?.user?.id || null,
      });

      return successResponse(
        res,
        {
          user: {
            id: createdUser.id,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            email: createdUser.email,
          },
          studentDetails: createdStudentDetails,
        },
        "Student registered successfully!",
        "register-student",
      );
    } catch (error) {
      next(error);
    }
  });
};

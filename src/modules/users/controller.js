import successResponse from "../../../server/utils/responses/successResponse.js";
import { createCollegeOwner } from "./service.js";

export const registerCollegeOwner = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      ip: req?.ip || null,
    };

    const user = await createCollegeOwner(payload);

    return successResponse(
      res,
      user,
      "College owner account created successfully!",
      "collegeOwner",
    );
  } catch (error) {
    next(error);
  }
};

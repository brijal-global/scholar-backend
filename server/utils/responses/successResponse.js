import { SuccessResponse } from "./response.js";

const successResponse = (res, result, message, source) => {
  if (!result)
    throw new Error("Result data is required to send response to client!");
  if (!message) throw new Error("Message key is required");

  const success = new SuccessResponse();
  success.status = 200;
  success.data = result;
  success.message = message;
  success.source = source;

  return res.status(200).send(success);
};

export default successResponse;

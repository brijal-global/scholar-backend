import { ErrorResponse } from "./response.js";

const errorResponse = (status, message, source) => {
  if (!status) throw new Error(`http code not found`);
  if (!message) throw new Error(`Message Required to send to client`);

  const error = new ErrorResponse();
  error.status = status;
  error.message = message;
  error.source = source;

  return error;
};

export default errorResponse;

const joiMiddleware = (schema) => {
  return (req, res, next) => {
    // Validate the request body against the provided Joi schema
    const { error, value } = schema.validate(req.body);

    // If there is a validation error
    if (error) {
      const { details } = error;
      // Create a single error message string from the validation error details
      const message = details.map((i) => i.message).join(",");
      // Send a 422 Unprocessable Entity response with the error message
      return res.send({
        status: 404,
        code: 422,
        // Allow numbers and spaces in the error message, remove other non-alphabetic characters
        message: message.replace(/[^a-zA-Z0-9 ]/g, ""),
      });
    }

    // Assign the validated value back to req.body
    req.body = value;
    // Call the next middleware or route handler
    next();
  };
};

export default joiMiddleware;

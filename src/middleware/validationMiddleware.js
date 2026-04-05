const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsedParams = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Assign validated/sanitized data back to request object
    req.body = parsedParams.body;
    req.query = parsedParams.query;
    req.params = parsedParams.params;
    next();
  } catch (error) {
    // Send 400 Bad Request if validation fails
    if (error.errors && error.errors.length > 0) {
      const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new ApiError(400, `Validation Error: ${errorMessage}`));
    }
    next(error);
  }
};

module.exports = validate;

const { StatusCodes } = require("http-status-codes");
const { ZodError } = require("zod");

module.exports = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) schema.body.parse(req.body);
      if (schema.params) schema.params.parse(req.params);
      if (schema.query) schema.query.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", details: errorMessages });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error", messsage: error?.message });
      }
    }
  };
};

const validateRequest =
  (schema) =>
  async (
    req,
    res,
    next
  ) => {
    try {
      await schema.parseAsync(
        {
          body:
            req.body,

          params:
            req.params,

          query:
            req.query,
        }
      );

      next();
    } catch (error) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            "Validation Error",

          errors:
            error.errors,
        });
    }
  };

module.exports =
  validateRequest;
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const saveAssetUserSchema = Joi.object({
  _id: Joi.string().allow("", null),
  AssetId: Joi.string().required().messages({
    "any.required": "Asset ID is required",
    "string.base": "Asset ID must be a string",
  }),
  Name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),
  Phone: Joi.number().required().messages({
    "any.required": "Phone number is required",
    "number.base": "Phone must be a number",
  }),
  Password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
  IsActive: Joi.boolean().optional(),
});

const validateSaveAssetUser = (req, res, next) => {
  const { error } = saveAssetUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }

  next();
};

module.exports = {
  validateSaveAssetUser,
};

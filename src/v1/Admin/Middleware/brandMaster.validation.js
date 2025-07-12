const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

// Joi Schema
const saveBrandSchema = Joi.object({
  _id: Joi.string().optional(),

  LegalEntityTypeId: Joi.string().required().messages({
    "any.required": "Legal Entity is required",
    "string.empty": "Legal Entity cannot be empty",
  }),

  BrandTypeId: Joi.string().required().messages({
    "any.required": "Brand Type is required",
    "string.empty": "Brand Type cannot be empty",
  }),

  BrandName: Joi.string().required().messages({
    "any.required": "Brand Name is required",
    "string.empty": "Brand Name cannot be empty",
  }),

  Description: Joi.string().optional().allow(""),

  Images: Joi.string().optional().allow(""),

  BrandBroucher: Joi.string().optional().allow(""),
});

// Middleware
const validateSaveBrand = (req, res, next) => {
  const { error } = saveBrandSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }
  next();
};

module.exports = {
  validateSaveBrand,
};

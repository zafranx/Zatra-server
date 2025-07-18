const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

const govtPolicySchema = Joi.object({
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .optional()
    .allow("", null),

  CityId: Joi.string().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),

  PolicyTitle: Joi.string().required().messages({
    "any.required": "Policy Title is required",
    "string.empty": "Policy Title cannot be empty",
  }),

  ShortDesc: Joi.string().optional().allow("", null),
  LongDesc: Joi.string().optional().allow("", null),
  Eligibility: Joi.string().optional().allow("", null),
  GovernmentAuthority: Joi.string().optional().allow("", null),
  PolicyDocument: Joi.string().optional().allow("", null),
  PolicyImage: Joi.string().optional().allow("", null),
});

const validateSaveGovtPolicy = (req, res, next) => {
  const { error } = govtPolicySchema.validate(req.body, { abortEarly: false });
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
  validateSaveGovtPolicy,
};

const Joi = require("joi");
const mongoose = require("mongoose");

const saveZatraSchema = Joi.object({
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }),

  // ZatraTypeId: Joi.string()
  //   .required()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.error("any.invalid");
  //     }
  //     return value;
  //   })
  //   .messages({
  //     "any.required": "Zatra Type is required",
  //     "any.invalid": "Invalid Zatra Type ID",
  //   }),

  ZatraType: Joi.string().required().messages({
    "any.required": "Zatra Type is required",
    "string.empty": "Zatra Type cannot be empty",
  }),
  ZatraName: Joi.string().required().messages({
    "any.required": "Zatra Name is required",
    "string.empty": "Zatra Name cannot be empty",
  }),
  Logo: Joi.string().optional().allow(""),
  Website: Joi.string().optional().allow(""),
  StartDate: Joi.date().messages({
    "date.base": "Start Date must be a valid date",
  }),

  EndDate: Joi.date().messages({
    "date.base": "End Date must be a valid date",
  }),

  ZatraOrganisers: Joi.string().optional().allow("").messages({
    "string.base": "ZatraOrganisers must be a string",
  }),

  CityId: Joi.array()
    .items(
      Joi.string().custom((val, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(val)) {
          return helpers.error("any.invalid");
        }
        return val;
      })
    )
    .messages({
      "array.base": "CityId must be an array of valid ObjectIds",
    }),
});

const validateSaveZatra = (req, res, next) => {
  const { error } = saveZatraSchema.validate(req.body, {
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

module.exports = { validateSaveZatra };

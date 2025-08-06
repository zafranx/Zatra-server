const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

// 🔹 Reusable ObjectId validation
const objectId = () =>
  Joi.string()
    .allow(null, "")
    .custom((value, helpers) => {
      if (!value) return value; // allow empty/null
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation");

// 🔹 SaveOrganizerSponser schema
const saveOrganizerSponserSchema = Joi.object({
  _id: objectId().optional(), // for edit
  ZatraId: objectId().required().messages({
    "any.required": "ZatraId is required",
    "any.invalid": "Invalid ZatraId",
  }),
  OrganizerTypeId: objectId().required().messages({
    "any.required": "OrganizerTypeId is required",
    "any.invalid": "Invalid OrganizerTypeId",
  }),
  OrganizerName: Joi.string().allow("", null).optional(),
  Logo: Joi.string().allow("", null).optional(),
  Website: Joi.string().allow("", null).optional(),
  ContactName: Joi.string().allow("", null).optional(),
  ContactNumber: Joi.string().allow("", null).optional(),
  EmailAddress: Joi.string().email().allow("", null).optional(),
  IsSponsor: Joi.boolean().optional().default(false), // default to false if not provided

  FullName: Joi.string().allow("", null).optional(),
  PhoneNumber: Joi.string().allow("", null).optional(),

  IsOrganiserAdmin: Joi.boolean().optional().default(false),
  // IsSponsorAdmin: Joi.boolean().optional().default(false), // in case needed later
  // for passwor - entry will be in zatra_login_master
  Password: Joi.string().allow("", null).optional(),
  //   Password: Joi.string().min(6).max(20).required().messages({
  //     "any.required": "Password is required",
  //     "string.min": "Password must be at least 6 characters long",
  //     "string.max": "Password must not exceed 20 characters",
  //   }),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

// 🔹 Middleware
const validateSaveOrganizerSponser = (req, res, next) => {
  const { error } = saveOrganizerSponserSchema.validate(req.body, {
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

module.exports = { validateSaveOrganizerSponser };

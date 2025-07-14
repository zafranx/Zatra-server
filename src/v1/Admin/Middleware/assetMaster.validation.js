const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const AssetMaster = require("../../../models/AssetMaster");
const { default: mongoose } = require("mongoose");

const SaveAssetMasterSchema = Joi.object({
  //   _id: Joi.string().allow("", null).optional(),
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid _id format",
    }),
  CityId: Joi.string().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),
  DestinationId: Joi.string().required().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination cannot be empty",
  }),
  AssetType: Joi.string().required().messages({
    "any.required": "Asset Type is required",
    "string.empty": "Asset Type cannot be empty",
  }),
  //   LegalEntityTypeId: Joi.string().required().messages({
  //     "any.required": "Legal Entity Type is required",
  //     "string.empty": "Legal Entity Type cannot be empty",
  //   }),
  LegalEntityTypeId: Joi.string().optional().allow(""),
  Name: Joi.string().required().messages({
    "any.required": "Legal Entity Name is required",
    "string.empty": "Legal Entity Name cannot be empty",
  }),

  Registration_Number: Joi.string().required().messages({
    "any.required": "Registration Number is required",
    "string.empty": "Registration Number cannot be empty",
  }),

  GST: Joi.string().optional().allow(""),
  PAN: Joi.string().optional().allow(""),
  Registration_Address: Joi.string().required().messages({
    "any.required": "Registration Address is required",
    "string.empty": "Registration Address cannot be empty",
  }),

  Authorised_Representative: Joi.string().required().messages({
    "any.required": "Authorised Representative is required",
    "string.empty": "Authorised Representative cannot be empty",
  }),

  Phone: Joi.number().required().messages({
    "any.required": "Phone number is required",
    "number.base": "Phone must be a number",
  }),

  EmailAddress: Joi.string().email().required().messages({
    "any.required": "Email Address is required",
    "string.email": "Invalid Email Address",
  }),

  Website: Joi.string().optional().allow(""),
  LinkedIn: Joi.string().optional().allow(""),
  Instagram: Joi.string().optional().allow(""),
  Facebook: Joi.string().optional().allow(""),

  Industry_Sector: Joi.string().optional().allow(""),
  Industry_Sub_Sector: Joi.string().optional().allow(""),

  Logo: Joi.string().optional().allow(""),
  IsVerified: Joi.boolean().optional(),
  VerifiedBy: Joi.string().optional().allow(""),
  VerificationDate: Joi.date().optional().allow(null),
  VerificationReport: Joi.string().optional().allow(""),
  IsActive: Joi.boolean().optional(),
});

const validateSaveAssetMaster = async (req, res, next) => {
  const { _id } = req.body;

  const { error } = SaveAssetMasterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  try {
    const duplicate = await AssetMaster.findOne({
      _id: { $ne: _id },
      $or: [
        { GST: req.body.GST },
        { PAN: req.body.PAN },
        { Registration_Number: req.body.Registration_Number },
      ].filter((q) => !!Object.values(q)[0]),
    });

    if (duplicate) {
      return res.json(
        __requestResponse(
          "400",
          "GST/PAN/Registration Number already used by another record"
        )
      );
    }

    next();
  } catch (err) {
    console.error("Validation DB check error:", err);
    return res.json(__requestResponse("500", "Validation error", err));
  }
};

module.exports = { validateSaveAssetMaster };

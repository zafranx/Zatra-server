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

  EmailAddress: Joi.string().email().optional().allow("").messages({
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
  // CityIndicatorId: Joi.array().items(Joi.string()).required().messages({
  //   "any.required": "City Indicator is required",
  //   "string.empty": "City Indicator cannot be empty",
  //   "array.base": "City Indicator must be an array",
  // }),
  CityIndicatorId: Joi.array().items(Joi.string()).optional(),
  EstablishmentId: Joi.string().optional().allow(""),
  AllocationNumber: Joi.string().optional().allow(""),
  FloorLaneNumber: Joi.string().optional().allow(""),
  Geolocation: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
      "array.length": "Geolocation must contain [longitude, latitude]",
    }),
  })
    .required()
    .messages({
      "any.required": "Geolocation is required",
    }),
  IsActive: Joi.boolean().optional(),
});

const validateSaveAssetMaster = async (req, res, next) => {
  const { _id } = req.body;
  // Check if _id is provided and is a valid MongoDB ObjectId (if it exists)
  if (_id && !mongoose.Types.ObjectId.isValid(_id)) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: ["Invalid _id format."],
      })
    );
  }
  const { error } = SaveAssetMasterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse(
        "400",
        {
          errorType: "Validation Error",
          error: error.details.map((d) => d.message).join(". "),
        }
        // {
        //   error: error.details.map((d) => d.message),
        // }
      )
    );
  }

  try {
    console.warn(
      "duplicate check is commented in asset validation for development purpose"
    );
    // const duplicate = await AssetMaster.findOne({
    //   _id: { $ne: _id },
    //   $or: [
    //     { GST: req.body.GST },
    //     { PAN: req.body.PAN },
    //     { Registration_Number: req.body.Registration_Number },
    //   ].filter((q) => !!Object.values(q)[0]),
    // });

    // if (duplicate) {
    //   return res.json(
    //     __requestResponse(
    //       "400",
    //       "GST/PAN/Registration Number already used by another record"
    //     )
    //   );
    // }

    next();
  } catch (err) {
    console.error("Validation DB check error:", err);
    return res.json(__requestResponse("500", "Validation error", err));
  }
};

module.exports = { validateSaveAssetMaster };

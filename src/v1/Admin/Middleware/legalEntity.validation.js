const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const LegalEntity = require("../../../models/LegalEntity");

// Legal Entity Middleware
const saveLegalEntitySchema = Joi.object({
  _id: Joi.string().allow("", null).optional(), // for edit
  LegalEntityTypeId: Joi.string().required().messages({
    "any.required": "Legal Entity Type is required",
    "string.empty": "Legal Entity Type cannot be empty",
  }),

  Name: Joi.string().required().messages({
    "any.required": "Legal Entity Name is required",
    "string.empty": "Legal Entity Name cannot be empty",
  }),

  Registration_Number: Joi.string().required().messages({
    "any.required": "Registration Number is required",
    "string.empty": "Registration Number cannot be empty",
  }),

  GST: Joi.string().optional().allow("").messages({
    "string.base": "GST must be a string",
  }),

  PAN: Joi.string().optional().allow("").messages({
    "string.base": "PAN must be a string",
  }),

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
  SubSector: Joi.string().optional().allow(""),
});

const validateSaveLegalEntity = async (req, res, next) => {
  const { _id } = req.body;

  const { error } = saveLegalEntitySchema.validate(req.body, {
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
    if (!_id) {
      // ADD mode: Check if any of these values already exist
      const duplicate = await LegalEntity.findOne({
        $or: [
          { GST: req.body.GST },
          { PAN: req.body.PAN },
          { Registration_Number: req.body.Registration_Number },
        ],
      });

      if (duplicate) {
        return res.json(
          __requestResponse("400", "GST/PAN/Registration Number already exists")
        );
      }
    } else {
      // EDIT mode: Skip current record, check duplicates in others
      const duplicate = await LegalEntity.findOne({
        _id: { $ne: _id },
        $or: [
          { GST: req.body.GST },
          { PAN: req.body.PAN },
          { Registration_Number: req.body.Registration_Number },
        ],
      });

      if (duplicate) {
        return res.json(
          __requestResponse(
            "400",
            "GST/PAN/Registration Number already used by another record"
          )
        );
      }
    }

    next();
  } catch (err) {
    console.error("Validation DB check error:", err);
    return res.json(__requestResponse("500", "Validation error", err));
  }
};

module.exports = {
  validateSaveLegalEntity,
};

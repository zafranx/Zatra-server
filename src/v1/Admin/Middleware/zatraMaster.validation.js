const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");
const { __SOME_ERROR } = require("../../../utils/variable");
const ZatraMaster = require("../../../models/ZatraMaster");

// * Reusable ObjectId validation
const objectId = () =>
  Joi.string()
    .allow("", null)
    .custom((value, helpers) => {
      if (!value) return value; // allow empty/null
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation");

// * SaveZatra schema (all optional, allow null and string)
const saveZatraSchema = Joi.object({
  _id: objectId().optional(),

  ZatraTypeId: objectId().optional(),

  Name: Joi.string().allow("", null).optional(),
  ShortDescription: Joi.string().allow("", null).optional(),
  LongDescription: Joi.string().allow("", null).optional(),

  // Enroute Stations
  // EnrouteStations: Joi.array()
  //   .items(
  //     Joi.object({
  //       StateId: objectId().optional(),
  //       CityId: objectId().optional(),
  //     })
  //   )
  //   .optional(),

  // Organizers: Joi.array().items(objectId()).optional(),
  // Sponsors: Joi.array().items(objectId()).optional(),
  // OrganizerAdmins: Joi.array().items(objectId()).optional(),
  // SponsorAdmins: Joi.array().items(objectId()).optional(),
  // ZatraAdmins: Joi.array().items(objectId()).optional(),

  Logo: Joi.string().allow("", null).optional(),
  PictureGallery: Joi.array().items(Joi.string().allow("", null)).optional(),
  VideoGallery: Joi.array().items(Joi.string().allow("", null)).optional(),

  WikipediaPage: Joi.string().allow("", null).optional(),

  ZatraContacts: Joi.array()
    .items(
      Joi.object({
        Name: Joi.string().allow("", null).optional(),
        PhoneNumber: Joi.string().allow("", null).optional(),
        EmailAddress: Joi.string().allow("", null).optional(),
      })
    )
    .optional(),

  // ZatraSocialMedia: Joi.array()
  //   .items(
  //     Joi.object({
  //       SocialMediaId: objectId().optional(),
  //       URL: Joi.string().allow("", null).optional(),
  //     })
  //   )
  //   .optional(),

  IsOngoing: Joi.boolean().optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().optional(),
  Instructions: Joi.string().allow("", null).optional(),

  // RegistrationFees: Joi.array()
  //   .items(
  //     Joi.object({
  //       FeeCategory: objectId().optional(),
  //       FeeAmount: Joi.number().optional(),
  //     })
  //   )
  //   .optional(),

  RegistrationLink: Joi.string().allow("", null).optional(),
});

// * Middleware
const validateSaveZatra = async (req, res, next) => {
  // 🔹 Joi validation
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

  try {
    const { _id, ZatraContacts = [] } = req.body;

    // 🔹 Collect all phone numbers from payload
    const phoneNumbers = ZatraContacts.map((c) => c.PhoneNumber).filter(
      Boolean
    );

    if (phoneNumbers.length > 0) {
      // 🔹 Check for duplicate numbers within request payload itself
      const dupNumbers = phoneNumbers.filter(
        (num, idx) => phoneNumbers.indexOf(num) !== idx
      );
      if (dupNumbers.length > 0) {
        return res.json(
          __requestResponse("400", {
            errorType: "Validation Error",
            error: `Duplicate phone numbers in request: ${[
              ...new Set(dupNumbers),
            ].join(", ")}`,
          })
        );
      }

      // 🔹 Check for duplicate phone numbers in DB
      const duplicate = await ZatraMaster.findOne({
        _id: { $ne: _id }, // exclude current record on edit
        "ZatraContacts.PhoneNumber": { $in: phoneNumbers },
      });

      if (duplicate) {
        return res.json(
          __requestResponse(
            "400",
            `Phone number already used in another record`
          )
        );
      }
    }

    next();
  } catch (err) {
    console.error("validateSaveZatra Error:", err);
    return res.json(__requestResponse("500", __SOME_ERROR, err.message));
  }
};


// 🔹 Schema
const saveZatraEnrouteStationsSchema = Joi.object({
  _id: objectId().required().messages({
    "any.invalid": "Invalid ZatraId",
    "any.required": "ZatraId (_id) is required",
  }),

  EnrouteStations: Joi.array()
    .items(
      Joi.object({
        StateId: objectId().optional().allow(null, ""),
        CityId: objectId().optional().allow(null, ""),
      })
    )
    .required()
    .messages({
      "array.base": "EnrouteStations must be an array",
    }),
});

// 🔹 Middleware
const validateSaveZatraEnrouteStations = (req, res, next) => {
  const { error } = saveZatraEnrouteStationsSchema.validate(req.body, {
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


// 🔹 Schema
const saveZatraSocialMediaSchema = Joi.object({
  _id: objectId().required(),
  ZatraSocialMedia: Joi.array()
    .items(
      Joi.object({
        SocialMediaId: objectId().required(),
        URL: Joi.string().uri().required(),
      })
    )
    .min(1)
    .required(),
  // _id: objectId().required().messages({
  //   "any.invalid": "Invalid ZatraId",
  //   "any.required": "ZatraId (_id) is required",
  // }),

  // ZatraSocialMedia: Joi.array()
  //   .items(
  //     Joi.object({
  //       SocialMediaId: objectId().optional().allow(null, ""),
  //       URL: Joi.string().allow("", null).optional(),
  //     })
  //   )
  //   .required()
  //   .messages({
  //     "array.base": "ZatraSocialMedia must be an array",
  //   }),
});

// 🔹 Middleware
const validateSaveZatraSocialMedia = (req, res, next) => {
  const { error } = saveZatraSocialMediaSchema.validate(req.body, {
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


// Registration Fees validation
const saveZatraRegistrationFeesSchema = Joi.object({
  _id: objectId().required(),
  RegistrationFees: Joi.array()
    .items(
      Joi.object({
        FeeCategory: objectId().required(),
        FeeAmount: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

const validateSaveZatraRegistrationFees = (req, res, next) => {
  const { error } = saveZatraRegistrationFeesSchema.validate(req.body, {
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


// no use
const saveZatraExtrasSchema = Joi.object({
  _id: objectId().required(),

  ZatraSocialMedia: Joi.array()
    .items(
      Joi.object({
        SocialMediaId: objectId().required(),
        URL: Joi.string().uri().required(),
      })
    )
    .optional(), //  optional, so no error if missing

  RegistrationFees: Joi.array()
    .items(
      Joi.object({
        FeeCategory: objectId().required(),
        FeeAmount: Joi.number().min(0).required(),
      })
    )
    .optional(), //  optional, so no error if missing
});

const validateSaveZatraExtras = (req, res, next) => {
  const { error } = saveZatraExtrasSchema.validate(req.body, {
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
  validateSaveZatra,
  validateSaveZatraEnrouteStations,
  validateSaveZatraSocialMedia,
  validateSaveZatraRegistrationFees
  // validateSaveZatraExtras,
};

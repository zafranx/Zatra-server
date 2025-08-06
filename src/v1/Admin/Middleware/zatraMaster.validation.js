const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

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
  EnrouteStations: Joi.array()
    .items(
      Joi.object({
        StateId: objectId().optional(),
        CityId: objectId().optional(),
      })
    )
    .optional(),

  // Organizers: Joi.array().items(objectId()).optional(),
  // Sponsors: Joi.array().items(objectId()).optional(),
  OrganizerAdmins: Joi.array().items(objectId()).optional(),
  SponsorAdmins: Joi.array().items(objectId()).optional(),
  ZatraAdmins: Joi.array().items(objectId()).optional(),

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

  ZatraSocialMedia: Joi.array()
    .items(
      Joi.object({
        SocialMediaId: objectId().optional(),
        URL: Joi.string().allow("", null).optional(),
      })
    )
    .optional(),

  IsOngoing: Joi.boolean().optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().optional(),
  Instructions: Joi.string().allow("", null).optional(),

  RegistrationFees: Joi.array()
    .items(
      Joi.object({
        FeeCategory: objectId().optional(),
        FeeAmount: Joi.number().optional(),
      })
    )
    .optional(),

  RegistrationLink: Joi.string().allow("", null).optional(),
});

// * Middleware
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

module.exports = {
  validateSaveZatra,
  validateSaveZatraEnrouteStations,
  validateSaveZatraSocialMedia,
};

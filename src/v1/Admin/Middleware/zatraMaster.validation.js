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

  Organizers: Joi.array().items(objectId()).optional(),
  Sponsors: Joi.array().items(objectId()).optional(),
  OrganizerAdmins: Joi.array().items(objectId()).optional(),
  SponsorAdmins: Joi.array().items(objectId()).optional(),
  ZatraAdmins: Joi.array().items(objectId()).optional(),

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

module.exports = { validateSaveZatra };

// const Joi = require("joi");
// const mongoose = require("mongoose");

// const saveZatraSchema = Joi.object({
//   _id: Joi.string()
//     .allow("", null)
//     .optional()
//     .custom((value, helpers) => {
//       if (value && !mongoose.Types.ObjectId.isValid(value)) {
//         return helpers.error("any.invalid");
//       }
//       return value;
//     }),

//   // ZatraTypeId: Joi.string()
//   //   .required()
//   //   .custom((value, helpers) => {
//   //     if (!mongoose.Types.ObjectId.isValid(value)) {
//   //       return helpers.error("any.invalid");
//   //     }
//   //     return value;
//   //   })
//   //   .messages({
//   //     "any.required": "Zatra Type is required",
//   //     "any.invalid": "Invalid Zatra Type ID",
//   //   }),

//   ZatraType: Joi.string().required().messages({
//     "any.required": "Zatra Type is required",
//     "string.empty": "Zatra Type cannot be empty",
//   }),
//   ZatraName: Joi.string().required().messages({
//     "any.required": "Zatra Name is required",
//     "string.empty": "Zatra Name cannot be empty",
//   }),
//   Logo: Joi.string().optional().allow(""),
//   Website: Joi.string().optional().allow(""),
//   StartDate: Joi.date().messages({
//     "date.base": "Start Date must be a valid date",
//   }),

//   EndDate: Joi.date().messages({
//     "date.base": "End Date must be a valid date",
//   }),

//   ZatraOrganisers: Joi.string().optional().allow("").messages({
//     "string.base": "ZatraOrganisers must be a string",
//   }),

//   CityId: Joi.array()
//     .items(
//       Joi.string().custom((val, helpers) => {
//         if (!mongoose.Types.ObjectId.isValid(val)) {
//           return helpers.error("any.invalid");
//         }
//         return val;
//       })
//     )
//     .messages({
//       "array.base": "CityId must be an array of valid ObjectIds",
//     }),
// });

// const validateSaveZatra = (req, res, next) => {
//   const { error } = saveZatraSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     return res.json(
//       __requestResponse("400", {
//         errorType: "Validation Error",
//         error: error.details.map((d) => d.message).join(". "),
//       })
//     );
//   }

//   next();
// };

// module.exports = { validateSaveZatra };

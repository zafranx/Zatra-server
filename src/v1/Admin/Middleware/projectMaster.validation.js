const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const validateProject = Joi.object({
  _id: Joi.string().optional(),

  CityId: Joi.string().allow("", null).optional(),
  ProjectType: Joi.string().allow("", null).optional(),
  ProjectName: Joi.string().required().messages({
    "any.required": "Project name is required",
  }),
  ProjectLocation: Joi.string().allow("").optional(),

  PictureGallery: Joi.array().items(Joi.string()).optional(),
  VideoGallery: Joi.array().items(Joi.string()).optional(),

  MinimumInvestment: Joi.string().allow("").optional(),
  AssuredROI: Joi.string().allow("").optional(),
  LockinPeriod: Joi.string().allow("").optional(),

  ProjectStartDate: Joi.date().allow("", null).optional(),
  CompletionDeadline: Joi.date().allow("", null).optional(),

  AvailableSizes: Joi.array()
    .items(
      Joi.object({
        Unit: Joi.string().allow("", null),
        Size: Joi.string().allow(""),
      })
    )
    .optional(),

  ApprovalStatus: Joi.array().items(Joi.string()).optional(),

  ContactName: Joi.string().allow("").optional(),
  PhoneNumber: Joi.string().allow("").optional(),
  EmailAddress: Joi.string().email().allow("").optional(),

  ProjectDeveloper: Joi.array().items(Joi.string()).optional(),
  BankingPartner: Joi.array().items(Joi.string()).optional(),

  DistancefromCity: Joi.string().allow("").optional(),
  DistancefromAirport: Joi.string().allow("").optional(),
  DistancefromRailwayStation: Joi.string().allow("").optional(),

  Amenities: Joi.array().items(Joi.string()).optional(),
  Comments: Joi.string().allow("").optional(),
});

const validateSaveProduct = (req, res, next) => {
  const { error } = validateProject.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }
  next();
};


module.exports = { validateProject, validateSaveProduct };

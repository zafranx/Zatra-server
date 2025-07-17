const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

exports.validateSaveAncillaryService = async (req, res, next) => {
  const schema = Joi.object({
    _id: Joi.string().optional(),
    ServiceType: Joi.string().required(),
    ServiceProvider: Joi.string().required(),
    PhoneNumber: Joi.string().required(),
    IdNumber: Joi.string().required(),
    IdCardPicture: Joi.string().allow("", null),
    PictureGallery: Joi.array().items(Joi.string()).optional(),
    VideoGallery: Joi.array().items(Joi.string()).optional(),
    IsVerified: Joi.boolean().optional(),
    VerificationReport: Joi.string().allow("", null),
    IsActive: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  next();
};

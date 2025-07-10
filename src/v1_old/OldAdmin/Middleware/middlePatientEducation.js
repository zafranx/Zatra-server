const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");

const _SavePatientEducation = Joi.object({
  patientEducation_id: Joi.string().allow(null, ""),
  AssetId: Joi.string().allow(null, ""),
  Title: Joi.string().required(),
  YouTubeLink: Joi.string().uri().allow(""), // Allow empty string
  YouTubeThumbnail: Joi.string().uri().allow(""), // Allow empty string
  Category: Joi.string().required(),
  // SubCategory: Joi.string().required(),
  // SubCategory: Joi.string().optional(),
  SubCategory: Joi.string().allow(""),

  Content: Joi.string().required(),
  Tags: Joi.array().items(Joi.string()).allow(null), // Allow null or an array of strings
  // lookup type for showing the blogs in the list in diffrent websites like kcc bizaario
  lookup_type: Joi.array().items(Joi.string()).allow(null, ""),
  IsActive: Joi.boolean().allow(null), // Allow null
});

const checkPatientEducation = async (req, res, next) => {
  try {
    const { error } = _SavePatientEducation.validate(req.body);
    // console.log(error,"error")
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkPatientEducation };

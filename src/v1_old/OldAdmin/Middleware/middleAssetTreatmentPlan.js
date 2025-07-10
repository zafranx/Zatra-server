const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");

const _SaveTreatmentPlan = Joi.object({
  treatmentPlan_id: Joi.string().allow(null, ""),
  AssetId: Joi.string().required(),
  TreatmentDisplayName: Joi.string().max(50).required(),
  TherapyId: Joi.string().allow(null, ""),
  Features: Joi.array().items(Joi.string()).allow(null, ""),
  DisplayPrice: Joi.number().allow(null, ""),
  TreatmentPlanType: Joi.string().required(),
  TreatmentPlanFile: Joi.string().allow(null, ""),
  TreatmentPlanBanner: Joi.string().allow(null, ""),
  TreatmentPlanImage: Joi.array().items(Joi.string()).allow(null, ""),
  RateContactId: Joi.string().allow(null, ""),
});

const checkTreatmentPlan = async (req, res, next) => {
  try {
    const { error, value } = _SaveTreatmentPlan.validate(req.body);
    if (error) {
      return res.json(
        // __requestResponse("400", __VALIDATION_ERROR, error.details[0].message)
        __requestResponse("400", __VALIDATION_ERROR, error)
      );
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("400", __SOME_ERROR)).status(400);
  }
};

module.exports = { checkTreatmentPlan };

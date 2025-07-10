const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const tlbAssetSpecialtyMapping = require("../../../models/AssetSpecialtyMapping");

const _SaveAssetSpecialty = Joi.object({
  AssetId: Joi.string().required(),
  SpecialtyId: Joi.string().required(),
  // SpecialtyId: Joi.array().items(Joi.string()).allow(null, ""),
  SubSpecialityId: Joi.array().items(Joi.string()).allow(null, ""),
  SuperSpecializationId: Joi.array().items(Joi.string()).allow(null, ""),
  IsActive: Joi.boolean().allow(true, false, null),
  assetSpecialty_id: Joi.string().allow(null, ""),
  // updateBy: Joi.string().allow(null, ""),
  // createdBy: Joi.string().required(),
});

const checkAssetSpecialty = async (req, res, next) => {
  try {
    // Step 1: Validate the request body using Joi
    const { error, value } = _SaveAssetSpecialty.validate(req.body);
    if (error) {
      // return res.json(
      //   __requestResponse("400", __VALIDATION_ERROR, error.details[0].message)
      // );
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const { AssetId, SpecialtyId, assetSpecialty_id } = req.body;
    // do not check duplicate address in edit mode
    if (assetSpecialty_id == null || assetSpecialty_id == "") {
      // Step 2: Check if the specialty already exists for the given asset
      const existingSpecialty = await tlbAssetSpecialtyMapping.findOne({
        AssetId: mongoose.Types.ObjectId(AssetId),
        SpecialtyId: mongoose.Types.ObjectId(SpecialtyId),
        IsActive: true,
      });
      if (existingSpecialty) {
        // If the speciality is already present, return an error response
        return res.json(
          __requestResponse(
            "400",
            "This specialty is already assigned to the doctor."
          )
        );
      }
    }
    // If no duplicate is found, proceed to the next middleware
    next();
  } catch (error) {
    return res.json(__requestResponse("400", __SOME_ERROR)).status(400);
  }
};
module.exports = { checkAssetSpecialty };

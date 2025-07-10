const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const {
  __FIELD_ERROR,
  __SOME_ERROR,
  __DUPLICATE_ENTRY,
} = require("../../../utils/variable");
const AssetMaster = require("../../../models/AssetMaster");
const AssetCityMapping = require("../../../models/AssetCityMaping");
const { default: mongoose } = require("mongoose");

const _SaveAssetCityMapping = Joi.object({
  city_mapping_id: Joi.string().allow(null, ""),
  asset_id: Joi.string().required(),
  group_name: Joi.string().required(),
  city_id: Joi.string().required(),
  // city_group_id: Joi.array().items(Joi.string()).allow(null, []),
  city_group_id: Joi.array().items(Joi.string()).allow(null, ""),
  is_active: Joi.boolean().allow(null, ""),
});

const checkAssetCityMappingData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveAssetCityMapping.validate(req.body);
    if (error) {
      return res.json(
        __requestResponse("400", __VALIDATION_ERROR, error.details)
      );
    }

    // Check if the AssetId exists
    const assetExists = await AssetMaster.findById(req.body.asset_id);
    if (!assetExists) {
      return res.json(__requestResponse("400", "Invalid AssetId"));
    }

    // Check if the group_name already exists for the asset_id
    if (!req.body.city_mapping_id) {
      const existingMapping = await AssetCityMapping.findOne({
        AssetId: mongoose?.Types?.ObjectId (req.body.asset_id),
        GroupName: req.body.group_name,
      });
console.log(existingMapping, "test")
      if (existingMapping) {
        return res.json(
          __requestResponse(
            "400",
            __FIELD_ERROR,
            // __DUPLICATE_ENTRY,
            "Group name already exists for this asset."
          )
        );
      }
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkAssetCityMappingData };


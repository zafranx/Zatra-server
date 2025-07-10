const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveServiceEntity = Joi.object({
  service_entity_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
});

const checkServiceEntityData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveServiceEntity.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error.details));
    }

    // Get ServiceEntity Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_SERVICE_ENTITY",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Service Entity Asset Type not found.")
      );
    }

    // Check for duplicate Service Entity Name
    if (!req.body.service_entity_id) {
      const existingServiceEntity = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingServiceEntity) {
        return res.json(
          __requestResponse("400", "Service Entity already exists")
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkServiceEntityData };

const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SavePlantFactory = Joi.object({
  plant_factory_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  // entry_by: Joi.string().required(),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().required(),
  sub_category_id: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
});

const checkPlantFactoryData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SavePlantFactory.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get PlantFactory Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PLANT_FACTORY",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    // Check for duplicate Plant Factory Name
    if (!req.body.plant_factory_id) {
      const existingPlantFactory = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingPlantFactory) {
        return res.json(
          __requestResponse("400", "Plant Factory already exists")
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkPlantFactoryData };

const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveShop = Joi.object({
  shop_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().required(),
  name: Joi.string().required(),
  address_id: Joi.string().allow(null, ""),
  market_id: Joi.string().allow(null, ""),
  plant_factory_id: Joi.string().allow(null, ""),
  is_factory_outlet: Joi.boolean().allow(null, ""),
  is_shopping_mall: Joi.boolean().allow(null, ""),
});

const checkShopData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveShop.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get Shop Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_SHOP",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    // Check for duplicate Shop Name
    if (!req.body.shop_id) {
      const existingShop = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingShop) {
        return res.json(__requestResponse("400", "Shop already exists"));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkShopData };

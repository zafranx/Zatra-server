const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveMarket = Joi.object({
  market_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().required(),
  sub_category_id: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  address_id: Joi.string().allow(null, ""),
});

const checkMarketData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveMarket.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get Market Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_MARKET",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    // Check for duplicate Market Name
    if (!req.body.market_id) {
      const existingMarket = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingMarket) {
        return res.json(__requestResponse("400", "Market already exists"));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkMarketData };

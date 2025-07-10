const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveIndustryAssociation = Joi.object({
  industry_association_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
});

const checkIndustryAssociationData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveIndustryAssociation.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get IndustryAssociation Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_INDUSTRY_ASSOCIATION",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Industry Association Asset Type not found.")
      );
    }

    // Check for duplicate Industry Association Name
    if (!req.body.industry_association_id) {
      const existingIndustryAssociation = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingIndustryAssociation) {
        return res.json(
          __requestResponse("400", "Industry Association already exists")
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkIndustryAssociationData };

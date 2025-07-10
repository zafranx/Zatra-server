const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveIndustryAssociationOfficeBearer = Joi.object({
  office_bearer_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  title: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().allow(null, ""),
  email: Joi.string().email().allow(null, ""),
  profile_pic: Joi.string().allow(null, ""),
  profile_info: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
});

const checkIndustryAssociationOfficeBearersData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveIndustryAssociationOfficeBearer.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get IndustryAssociationOfficeBearer Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_INDUSTRY_ASSOCIATION_OFFICE",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse(
          "400",
          "Industry Association Office Bearer Asset Type not found."
        )
      );
    }

    // Check for duplicate Office Bearer Name
    if (!req.body.office_bearer_id) {
      const existingOfficeBearer = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingOfficeBearer) {
        return res.json(
          __requestResponse(
            "400",
            "Industry Association Office Bearer already exists"
          )
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkIndustryAssociationOfficeBearersData };

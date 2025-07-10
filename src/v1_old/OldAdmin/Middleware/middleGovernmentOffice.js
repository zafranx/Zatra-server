const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveGovernmentOffice = Joi.object({
  government_office_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().required(),
  name: Joi.string().required(),
  address_id: Joi.string().allow(null, ""),
});

const checkGovernmentOfficeData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveGovernmentOffice.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get GovernmentOffice Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_OFFICE",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Government Office Asset Type not found.")
      );
    }

    // Check for duplicate Government Office Name
    if (!req.body.government_office_id) {
      const existingGovernmentOffice = await AssetMaster.findOne({
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingGovernmentOffice) {
        return res.json(
          __requestResponse("400", "Government Office already exists")
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkGovernmentOfficeData };

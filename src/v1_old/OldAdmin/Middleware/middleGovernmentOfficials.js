const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveGovernmentOfficials = Joi.object({
  government_officials_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  title: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().allow(null, ""),
  email: Joi.string().allow(null, ""),
  profile_pic: Joi.string().allow(null, ""),
  profile_info: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
});

const checkGovernmentOfficialsData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveGovernmentOfficials.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get Government Officials Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_OFFICIALS",
    });

    // if (_AssetType) {
    //   req.body.asset_type_id = _AssetType.EnvSettingValue;
    // } else {
    //   return res.json(
    //     __requestResponse("400", "Government Officials Asset Type not found.")
    //   );
    // }

    // // Check for duplicate Government Official Name
    // if (!req.body.government_officials_id) {
    //   const existingOfficial = await AssetMaster.findOne({
    //     "GovernmentOfficials.Name": req.body.name,
    //     AssetTypeID: req.body.asset_type_id,
    //   });

    //   if (existingOfficial) {
    //     return res.json(
    //       __requestResponse("400", "Government Official already exists")
    //     );
    //   }
    // }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};


// checkGovernmentSchemeData
const _SaveGovernmentScheme = Joi.object({
  government_scheme_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  category_id: Joi.string().required(),
  address_id: Joi.string().allow(null, ""),
  title: Joi.string().required(),
  document: Joi.string().allow(null, ""),
  short_desc: Joi.string().allow(null, ""),
  long_desc: Joi.string().allow(null, ""),
  url: Joi.string().allow(null, ""),
});

const checkGovernmentSchemeData = async (req, res, next) => {
  try {
    const { error } = _SaveGovernmentScheme.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_SCHEME",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Government Scheme Asset Type not found.")
      );
    }

    if (!req.body.government_scheme_id) {
      const existingScheme = await AssetMaster.findOne({
        AssetName: req.body.title,
        AssetTypeID: req.body.asset_type_id,
      });

      if (existingScheme) {
        return res.json(
          __requestResponse("400", "Government Scheme already exists")
        );
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkGovernmentOfficialsData, checkGovernmentSchemeData };

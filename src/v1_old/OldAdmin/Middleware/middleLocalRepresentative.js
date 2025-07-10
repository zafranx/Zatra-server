const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveLocalRepresentative = Joi.object({
  local_representative_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  profile_pic: Joi.string().allow(null, ""),
  title: Joi.string().allow(null, ""),
  phone: Joi.number().allow(null, ""),
  email: Joi.string().allow(null, ""),
  picture_gallery: Joi.array().items(Joi.string()).allow(null, ""),
  videos: Joi.array().items(Joi.string()).allow(null, ""),
});

const checkLocalRepresentativeData = async (req, res, next) => {
  try {
    const { error } = _SaveLocalRepresentative.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_LOCAL_REPRESENTATIVE",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Local Representative Asset Type not found.")
      );
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkLocalRepresentativeData };

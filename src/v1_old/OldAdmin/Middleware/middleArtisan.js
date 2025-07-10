const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveArtisan = Joi.object({
  artisan_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  destination_id: Joi.string().allow(null, ""),
  art_and_craft_id: Joi.string().required(),
  name: Joi.string().required(),
  profile_pic: Joi.string().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  email: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
  certificates: Joi.array().items(Joi.string()).allow(null, ""),
  picture_gallery: Joi.array().items(Joi.string()).allow(null, ""),
  videos: Joi.array().items(Joi.string()).allow(null, ""),
});

const checkArtisanData = async (req, res, next) => {
  try {
    const { error } = _SaveArtisan.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_ARTISAN",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Artisan Asset Type not found.")
      );
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkArtisanData };

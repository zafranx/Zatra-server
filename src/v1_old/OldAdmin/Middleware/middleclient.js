const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const {
  __DUPLICATE_CLIENT,
  __VALIDATION_ERROR,
  __SOME_ERROR,
  __DUPLICATE_ADDRESS,
  __ADDRESS_LABEL_MISSING,
} = require("../../../utils/variable");
const tlbClient = require("../../../models/AssetMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

const _SaveClient = Joi.object({
  client_id: Joi.string().allow(null, ""),
  referring_user_id: Joi.string().allow(null, ""),
  parent_client_id: Joi.string().allow(null, ""),
  client_name: Joi.string().required(),
  legal_status_id: Joi.string().required(),
  client_type_id: Joi.string().required(),
  industry_id: Joi.string().required(),
  website: Joi.string().required(),
  entryBy: Joi.string().allow(null, ""),
});

const checkClientData = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _SaveClient.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    //get the Client Asset Type from Env settings
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_CLIENT",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    if (req.body.client_id == null || req.body.client_id == "") {
      //Check duplicate client names
      const _ClientList = await tlbClient.findOne({
        AssetName: req.body.client_name,
        AssetTypeID: req.body.asset_type_id,
      });
      if (_ClientList) {
        return res.json(__requestResponse("400", __DUPLICATE_CLIENT));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};
const _validateClientUser = Joi.object({
  client_user_id: Joi.string().allow(null, ""),
  first_name: Joi.string().required(),
  last_name: Joi.string().allow(null, ""),
  client_id: Joi.string().required(),
  gender: Joi.string().required(),
  mobile_no: Joi.string().required(),
  email_address: Joi.string().allow(null, ""),
  designation_id: Joi.string().required(),
  parent_user_id: Joi.string().allow(null, ""),
  profile_pic: Joi.string().allow(null, ""),
});
const checkClientUser = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _validateClientUser.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};
module.exports = { checkClientData, checkClientUser };

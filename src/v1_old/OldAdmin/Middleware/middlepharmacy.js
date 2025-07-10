const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const {
  __DUPLICATE_PHARMACY,
  __VALIDATION_ERROR,
  __SOME_ERROR,
} = require("../../../utils/variable");
const tlbPharmacy = require("../../../models/AssetMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

const _SavePharmacy = Joi.object({
  pharmacy_id: Joi.string().optional().allow(null, ""),
  parent_client_id: Joi.string().optional().allow(null, ""),
  entryBy: Joi.string().optional(),
  name: Joi.string().required(),
  contact_no: Joi.string().required(),
  postal_code: Joi.string().optional().allow(null, ""),
  email_address: Joi.string().email().optional().allow(null, ""),
  location_id: Joi.string().optional().allow(null, ""),
  registration_no: Joi.string().optional().allow(null, ""),
  website: Joi.string().optional().allow(null, ""),
});

const checkPharmacyData = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _SavePharmacy.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    //get the Pharmnacy Asset Type from Env settings
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PHARMACY",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    if (req.body.pharmacy_id == null || req.body.pharmacy_id == "") {
      // Check for duplicates based on EmailAddress and RegistrationNo
      const _PharmacyList = await tlbPharmacy.findOne({
        $or: [
          { "Pharmacy.EmailAddress": req.body.email_address },
          { "Pharmacy.RegistrationNo": req.body.registration_no },
        ],
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });
      if (_PharmacyList) {
        return res.json(__requestResponse("400", __DUPLICATE_PHARMACY));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = { checkPharmacyData };

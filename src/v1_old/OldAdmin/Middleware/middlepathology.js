const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const {
  __DUPLICATE_PATHOLOGY,
  __VALIDATION_ERROR,
  __SOME_ERROR,
  __DUPLICATE_ADDRESS,
  __ADDRESS_LABEL_MISSING,
} = require("../../../utils/variable");
const tlbPathology = require("../../../models/AssetMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

// const checkPathologyData = (req, res, next) => {
//   const schema = Joi.object({
//     pathology_id: Joi.string().optional().allow(null, ""),
//     parent_client_id: Joi.string().optional().allow(null, ""),
//     entryBy: Joi.string().required(),
//     name: Joi.string().required(),
//     contact_no: Joi.string().required(),
//     postal_code: Joi.string().optional().allow(null, ""),
//     email_address: Joi.string().email().optional().allow(null, ""),
//     location_id: Joi.string().optional().allow(null, ""),
//     registration_no: Joi.string().optional().allow(null, ""),
//     website: Joi.string().optional().allow(null, ""),
//   });

//   const { error } = schema.validate(req.body);
//   if (error) {
//     return res
//       .status(400)
//       .json(
//         __requestResponse(
//           "400",
//           error.details[0].message,
//           "ValidationError: " + error.details[0].message
//         )
//       );
//   }
//   next();
// };

const _SavePathology = Joi.object({
  pathology_id: Joi.string().optional().allow(null, ""),
  parent_client_id: Joi.string().optional().allow(null, ""),
  entryBy: Joi.string().optional().allow(null, ""),
  name: Joi.string().required(),
  contact_no: Joi.string().required(),
  postal_code: Joi.string().optional().allow(null, ""),
  email_address: Joi.string().email().optional().allow(null, ""),
  location_id: Joi.string().optional().allow(null, ""),
  registration_no: Joi.string().optional().allow(null, ""),
  website: Joi.string().optional().allow(null, ""),
});

const checkPathologyData = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _SavePathology.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    //get the Pharmnacy Asset Type from Env settings
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PATHOLOGY",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    if (req.body.pathology_id == null || req.body.pathology_id == "") {
      // Check for duplicates based on EmailAddress and RegistrationNo
      const _PharmacyList = await tlbPathology.findOne({
        $or: [
          { "Pathology.EmailAddress": req.body.email_address },
          { "Pathology.RegistrationNo": req.body.registration_no },
        ],
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });
      if (_PharmacyList) {
        return res.json(__requestResponse("400", __DUPLICATE_PATHOLOGY));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = { checkPathologyData };

const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const {
  __DUPLICATE_ENTRY,
  __VALIDATION_ERROR,
  __SOME_ERROR,
} = require("../../../utils/variable");
const tlbDoctor = require("../../../models/AssetMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

// Define the Joi schema for hospital validation
const _SaveHospital = Joi.object({
  hospital_id: Joi.string().allow(null, ""),
  parent_hospital_id: Joi.string().optional().allow(null, ""),
  referring_user_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().optional().allow(null, ""),
  entryBy: Joi.string().allow(null, ""),
  hospital_name: Joi.string().required(),
  profile_pic: Joi.string().allow(null, ""),
  contact_no: Joi.string().required(),
  email_address: Joi.string().email().optional().allow(null, ""),
  registration_year: Joi.string().required(),
  // speciality_id: Joi.array().items(Joi.string()).allow(null, ""),
  medical_speciality_id: Joi.array().items(Joi.string()).allow(null, ""),
  insurance_empanelment_id: Joi.array().items(Joi.string()).allow(null, ""),

  // accreditations: Joi.array().items(Joi.string()).optional().allow(null, ""),
  accreditations: Joi.array().items(Joi.string().allow(null, "")).optional(),
  clinical_excellence: Joi.array()
    .items(Joi.string().allow(null, ""))
    .optional(),
  // clinical_excellence: Joi.string().optional().allow(null, ""),
  hospital_profile: Joi.string().optional().allow(null, ""),
  hospital_type_id: Joi.string().allow(null, ""),
  no_of_bed: Joi.number().optional().allow(null, ""),
  no_of_ots: Joi.number().optional().allow(null, ""),
  no_of_icu_bed: Joi.number().optional().allow(null, ""),
  short_desc: Joi.string().optional().allow(null, ""),
  long_desc: Joi.string().optional().allow(null, ""),
  website: Joi.string().uri().optional().allow(null, ""),
  // therapy_id: Joi.string().optional().allow(null, ""),
  therapy_id: Joi.array().items(Joi.string()).allow(null, ""),
  isNABH: Joi.boolean().optional().allow(null, ""),
  isJCI: Joi.boolean().optional().allow(null, ""),
  location_id: Joi.string().optional().allow(null, ""),
  doctor_id: Joi.array().items(Joi.string()).allow(null, ""),
  lookup_type: Joi.array().items(Joi.string()).allow(null, ""),
});

const checkHospitalData = async (req, res, next) => {
  try {
    // Check the data hygiene
    const { error, value } = _SaveHospital.validate(req.body);
    console.log(value), "value";
    if (error) {
      console.log(error, "error");

      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get the Hospital Asset Type from Env settings (optional, if necessary)
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_HOSPITAL",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    if (req.body.hospital_id == null || req.body.hospital_id == "") {
      // Check for duplicate doctor based on first name, last name, and mobile number
      const _HospitalList = await tlbDoctor.findOne({
        $or: [
          { "Hospital.EmailAddress": req.body.email_address },
          { "Hospital.ContactNo": req.body.contact_no },
        ],
        AssetName: req.body.hospital_name,
        AssetTypeID: req.body.asset_type_id,
      });
      if (_HospitalList) {
        // console.log(_HospitalList, "_HospitalList");
        return res.json(__requestResponse("400", __DUPLICATE_ENTRY));
      }
    }

    next();
  } catch (error) {
    console.log(error, "error");
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkHospitalData };

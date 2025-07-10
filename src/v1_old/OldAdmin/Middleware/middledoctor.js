const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");

const {
  __DUPLICATE_DOCTOR,
  __VALIDATION_ERROR,
  __SOME_ERROR,
} = require("../../../utils/variable");
const tlbDoctor = require("../../../models/AssetMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

const _SaveDoctor = Joi.object({
  doctor_id: Joi.string().allow(null, ""),
  parent_client_id: Joi.string().allow(null, ""),
  referring_user_id: Joi.string().allow(null, ""),
  first_name: Joi.string().required(),
  last_name: Joi.string().allow(null, ""),
  //   qualification_and_experience: Joi.array().items(Joi.string()).allow(null, ""),
  //   awards_and_achievement: Joi.array().items(Joi.string()).allow(null, ""),
  qualification_and_experience: Joi.array()
    .items(
      Joi.object({
        qualification: Joi.string().optional().allow(""),
        year_of_passing: Joi.number().integer().optional().allow(""),
        institute: Joi.string().optional().allow(""),
        // institute: Joi.string().required(),
      })
    )
    .allow(null)
    .optional(),
  awards_and_achievement: Joi.array()
    .items(
      Joi.object({
        award: Joi.string().required().allow(""),
        year: Joi.number().integer().required().allow(""),
      })
    )
    .allow(null)
    .optional(),
  is_star: Joi.boolean().allow(null, ""),
  profile_pic: Joi.string().allow(null, ""),
  short_desc: Joi.string().allow(null, ""),
  long_desc: Joi.string().allow(null, ""),
  mobile_no: Joi.string().required(),
  email_address: Joi.string().allow(null, ""),
  // designation_id: Joi.string().allow(null, ""),
  designation_id: Joi.array().items(Joi.string()).allow(null, ""),
  // hospital: Joi.string().allow(null, ""),
  hospital: Joi.array().items(Joi.string()).allow(null, ""),
  // speciality_id: Joi.array().items(Joi.string()).allow(null, ""),
  // super_specialization_id: Joi.array().items(Joi.string()).allow(null, ""),
  postal_code: Joi.string().allow(null, ""),
  registration_no: Joi.string().allow(null, ""),
  profile_details: Joi.string().allow(null, ""),
  entryBy: Joi.string().allow(null, ""),
  // lookup type for showing the doctor in the list in diffrent websites like kcc bizaario
  lookup_type: Joi.array().items(Joi.string()).allow(null, ""),
});

const checkDoctorData = async (req, res, next) => {
  try {
    // Check the data hygiene
    const { error, value } = _SaveDoctor.validate(req.body);
    console.log(value), "value";
    if (error) {
      console.log(error, "error");

      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Get the Doctor Asset Type from Env settings (optional, if necessary)
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_DOCTOR",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    }

    if (req.body.doctor_id == null || req.body.doctor_id == "") {
      // Check for duplicate doctor based on first name, last name, and EmailAddress ,RegistrationNo
      const _DoctorList = await tlbDoctor.findOne({
        $or: [
          { "Doctor.EmailAddress": req.body.email_address },
          { "Doctor.RegistrationNo": req.body.registration_no },
        ],
        AssetName: req.body.name,
        AssetTypeID: req.body.asset_type_id,
      });
      if (_DoctorList) {
        // console.log(_DoctorList, "_DoctorList");
        return res.json(__requestResponse("400", __DUPLICATE_DOCTOR));
      }
    }

    next();
  } catch (error) {
    console.log(error, "error");
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

const _validateDoctorAttendent = Joi.object({
  doctor_attendant_id: Joi.string().allow(null, ""),
  mobile_no: Joi.string().required(),
  email_address: Joi.string().allow(null, ""),
  parent_user_id: Joi.string().allow(null, ""),
  profile_pic: Joi.string().allow(null, ""),
});
const checkDoctorAttendent = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _validateDoctorAttendent.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = { checkDoctorData, checkDoctorAttendent };

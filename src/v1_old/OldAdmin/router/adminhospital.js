const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __DATA_404,
  __HOSPITAL_SAVE_ERROR,
} = require("../../../utils/variable");

const tlbHospital = require("../../../models/AssetMaster");

const { checkHospitalData } = require("../Middleware/middlehospital");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
let APIEndPointNo = "";
// for hospital listing we are using GetAssetsList commmon api written in admindoctor


router.post("/SaveHospital", checkHospitalData, async (req, res) => {
  console.log(req.body.lookup_type, "lookup_type");
  try {
    const APIEndPointNo = "#KCC0004";
    let _hospital_id = req.body.hospital_id;
    let _lookup_type = req.body.lookup_type
      ? req.body.lookup_type.map((id) => mongoose.Types.ObjectId(id))
      : [];
    let _entryBy = req.body.entryBy;
    let _parentHospitalId = req.body.parent_hospital_id
      ? mongoose.Types.ObjectId(req.body.parent_hospital_id)
      : null;
    let _asset_type_id = req.body.asset_type_id
      ? mongoose.Types.ObjectId(req.body.asset_type_id)
      : null;
    // let _clientName = req.body.client_name;
    let _referUserId = req.body.referring_user_id
      ? mongoose.Types.ObjectId(req.body.referring_user_id)
      : null;

    // Hospital-specific fields
    let hospital_name = req.body.hospital_name;
    let profile_pic = req.body.profile_pic;
    let medical_speciality = req.body.medical_speciality_id
      ? req.body.medical_speciality_id.map((id) => mongoose.Types.ObjectId(id))
      : [];
    let insurance_empanelment = req.body.insurance_empanelment_id
      ? req.body.insurance_empanelment_id.map((id) =>
          mongoose.Types.ObjectId(id)
        )
      : [];
    // let postal_code = req.body.postal_code;
    let contact_no = req.body.contact_no;
    let email_address = req.body.email_address;
    let website = req.body.website;
    let registration_year = req.body.registration_year;
    let accreditations = req.body.accreditations || [];
    let clinical_excellence = req.body.clinical_excellence || [];
    // let clinical_excellence = req.body.clinical_excellence;
    let hospital_profile = req.body.hospital_profile;

    let HospitalType = req.body.hospital_type_id
      ? mongoose.Types.ObjectId(req.body.hospital_type_id)
      : null;
    // let TherapyId = req.body.therapy_id
    //   ? mongoose.Types.ObjectId(req.body.therapy_id)
    //   : null;
    let TherapyId = req.body.therapy_id
      ? req.body.therapy_id.map((id) => mongoose.Types.ObjectId(id))
      : [];

    let isNABH = req.body.isNABH;
    let isJCI = req.body.isJCI;
    let no_of_bed = req.body.no_of_bed;
    let no_of_icu_bed = req.body.no_of_icu_bed;
    let no_of_ots = req.body.no_of_ots;
    let short_desc = req.body.short_desc;
    let long_desc = req.body.long_desc;
    let LocationID = req.body.location_id
      ? mongoose.Types.ObjectId(req.body.location_id)
      : null;
    // let DoctorID = req.body.doctor_id
    //   ? mongoose.Types.ObjectId(req.body.doctor_id)
    //   : null;
    let DoctorID = req.body.doctor_id
      ? req.body.doctor_id.map((id) => mongoose.Types.ObjectId(id))
      : [];
    let _local_hospital_id = null;
    let _assetCode = await __AssetCode("HOSPITAL");

    let _hospitalData = {
      AssetCode: _assetCode,
      AssetTypeID: _asset_type_id, // getting from env settings - req.body.asset_type_id = _AssetType.EnvSettingValue;
      ParentID: _parentHospitalId,
      ReferralID: _referUserId,
      AssetName: hospital_name,
      EntryBy: _entryBy,
      UpdateBy: null,
      Hospital: {
        LookupType: _lookup_type,
        Name: hospital_name,
        ProfilePic: profile_pic,
        HospitalType: HospitalType,
        MedicalSpeciality: medical_speciality,
        InsurancePanels: insurance_empanelment,
        // PostalCode: postal_code,
        ContactNo: contact_no,
        EmailAddress: email_address,
        TherapyId: TherapyId,
        ClinicalExcellence: clinical_excellence,
        Website: website,
        RegistrationYear: registration_year,
        Accreditations: accreditations,
        HospitalProfile: hospital_profile,
        isNABH: isNABH,
        isJCI: isJCI,
        NoICUBeds: no_of_icu_bed,
        NoBeds: no_of_bed,
        NoOTs: no_of_ots,
        ShortDesc: short_desc,
        LongDesc: long_desc,
        LocationID: LocationID,
        DoctorID: DoctorID,
      },
    };

    if (!_hospital_id) {
      // Create new hospital
      await tlbHospital
        .create(_hospitalData)
        .then((x) => {
          _local_hospital_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __HOSPITAL_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _hospitalData,
        _local_hospital_id,
        _parentHospitalId,
        null
      );
    } else {
      // Update existing hospital
      const _oldrec = await tlbHospital.findOne({ _id: _hospital_id });

      const _hospitalUpdate = await tlbHospital.updateOne(
        { _id: _hospital_id },
        {
          $set: {
            ..._hospitalData,
            UpdateBy: _entryBy,
          },
        }
      );

      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _hospitalData,
        _hospital_id,
        _parentHospitalId,
        null
      );

      return res.json(__requestResponse("200", __SUCCESS, _hospitalUpdate));
    }
  } catch (error) {
    console.log(error, "error");
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

router.post("/HospitalList", async (req, res) => {
  try {
    const APIEndPointNo = "#KCC0005";
    const { parent_hospital_id } = req.body;

    // Fetch the Hospital Asset Type ID from Env Settings
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_HOSPITAL",
    });

    // Fetch the Hospital data with optional filtering based on ParentID
    const hospitalList = await tlbHospital
      .find(
        {
          ...(parent_hospital_id && { ParentID: parent_hospital_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        // Fields to return
        "ParentID EntryBy UpdateBy createdAt updatedAt Hospital"
      )
      // .populate({
      //   path: "ParentID Hospital.MedicalSpeciality Hospital.DoctorID Hospital.HospitalType Hospital.TherapyId",
      //   select: "lookup_value",
      // });
      .populate([
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId",
          select: "lookup_value",
        },
        {
          path: "ParentID",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
          select: "AssetName _id", // Select only name and ID of hospitals
        },
        {
          path: "Hospital.DoctorID",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
          select: "AssetName _id", // Select only name and ID of doctors
        },
        {
          path: "Hospital.LocationID",
          model: "address_master", // Refers to address_master schema
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
        },
      ]);

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    // Return the hospital list as a response
    // return res.json(__requestResponse("200", __SUCCESS, hospitalList));
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(hospitalList).map((item) => ({
          ...item, // Convert Mongoose document to plain object
          ProfilePic: item?.ProfilePic
            ? `${
                process.env.NODE_ENV === "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue
              }${item.ProfilePic}`
            : "",
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(
      __requestResponse(
        "500",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

module.exports = router;


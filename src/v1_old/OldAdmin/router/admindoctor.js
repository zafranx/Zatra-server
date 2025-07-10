const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __DOCTOR_SAVE_ERROR,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const tlbDoctor = require("../../../models/AssetMaster");
const tlbAssetSpecialtyMapping = require("../../../models/AssetSpecialtyMapping");

const {
  checkDoctorData,
  checkDoctorAttendent,
} = require("../Middleware/middledoctor");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
let APIEndPointNo = "";

router.post("/SaveDoctor", checkDoctorData, async (req, res) => {
  // console.log(req.body, "body");
  try {
    const APIEndPointNo = "#KCC0003";
    let _lookup_type = req.body.lookup_type
      ? req.body.lookup_type.map((id) => mongoose.Types.ObjectId(id))
      : [];
    let _doctor_id = req.body.doctor_id;
    let _entryBy = req.body.entryBy;
    let _parentClientId =
      req.body.parent_client_id && req.body.parent_client_id != ""
        ? mongoose.Types.ObjectId(req.body.parent_client_id)
        : null;
    let _asset_type_id =
      req.body.asset_type_id && req.body.asset_type_id != ""
        ? mongoose.Types.ObjectId(req.body.asset_type_id)
        : null; // getting from env setting from checkDoctorData(middledoctor)
    let _referUserId =
      req.body.referring_user_id && req.body.referring_user_id != ""
        ? mongoose.Types.ObjectId(req.body.referring_user_id)
        : null;
    let _clientName = req.body.client_name;

    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let qualification_and_experience =
      req.body.qualification_and_experience || [];
    let awards_and_achievement = req.body.awards_and_achievement || [];
    let is_star = req.body.is_star || false;
    let profile_pic = req.body.profile_pic;
    let short_desc = req.body.short_desc;
    let long_desc = req.body.long_desc;
    let mobile_no = req.body.mobile_no;
    let email_address = req.body.email_address;
    // let designation_id = req.body.designation_id
    //   ? mongoose.Types.ObjectId(req.body.designation_id)
    //   : null;
    let designation_id = req.body.designation_id
      ? req.body.designation_id.map((id) => mongoose.Types.ObjectId(id))
      : [];
    // let hospital = req.body.hospital;
    let hospital = req.body.hospital
      ? req.body.hospital.map((id) => mongoose.Types.ObjectId(id))
      : [];
    // let speciality = req.body.speciality_id
    //   ? req.body.speciality_id.map((id) => mongoose.Types.ObjectId(id))
    //   : [];
    // let super_specialization = req.body.super_specialization_id
    //   ? req.body.super_specialization_id.map((id) =>
    //       mongoose.Types.ObjectId(id)
    //     )
    //   : [];
    let postal_code = req.body.postal_code;
    let registration_no = req.body.registration_no;
    let profile_details = req.body.profile_details;

    // Create the full asset name from first name and last name
    const _assetName = `${first_name} ${last_name}`;
    // console.log(_assetName, "_assetName");
    let _local_doctor_id = null;
    // let _assetCode = "";
    // _assetCode = await __AssetCode("DOCTOR");
    let _assetCode = await __AssetCode("DOCTOR");
    let _doctorData = {
      AssetCode: _assetCode, // getting from env settings
      AssetTypeID: _asset_type_id, // getting from env settings - req.body.asset_type_id = _AssetType.EnvSettingValue;
      ParentID: _parentClientId,
      ReferralID: _referUserId,
      // AssetName: _clientName,
      AssetName: _assetName,

      EntryBy: _entryBy,
      UpdateBy: null,
      Doctor: {
        LookupType: _lookup_type,
        FirstName: first_name,
        LastName: last_name,
        QualificationAndExperience: qualification_and_experience,
        AwardsAndAchievement: awards_and_achievement,
        IsStar: is_star,
        ProfilePic: profile_pic,
        ShortDesc: short_desc,
        LongDesc: long_desc,
        MobileNo: mobile_no,
        EmailAddress: email_address,
        Designation: designation_id,
        Hospital: hospital,
        // Speciality: speciality,
        // SuperSpecialization: super_specialization,
        PostalCode: postal_code,
        RegistrationNo: registration_no,
        ProfileDetails: profile_details,
      },
    };

    if (!_doctor_id) {
      // Create new doctor
      await tlbDoctor
        .create(_doctorData)
        .then((x) => {
          _local_doctor_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __DOCTOR_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _doctorData,
        _local_doctor_id,
        _parentClientId,
        null
      );
    } else {
      // Update existing doctor
      const _oldrec = await tlbDoctor.findOne({ _id: _doctor_id });

      const _doctorUpdate = await tlbDoctor.updateOne(
        { _id: _doctor_id },
        {
          $set: {
            ..._doctorData,
            UpdateBy: _entryBy,
          },
        }
      );
      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _doctorData,
        _doctor_id,
        _parentClientId,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _doctorUpdate));
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

router.post("/GetAssetsList", async (req, res) => {
  try {
    const { AssetName } = req.body;
    if (!AssetName || AssetName.length == 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = new Array();
    const AssetTypeIDs = new Array();
    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        path: "Doctor.LookupType",
        select: "lookup_value",
      });
      populateData.push({
        // path: "Doctor.Designation Doctor.Speciality Doctor.SuperSpecialization",
        path: "Doctor.Designation",
        select: "lookup_value",
      });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters", // Refers to asset_masters schema for hospitals
        select: "AssetName _id", // Select only name and ID of hospitals
      });
      // populateData.push({
      //   path: "Doctor._id",
      //   model: "asset_specialty_mappings", // Reference to the admin_lookups collection
      //   select: "SpecialtyId SubSpeciality SuperSpecialization", // Select only lookup_value
      // });
      // populateData.push({
      //   path: "Doctor.LocationID",
      //   model: "address_master", // Refers to address_master schema
      //   // match: { IsCurrent: true }, // Filter for current address only
      //   populate: [
      //     { path: "CountryId", select: "lookup_value" },
      //     { path: "StateId", select: "lookup_value" },
      //     { path: "CityId", select: "lookup_value" },
      //     { path: "AddressTypeId", select: "lookup_value" },
      //   ],
      //   select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
      // });
    }
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push(
        { path: "Hospital.LookupType", select: "lookup_value" },
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
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
          // match: { IsCurrent: true }, // Filter for current address only
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
        }
      );
      // populateData.push({
      //   path: "Doctor.Hospital",
      //   select: "AssetName _id",
      // });
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }
    const list = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    // console.log(list, "list");
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          _id: item?._id,
          ParentID: item?.ParentID,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          // [item?.AssetTypeID?.lookup_value]:
          //   item[item?.AssetTypeID?.lookup_value],
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? (process.env.NODE_ENV == "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) +
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              : "",
          },
          // Doctor: {
          //   ...item.Doctor,
          //   ProfilePic: item.Doctor?.ProfilePic
          //     ? (process.env.NODE_ENV == "development"
          //         ? process.env.LOCAL_IMAGE_URL
          //         : __ImagePathDetails?.EnvSettingTextValue) +
          //       item.Doctor?.ProfilePic
          //     : "",
          // },
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/GetAssetsListnew", async (req, res) => {
  try {
    const { AssetName, _id } = req.body;
    if (!AssetName || AssetName.length == 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.json(__requestResponse("400", "Invalid Asset ID"));
    }

    const populateData = new Array();
    const AssetTypeIDs = new Array();
    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        path: "Doctor.LookupType",
        select: "lookup_value",
      });
      populateData.push({
        // path: "Doctor.Designation Doctor.Speciality Doctor.SuperSpecialization",
        path: "Doctor.Designation",
        select: "lookup_value",
      });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters", // Refers to asset_masters schema for hospitals
        select: "AssetName _id", // Select only name and ID of hospitals
      });
    }
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push(
        { path: "Hospital.LookupType", select: "lookup_value" },
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
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
          // match: { IsCurrent: true }, // Filter for current address only
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
        }
      );
      // populateData.push({
      //   path: "Doctor.Hospital",
      //   select: "AssetName _id",
      // });
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    let query = {
      AssetTypeID: { $in: AssetTypeIDs },
      // IsFavourite: false,
      _id: { $ne: new mongoose.Types.ObjectId(_id) },
    };

    // console.log("Query:", JSON.stringify(query, null, 2));

    const list = await AssetMaster.find(
      { query },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant "
    ).populate(populateData);

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    // console.log(list, "list");
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          _id: item?._id,
          ParentID: item?.ParentID,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          // [item?.AssetTypeID?.lookup_value]:
          //   item[item?.AssetTypeID?.lookup_value],
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? (process.env.NODE_ENV == "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) +
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              : "",
          },
          // Doctor: {
          //   ...item.Doctor,
          //   ProfilePic: item.Doctor?.ProfilePic
          //     ? (process.env.NODE_ENV == "development"
          //         ? process.env.LOCAL_IMAGE_URL
          //         : __ImagePathDetails?.EnvSettingTextValue) +
          //       item.Doctor?.ProfilePic
          //     : "",
          // },
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/GetAssetsList2", async (req, res) => {
  try {
    const { AssetName, _id } = req.body;

    // If no AssetName is provided, return an error
    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = [];
    const AssetTypeIDs = [];

    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push({ path: "Doctor.LookupType", select: "lookup_value" });
      populateData.push({ path: "Doctor.Designation", select: "lookup_value" });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters",
        select: "AssetName _id",
      });
    }

    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push(
        { path: "Hospital.LookupType", select: "lookup_value" },
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
          select: "lookup_value",
        },
        {
          path: "ParentID",
          model: "asset_masters",
          select: "AssetName _id",
        },
        {
          path: "Hospital.DoctorID",
          model: "asset_masters",
          select: "AssetName _id",
        },
        {
          path: "Hospital.LocationID",
          model: "address_master",
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation",
        }
      );
    }

    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push({
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    // Construct query object
    let query = {
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
      id: { $ne: req.body.id },
    };

    // If _id is provided, filter for a specific asset
    if (_id) {
      query._id = _id;
    }

    const list = await AssetMaster.find(
      query,
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No Data Found"));
    }

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        "Success",
        __deepClone(list).map((item) => ({
          _id: item?._id,
          ParentID: item?.ParentID,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? (process.env.NODE_ENV === "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) +
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              : "",
          },
        }))
      )
    );
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.json(__requestResponse("500", "Internal Server Error", error));
  }
});

router.post("/GetAssetsList3", async (req, res) => {
  try {
    const { AssetName, _id } = req.body;

    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = [];
    const AssetTypeIDs = [];

    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push({ path: "Doctor.LookupType", select: "lookup_value" });
      populateData.push({ path: "Doctor.Designation", select: "lookup_value" });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters",
        select: "AssetName _id",
      });
    }

    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push(
        { path: "Hospital.LookupType", select: "lookup_value" },
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
          select: "lookup_value",
        },
        {
          path: "ParentID",
          model: "asset_masters",
          select: "AssetName _id",
        },
        {
          path: "Hospital.DoctorID",
          model: "asset_masters",
          select: "AssetName _id",
        },
        {
          path: "Hospital.LocationID",
          model: "address_master",
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation",
        }
      );
    }

    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push({
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    // ✅ Construct Query Object
    let query = {
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
    };

    // ✅ If `_id` is provided, filter by `_id`
    if (_id) {
      query._id = new mongoose.Types.ObjectId(_id);
    }

    const list = await AssetMaster.find(
      query,
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No Data Found"));
    }

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        "Success",
        __deepClone(list).map((item) => ({
          _id: item?._id,
          ParentID: item?.ParentID,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? (process.env.NODE_ENV === "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) +
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              : "",
          },
        }))
      )
    );
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.json(__requestResponse("500", "Internal Server Error", error));
  }
});

router.post("/GetAssetsList4", async (req, res) => {
  try {
    const { AssetName, _id } = req.body;

    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.json(__requestResponse("400", "Invalid Asset ID"));
    }
    const populateData = [];
    const AssetTypeIDs = [];

    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });

      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }

      AssetTypeIDs.push(_AssetType.EnvSettingValue);
      populateData.push({ path: "Doctor.LookupType", select: "lookup_value" });
      populateData.push({ path: "Doctor.Designation", select: "lookup_value" });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters",
        select: "AssetName _id",
      });
    }

    let query = {
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
      _id: new mongoose.Types.ObjectId(_id),
    };

    // if (_id) {
    //   if (!mongoose.Types.ObjectId.isValid(_id)) {
    //     return res.json(__requestResponse("400", "Invalid Asset ID"));
    //   }
    //   query._id = new mongoose.Types.ObjectId(_id);
    // }

    console.log("Query:", JSON.stringify(query, null, 2));

    const list = await AssetMaster.find(query).populate(populateData);

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No Data Found"));
    }

    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        "Success",
        list.map((item) => ({
          _id: item?._id,
          AssetName: item?.AssetName,
          AssetTypeID: item?.AssetTypeID,
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? `${__ImagePathDetails?.EnvSettingTextValue}${
                  item[item?.AssetTypeID?.lookup_value]?.ProfilePic
                }`
              : "",
          },
        }))
      )
    );
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.json(__requestResponse("500", "Internal Server Error", error));
  }
});

router.post("/GetAssetsList_test", async (req, res) => {
  try {
    const { AssetName } = req.body;
    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = [];
    const AssetTypeIDs = [];

    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    let isDoctorType = false;

    // Handling for ASSET_TYPE_DOCTOR
    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      isDoctorType = true;

      // Populate doctor-related fields
      populateData.push({
        path: "Doctor.Designation",
        select: "lookup_value",
      });
      populateData.push({
        path: "Doctor.Hospital",
        model: "asset_masters",
        select: "AssetName _id",
      });
    }

    // Handling for ASSET_TYPE_HOSPITAL
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);

      populateData.push(
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId",
          select: "lookup_value",
        },
        {
          path: "ParentID",
          model: "asset_masters",
          select: "AssetName _id",
        },
        {
          path: "Hospital.LocationID",
          model: "address_master",
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation",
        }
      );
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }
    // Fetch assets with the specified AssetTypeIDs
    const list = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }

    let specialtiesMap = {};

    // Only fetch specialities if AssetType is Doctor
    if (isDoctorType) {
      const doctorIds = list
        .filter((item) => item.AssetTypeID?.lookup_value === "Doctor")
        .map((item) => item._id);

      if (doctorIds.length > 0) {
        const specialities = await tlbAssetSpecialtyMapping
          .find({
            AssetId: { $in: doctorIds },
          })
          .populate({
            path: "SpecialtyId SubSpeciality SuperSpecialization",
            select: "lookup_value",
          });

        // Map specialties to doctors by AssetId
        specialities.forEach((specialty) => {
          specialtiesMap[specialty.AssetId] = {
            Specialty: specialty.SpecialtyId?.lookup_value || "",
            SubSpeciality:
              specialty.SubSpeciality?.map((sub) => sub.lookup_value) || [],
            SuperSpecialization:
              specialty.SuperSpecialization?.map(
                (superSpec) => superSpec.lookup_value
              ) || [],
          };
        });
      }
    }

    // Fetch image path setting
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    // Construct the response
    const responseList = __deepClone(list).map((item) => {
      let doctorSpecialties = {};

      // Include specialities only if it's a doctor asset type
      if (isDoctorType && item.AssetTypeID?.lookup_value === "Doctor") {
        doctorSpecialties = specialtiesMap[item._id] || {};
      }

      return {
        _id: item?._id,
        ParentID: item?.ParentID,
        AssetName: item?.AssetName,
        AssetCode: item?.AssetCode,
        AssetTypeID: item?.AssetTypeID,
        [item?.AssetTypeID?.lookup_value]: {
          ...item[item?.AssetTypeID?.lookup_value],
          Specialties: doctorSpecialties,
          ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
            ? (process.env.NODE_ENV === "development"
                ? process.env.LOCAL_IMAGE_URL
                : __ImagePathDetails?.EnvSettingTextValue) +
              item[item?.AssetTypeID?.lookup_value]?.ProfilePic
            : "",
        },
      };
    });

    return res.json(__requestResponse("200", __SUCCESS, responseList));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// not in use
router.post("/DoctorList", async (req, res) => {
  try {
    const APIEndPointNo = "#KCC0006";
    const { parent_client_id } = req.body;

    // Fetch the Doctor Asset Type ID from Env Settings
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_DOCTOR",
    });

    // Fetch the Doctor data with optional filtering based on ParentID
    const doctorList = await tlbDoctor
      .find(
        {
          ...(parent_client_id && { ParentID: parent_client_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        // Fields to return
        "ParentID EntryBy UpdateBy createdAt updatedAt Doctor"
      )
      .populate([
        {
          path: "ParentID",
          select: "lookup_value",
        },
        {
          path: "Doctor.Hospital",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
          select: "AssetName _id", // Select only name and ID of hospitals
        },
        // {
        //   path: "Doctor.LocationID", // Assuming LocationID is referenced directly
        //   model: "address_master", // Refers to address_master schema
        //   // match: { IsCurrent: true }, // Filter for current address only
        //   populate: [
        //     { path: "CountryId", select: "lookup_value" },
        //     { path: "StateId", select: "lookup_value" },
        //     { path: "CityId", select: "lookup_value" },
        //     { path: "AddressTypeId", select: "lookup_value" },
        //   ],
        //   select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
        // },
        {
          path: "Doctor.Designation Doctor.Speciality", // Populate additional fields if required
          select: "lookup_value",
        },
      ]);

    // Return the doctor list as a response
    return res.json(__requestResponse("200", __SUCCESS, doctorList));
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

// for hospital drop down on adding doctor
router.post("/GetAssetName", async (req, res) => {
  try {
    const { AssetName } = req.body;
    if (!AssetName || AssetName.length == 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = new Array();
    const AssetTypeIDs = new Array();
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)")
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);

      // populateData.push({
      //   path: "Doctor.Designation Doctor.Speciality Doctor.Hospital Doctor.SuperSpecialization",
      //   select: "lookup_value",
      // });
    }
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      // populateData.push({
      //   // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
      //   path: "Hospital.MedicalSpeciality",
      //   select: "lookup_value",
      // });
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const _AssetType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!_AssetType) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Asset Type Env (ASSET_TYPE_ATTENDANT)"
          )
        );
      }
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      // populateData.push({
      //   // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
      //   path: "Attendant.LocationID",
      //   select: "lookup_value",
      // });
    }
    const list = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant "
    ).populate(populateData);

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    // console.log(list, "list");
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          _id: item?._id,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          // [item?.AssetTypeID?.lookup_value]:
          //   item[item?.AssetTypeID?.lookup_value],
          [item?.AssetTypeID?.lookup_value]: {
            // ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? (process.env.NODE_ENV == "development"
                  ? process.env.LOCAL_IMAGE_URL
                  : __ImagePathDetails?.EnvSettingTextValue) +
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              : "",
          },
          // Doctor: {
          //   ...item.Doctor,
          //   ProfilePic: item.Doctor?.ProfilePic
          //     ? (process.env.NODE_ENV == "development"
          //         ? process.env.LOCAL_IMAGE_URL
          //         : __ImagePathDetails?.EnvSettingTextValue) +
          //       item.Doctor?.ProfilePic
          //     : "",
          // },
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// not in use
router.post("/GetAssetNamesx_no_use", async (req, res) => {
  try {
    const { AssetName } = req.body;

    // Validate AssetName input
    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const AssetTypeIDs = [];
    const populateData = [];

    // Determine asset types to include based on the AssetName provided
    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const doctorType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!doctorType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_DOCTOR)")
        );
      }
      AssetTypeIDs.push(doctorType.EnvSettingValue);
      populateData.push({ path: "Doctor", select: "FirstName" });
    }

    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const hospitalType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!hospitalType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_HOSPITAL)")
        );
      }
      AssetTypeIDs.push(hospitalType.EnvSettingValue);
      populateData.push({ path: "Hospital", select: "Name" });
    }

    if (AssetName.includes("ASSET_TYPE_PHARMACY")) {
      const pharmacyType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_PHARMACY",
      });
      if (!pharmacyType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_PHARMACY)")
        );
      }
      AssetTypeIDs.push(pharmacyType.EnvSettingValue);
      populateData.push({ path: "Pharmacy", select: "PharmacyName" });
    }

    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const attendantType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!attendantType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_ATTENDANT)")
        );
      }
      AssetTypeIDs.push(attendantType.EnvSettingValue);
      populateData.push({ path: "Attendant", select: "Name" });
    }

    if (AssetName.includes("ASSET_TYPE_CLIENT")) {
      const clientType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_CLIENT",
      });
      if (!clientType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_CLIENT)")
        );
      }
      AssetTypeIDs.push(clientType.EnvSettingValue);
      populateData.push({ path: "Client", select: "ClientName" });
    }

    if (AssetName.includes("ASSET_TYPE_PATHOLOGY")) {
      const pathologyType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_PATHOLOGY",
      });
      if (!pathologyType) {
        return res.json(
          __requestResponse("400", "Invalid Asset Type (ASSET_TYPE_PATHOLOGY)")
        );
      }
      AssetTypeIDs.push(pathologyType.EnvSettingValue);
      populateData.push({ path: "Pathology", select: "PathologyName" });
    }

    // Query AssetMaster based on AssetTypeIDs
    const assets = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs } },
      "_id AssetTypeID"
    ).populate(populateData);

    if (!assets || assets.length === 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }

    // Map the response to include only _id and name based on the asset type
    const assetList = assets.map((item) => {
      const assetType = item?.AssetTypeID?.lookup_value;
      return {
        _id: item._id,
        name:
          item[assetType]?.[`${assetType}Name`] ||
          item[assetType]?.FirstName ||
          item[assetType]?.Name,
      };
    });

    return res.json(__requestResponse("200", __SUCCESS, assetList));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/SaveDoctorAttendent", checkDoctorAttendent, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0002";
    const {
      doctor_attendant_id, //for edit
      mobile_no,
      email_address,
      parent_user_id, // parent doctor id
      profile_pic,
    } = req.body;
    let client_id = parent_user_id; // for passing client id in audit log
    let _local_doctor_attendent_id = null;
    let _assetCode = await __AssetCode("ATTENDANT");

    if (!doctor_attendant_id) {
      const AssetTypeDetails = await tlbEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });

      if (!AssetTypeDetails) {
        return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
      }

      let _doctorAttendantData = {
        AssetCode: _assetCode,
        AssetTypeID: AssetTypeDetails?.EnvSettingValue,
        ParentID: parent_user_id,
        // AssetName: [first_name, last_name].join(" "),
        Attendant: {
          // FirstName: first_name,
          // LastName: last_name,
          MobileNo: mobile_no,
          EmailAddress: email_address,
          ProfilePic: profile_pic,
        },
      };

      await tlbDoctor
        .create(_doctorAttendantData)
        .then((x) => {
          _local_doctor_attendent_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __CLIENT_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _doctorAttendantData,
        _local_doctor_attendent_id,
        client_id,
        null
      );
    } else {
      //get the Old Record to save in Audit log
      const _oldrec = await tlbDoctor.findOne({ _id: doctor_attendant_id });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "Client User not found"));
      }
      let _doctorAttendantData = {
        AssetTypeID: _oldrec?.AssetTypeID,
        // ReferralID: _oldrec?.ReferralID || null,
        ParentID: parent_user_id,
        // AssetName: [first_name, last_name].join(" "),
        // UpdateBy: _entryBy,
        Attendant: {
          MobileNo: mobile_no,
          EmailAddress: email_address,
          ProfilePic: profile_pic,
        },
      };
      const _attendantUpdate = await tlbDoctor.updateOne(
        { _id: doctor_attendant_id },
        {
          $set: _doctorAttendantData,
        }
      );
      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _doctorAttendantData,
        doctor_attendant_id,
        client_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _attendantUpdate));
    }
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

router.post("/GetDoctorAttendentListing", async (req, res) => {
  try {
    const { parent_client_id } = req.body;

    const AssetTypeDetails = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_ATTENDANT",
    });
    if (!AssetTypeDetails) {
      return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
    }
    const __parentId = mongoose.Types.ObjectId.isValid(parent_client_id)
      ? mongoose?.Types?.ObjectId(parent_client_id)
      : null;
    if (!__parentId) {
      return res.json(__requestResponse("400", "Invalid parent Id"));
    }
    const __assetTypeId = mongoose.Types.ObjectId.isValid(
      AssetTypeDetails?.EnvSettingValue
    )
      ? mongoose?.Types?.ObjectId(AssetTypeDetails?.EnvSettingValue)
      : null;
    if (!__assetTypeId) {
      return res.json(__requestResponse("400", "Invalid Asset Type Id"));
    }

    const populateData = new Array();
    populateData.push({
      path: "Attendant.LocationID",
      select: "lookup_value",
    });
    // "AssetName AssetCode ParentID User User.FirstName User.LastName User.MobileNo User.EmailAddress User.ProfilePic User.Designation"
    const list = await AssetMaster.find(
      {
        AssetTypeID: __assetTypeId,
        ParentID: __parentId,
      },
      "AssetName AssetCode ParentID Attendant"
    ).populate(populateData);

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          ...item,
          Attendant: {
            ...item.Attendant,
            ...(item?.Attendant?.ProfilePic
              ? {
                  ProfilePic:
                    __ImagePathDetails?.EnvSettingTextValue +
                    item?.Attendant?.ProfilePic,
                }
              : { ProfilePic: "" }),
          },
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/DoctorList_not_in_use", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0003";
    const { parent_client_id } = req.body;
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_DOCTOR",
    });
    // Fetch the Doctor data with optional filtering based on ParentID
    const doctorList = await tlbDoctor
      .find(
        {
          ...(parent_client_id && { ParentID: parent_client_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        // Fields to return
        "ParentID EntryBy UpdateBy createdAt updatedAt Doctor"
      )
      .populate({
        path: "ParentID Doctor.Designation Doctor.Speciality Doctor.SuperSpecialization",
        select: "lookup_value FirstName LastName",
      });

    return res.json(__requestResponse("200", __SUCCESS, doctorList));
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

const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const AssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
let APIEndPointNo = "";
// asset list api for doctor, hospital, attendant etc  and all assets types without paging
router.post("/GetAssetsList_ForWebsite", async (req, res) => {
  try {
    // console.log(req.body, "body");
    const { AssetName, LookupType } = req.body;

    if (!AssetName || AssetName?.length === 0) {
      return res.json(__requestResponse("400", "Please provide an AssetName"));
    }
    // if (!LookupType || LookupType?.length === 0) {
    //   return res.json(__requestResponse("400", "Please provide LookupType(s)"));
    // }

    const populateData = [];
    const AssetTypeIDs = [];

    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    // Handle Doctor
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

      populateData.push(
        {
          path: "Doctor.LookupType",
          model: "admin_lookups",
          select: "lookup_value",
        },
        {
          path: "Doctor.Designation",
          model: "admin_lookups",
          select: "lookup_value", // Include Designation lookup_value
        },
        {
          path: "Doctor.Hospital",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
          select: "AssetName _id", // Select only name and ID of hospitals
        }
      );
    }

    // Handle Hospital
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

    // Handle Attendant
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
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    // Fetch Assets
    const list = await AssetMaster.find(
      {
        AssetTypeID: { $in: AssetTypeIDs },
        IsFavourite: false,
      },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No data found."));
    }

    // Filter LookupType at the application level for doctors
    const filteredList =
      AssetName.includes("ASSET_TYPE_DOCTOR") && LookupType?.length
        ? list.filter((item) =>
            item.Doctor?.LookupType?.some((lookup) =>
              LookupType.includes(lookup.lookup_value)
            )
          )
        : list;

    if (filteredList.length === 0) {
      return res.json(__requestResponse("404", "No data found."));
    }

    // Fetch IMAGE_PATH
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const imageBasePath =
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_IMAGE_URL
        : __ImagePathDetails?.EnvSettingTextValue;

    // Construct response
    return res.json(
      __requestResponse(
        "200",
        "Success",
        __deepClone(filteredList).map((item) => ({
          _id: item?._id,
          ParentID: item?.ParentID,
          AssetName: item?.AssetName,
          AssetCode: item?.AssetCode,
          AssetTypeID: item?.AssetTypeID,
          [item?.AssetTypeID?.lookup_value]: {
            ...item[item?.AssetTypeID?.lookup_value],
            ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              ? `${imageBasePath}${
                  item[item?.AssetTypeID?.lookup_value]?.ProfilePic
                }`
              : "",
          },
        }))
      )
    );
  } catch (error) {
    console.error("Error in GetAssetsList_ForWebsite:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// asset list api for doctor, hospital, attendant etc  and all assets types with paging
router.post("/GetAssetsList_ForWebsite-with-paging", async (req, res) => {
  try {
    const { AssetName, LookupType, page = 1, limit = 20 } = req.body;

    if (!AssetName || AssetName?.length === 0) {
      return res.json(__requestResponse("400", "Please provide an AssetName"));
    }

    const populateData = [];
    const AssetTypeIDs = [];
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Always populate the AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    // Handle Doctor
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

      populateData.push(
        {
          path: "Doctor.LookupType",
          model: "admin_lookups",
          select: "lookup_value",
        },
        {
          path: "Doctor.Designation",
          model: "admin_lookups",
          select: "lookup_value",
        },
        {
          path: "Doctor.Hospital",
          model: "asset_masters",
          select: "AssetName _id",
        }
      );
    }

    // Handle Hospital
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

    // Handle Attendant
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
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    // Fetch Assets with paging and sorting
    const list = await AssetMaster.find(
      {
        AssetTypeID: { $in: AssetTypeIDs },
        IsFavourite: false,
      },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    )
      .populate(populateData)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    // Total count for pagination
    const totalRecords = await AssetMaster.countDocuments({
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
    });

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No data found."));
    }

    // Filter LookupType at the application level for doctors
    const filteredList =
      AssetName.includes("ASSET_TYPE_DOCTOR") && LookupType?.length
        ? list.filter((item) =>
            item.Doctor?.LookupType?.some((lookup) =>
              LookupType.includes(lookup.lookup_value)
            )
          )
        : list;

    if (filteredList.length === 0) {
      return res.json(__requestResponse("404", "No data found."));
    }

    // Fetch IMAGE_PATH
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const imageBasePath =
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_IMAGE_URL
        : __ImagePathDetails?.EnvSettingTextValue;

    // Construct response
    const response = {
      totalRecords,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalRecords / pageSize),
      records: __deepClone(filteredList).map((item) => ({
        _id: item?._id,
        ParentID: item?.ParentID,
        AssetName: item?.AssetName,
        AssetCode: item?.AssetCode,
        AssetTypeID: item?.AssetTypeID,
        [item?.AssetTypeID?.lookup_value]: {
          ...item[item?.AssetTypeID?.lookup_value],
          ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
            ? `${imageBasePath}${
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              }`
            : "",
        },
      })),
    };

    return res.json(__requestResponse("200", "Success", response));
  } catch (error) {
    console.error("Error in GetAssetsList_ForWebsite:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

router.post("/GetAssetsList_ForWebsite-with-paging2", async (req, res) => {
  try {
    const { AssetName, LookupType, page = 1, limit = 20 } = req.body;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please provide an AssetName"));
    }

    // Fetch AssetTypeIDs
    const AssetTypeIDs = [];
    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const doctorType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!doctorType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (DOCTOR)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(doctorType.EnvSettingValue));
    }
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const hospitalType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!hospitalType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (HOSPITAL)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(hospitalType.EnvSettingValue));
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const attendantType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!attendantType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ATTENDANT)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(attendantType.EnvSettingValue));
    }

    // Aggregation Pipeline
    const pipeline = [
      {
        $match: {
          AssetTypeID: { $in: AssetTypeIDs },
          IsFavourite: false,
        },
      },

      // Lookup for AssetTypeID
      {
        $lookup: {
          from: "admin_lookups",
          localField: "AssetTypeID",
          foreignField: "_id",
          as: "AssetTypeID",
        },
      },
      { $unwind: "$AssetTypeID" },

      // Lookup for Doctor Specialties
      {
        $lookup: {
          from: "asset_specialty_mappings",
          localField: "_id", // AssetId in asset_masters
          foreignField: "AssetId", // AssetId in asset_specialty_mappings
          as: "Specialties",
        },
      },

      // Lookup for Doctor Details
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Specialties.SpecialtyId",
          foreignField: "_id",
          as: "Specialties.SpecialtyId",
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Specialties.SubSpeciality",
          foreignField: "_id",
          as: "Specialties.SubSpeciality",
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Specialties.SuperSpecialization",
          foreignField: "_id",
          as: "Specialties.SuperSpecialization",
        },
      },

      // Lookup for Hospital Details
      {
        $lookup: {
          from: "asset_masters",
          localField: "Doctor.Hospital",
          foreignField: "_id",
          as: "Doctor.Hospitals",
        },
      },

      // Lookup for LookupType in Doctor
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Doctor.LookupType",
          foreignField: "_id",
          as: "Doctor.LookupType",
          select: { lookup_value: { $in: [LookupType, "For_All"] } },
        },
      },

      // Apply pagination
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },

      // Project only necessary fields
      {
        $project: {
          _id: 1,
          AssetName: 1,
          AssetCode: 1,
          "AssetTypeID._id": 1,
          "AssetTypeID.lookup_value": 1,
          "Doctor.LookupType": 1,
          "Doctor.FirstName": 1,
          "Doctor.LastName": 1,
          "Doctor.ProfilePic": 1,
          "Doctor.EmailAddress": 1,
          "Doctor.MobileNo": 1,
          "Doctor.RegistrationNo": 1,
          "Doctor.Hospitals.AssetName": 1,
          "Specialties.SpecialtyId.lookup_value": 1,
          "Specialties.SubSpeciality.lookup_value": 1,
          "Specialties.SuperSpecialization.lookup_value": 1,
          "Doctor.QualificationAndExperience": 1,
          "Doctor.AwardsAndAchievement": 1,
          "Doctor.ProfilePic": 1,
          "Doctor.ShortDesc": 1,
          "Doctor.LongDesc": 1,
          "Doctor.MobileNo": 1,
          "Doctor.EmailAddress": 1,
          "Doctor.PostalCode": 1,
          "Doctor.RegistrationNo": 1,
          "Doctor.ProfileDetails": 1,
        },
      },
    ];

    // Execute aggregation
    const doctorsList = await AssetMaster.aggregate(pipeline);

    // Fetch total count
    const totalCount = await AssetMaster.countDocuments({
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
    });

    // Fetch IMAGE_PATH setting
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    const imageBasePath =
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_IMAGE_URL
        : __ImagePathDetails?.EnvSettingTextValue;

    // Construct response
    const response = {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      records: __deepClone(doctorsList).map((item) => ({
        _id: item?._id,
        AssetName: item?.AssetName,
        AssetCode: item?.AssetCode,
        AssetTypeID: item?.AssetTypeID,
        [item?.AssetTypeID?.lookup_value]: {
          ...item[item?.AssetTypeID?.lookup_value],
          ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
            ? `${imageBasePath}${
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              }`
            : "",
        },
      })),
    };

    return res.json(__requestResponse("200", "Success", response));
  } catch (error) {
    console.error("Error in GetAssetsList_ForWebsite:", error);
    return res.json(__requestResponse("500", "Internal server error", error));
  }
});

router.post("/GetAssetsList_ForWebsite-with-paging21-new", async (req, res) => {
  try {
    const { AssetName, LookupType, page = 1, limit = 20 } = req.body;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please provide an AssetName"));
    }

    // Fetch AssetTypeIDs
    const AssetTypeIDs = [];
    if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
      const doctorType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_DOCTOR",
      });
      if (!doctorType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (DOCTOR)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(doctorType.EnvSettingValue));
    }
    if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
      const hospitalType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_HOSPITAL",
      });
      if (!hospitalType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (HOSPITAL)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(hospitalType.EnvSettingValue));
    }
    if (AssetName.includes("ASSET_TYPE_ATTENDANT")) {
      const attendantType = await AdminEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_ATTENDANT",
      });
      if (!attendantType)
        return res.json(
          __requestResponse("400", "Invalid Asset Type Env (ATTENDANT)")
        );
      AssetTypeIDs.push(mongoose.Types.ObjectId(attendantType.EnvSettingValue));
    }

    // Aggregation Pipeline
    const pipeline = [
      {
        $match: {
          AssetTypeID: { $in: AssetTypeIDs },
          IsFavourite: false,
        },
      },

      // Lookup for AssetTypeID
      {
        $lookup: {
          from: "admin_lookups",
          localField: "AssetTypeID",
          foreignField: "_id",
          as: "AssetTypeID",
        },
      },
      { $unwind: "$AssetTypeID" },

      // Lookup for Specialties using `let` and `$expr`
      {
        $lookup: {
          from: "asset_specialty_mappings",
          let: { assetId: "$_id" }, // Pass current asset's _id
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$AssetId", "$$assetId"] }, // Match asset's _id
              },
            },
            {
              $lookup: {
                from: "admin_lookups",
                localField: "SpecialtyId",
                foreignField: "_id",
                as: "Specialty",
              },
            },
            {
              $lookup: {
                from: "admin_lookups",
                localField: "SubSpeciality",
                foreignField: "_id",
                as: "SubSpeciality",
              },
            },
            {
              $lookup: {
                from: "admin_lookups",
                localField: "SuperSpecialization",
                foreignField: "_id",
                as: "SuperSpecialization",
              },
            },
            {
              $project: {
                Specialty: { _id: 1, lookup_value: 1 },
                SubSpeciality: { _id: 1, lookup_value: 1 },
                SuperSpecialization: { _id: 1, lookup_value: 1 },
              },
            },
          ],
          as: "Specialties",
        },
      },

      // Lookup for LookupType in Doctor
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Doctor.LookupType",
          foreignField: "_id",
          as: "Doctor.LookupType",
        },
      },
      {
        $match: {
          $or: [
            { "Doctor.LookupType.lookup_value": { $in: LookupType } },
            { "Doctor.LookupType.lookup_value": "For_All" },
          ],
        },
      },

      // // Lookup for Specialties (Multi-step lookup)
      // {
      //   $lookup: {
      //     from: "asset_specialty_mappings",
      //     localField: "_id", // AssetId in asset_masters
      //     foreignField: "AssetId", // AssetId in asset_specialty_mappings
      //     as: "Specialties",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "admin_lookups",
      //     localField: "Specialties.SpecialtyId",
      //     foreignField: "_id",
      //     as: "Specialties.Specialty",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "admin_lookups",
      //     localField: "Specialties.SubSpeciality",
      //     foreignField: "_id",
      //     as: "Specialties.SubSpeciality",
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "admin_lookups",
      //     localField: "Specialties.SuperSpecialization",
      //     foreignField: "_id",
      //     as: "Specialties.SuperSpecialization",
      //   },
      // },

      // // Lookup for LookupType in Doctor
      // {
      //   $lookup: {
      //     from: "admin_lookups",
      //     localField: "Doctor.LookupType",
      //     foreignField: "_id",
      //     as: "Doctor.LookupType",
      //   },
      // },
      // {
      //   $match: {
      //     $or: [
      //       { "Doctor.LookupType.lookup_value": { $in: LookupType } },
      //       { "Doctor.LookupType.lookup_value": "For_All" },
      //     ],
      //   },
      // },

      // Lookup for Hospital Details
      {
        $lookup: {
          from: "asset_masters",
          localField: "Doctor.Hospital",
          foreignField: "_id",
          as: "Doctor.Hospitals",
        },
      },

      // Apply pagination
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },

      // Project only necessary fields
      {
        $project: {
          _id: 1,
          AssetName: 1,
          AssetCode: 1,
          "AssetTypeID._id": 1,
          "AssetTypeID.lookup_value": 1,
          "Doctor.LookupType": 1,
          "Doctor.FirstName": 1,
          "Doctor.LastName": 1,
          "Doctor.ProfilePic": 1,
          "Doctor.EmailAddress": 1,
          "Doctor.MobileNo": 1,
          "Doctor.RegistrationNo": 1,
          "Doctor.Hospitals.AssetName": 1,
          // "Specialties.Specialty.lookup_value": 1,
          // "Specialties.SubSpeciality.lookup_value": 1,
          // "Specialties.SuperSpecialization.lookup_value": 1,
          "Specialties.Specialty": 1,
          "Specialties.SubSpeciality": 1,
          "Specialties.SuperSpecialization": 1,
          "Doctor.QualificationAndExperience": 1,
          "Doctor.AwardsAndAchievement": 1,
          "Doctor.ProfilePic": 1,
          "Doctor.ShortDesc": 1,
          "Doctor.LongDesc": 1,
          "Doctor.MobileNo": 1,
          "Doctor.EmailAddress": 1,
          "Doctor.PostalCode": 1,
          "Doctor.RegistrationNo": 1,
          "Doctor.ProfileDetails": 1,
        },
      },
    ];

    // Execute aggregation
    const doctorsList = await AssetMaster.aggregate(pipeline);

    // Fetch total count
    const totalCount = await AssetMaster.countDocuments({
      AssetTypeID: { $in: AssetTypeIDs },
      IsFavourite: false,
    });

    // Fetch IMAGE_PATH setting
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });
    const imageBasePath =
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_IMAGE_URL
        : __ImagePathDetails?.EnvSettingTextValue;

    // Construct response
    const response = {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      records: __deepClone(doctorsList).map((item) => ({
        _id: item?._id,
        AssetName: item?.AssetName,
        AssetCode: item?.AssetCode,
        AssetTypeID: item?.AssetTypeID,
        [item?.AssetTypeID?.lookup_value]: {
          ...item[item?.AssetTypeID?.lookup_value],
          ProfilePic: item[item?.AssetTypeID?.lookup_value]?.ProfilePic
            ? `${imageBasePath}${
                item[item?.AssetTypeID?.lookup_value]?.ProfilePic
              }`
            : "",
        },
      })),
    };

    return res.json(__requestResponse("200", "Success", response));
  } catch (error) {
    console.error("Error in GetAssetsList_ForWebsite:", error);
    return res.json(__requestResponse("500", "Internal server error", error));
  }
});






// not in use
router.post("/GetAssetsList_ForWebsite-old1", async (req, res) => {
  try {
    const { AssetName, LookupType } = req.body;
    if (!AssetName || AssetName.length == 0) {
      return res.json(__requestResponse("400", "Please provide a AssetName"));
    }
    if (!LookupType) {
      return res.json(__requestResponse("400", "Please provide a LookupType"));
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
        match: { lookup_value: { $in: [LookupType, "For_All"] } }, // Filter by LookupType or For_All
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

// not in use
router.post("/GetAssetsList_ForWebsite2", async (req, res) => {
  try {
    console.log(req.body, "body");
    const { AssetName, LookupType } = req.body;

    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please provide an AssetName"));
    }
    if (!LookupType || LookupType.length === 0) {
      return res.json(__requestResponse("400", "Please provide LookupType(s)"));
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
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);

      populateData.push(
        {
          path: "Doctor.LookupType",
          model: "admin_lookups",
          select: "lookup_value",
          match: { lookup_value: { $in: LookupType } }, // Filter by LookupType
        },
        {
          path: "Doctor.Designation",
          model: "admin_lookups",
          select: "lookup_value", // Include Designation lookup_value
        },
        {
          path: "Doctor.Hospital",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
          select: "AssetName _id", // Select only name and ID of hospitals
        }
      );
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
        {
          path: "ParentID Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
          select: "lookup_value",
        },
        {
          path: "ParentID",
          model: "asset_masters", // Refers to asset_masters schema for hospitals
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
      AssetTypeIDs.push(_AssetType?.EnvSettingValue);
      populateData.push({
        path: "Attendant.LocationID",
        select: "lookup_value",
      });
    }

    // Apply filtering logic
    const list = await AssetMaster.find(
      {
        AssetTypeID: { $in: AssetTypeIDs },
        IsFavourite: false,
        ...(AssetName.includes("ASSET_TYPE_DOCTOR")
          ? { "Doctor.LookupType.lookup_value": { $in: LookupType } }
          : {}),
      },
      "AssetName AssetCode AssetTypeID Doctor Hospital Attendant"
    ).populate(populateData);
    console.log(list, "list");

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", "No data found."));
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
    console.error("Error in GetAssetsList_ForWebsite:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});


// not in use
router.get("/GetAssetById_test", async (req, res) => {
  try {
    const { id } = req.query; // Accept asset ID as a query parameter

    if (!id) {
      return res.json(__requestResponse("400", "Please provide an asset ID."));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json(__requestResponse("400", "Invalid asset ID format."));
    }

    // Populate configuration based on asset types
    const populateData = [
      {
        path: "AssetTypeID",
        select: "lookup_value", // Always populate AssetTypeID
      },
    ];

    // Fetch the asset by ID
    const asset = await AssetMaster.findById(id).populate(populateData);

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found."));
    }

    // Dynamically add population based on the asset type
    switch (asset?.AssetTypeID?.lookup_value) {
      case "Doctor":
        await asset.populate([
          {
            path: "Doctor.Designation",
            select: "lookup_value",
          },
          {
            path: "Doctor.Hospital",
            model: "asset_masters",
            select: "AssetName _id",
          },
        ]);
        break;

      case "Hospital":
        await asset.populate([
          {
            path: "Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
            select: "lookup_value",
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
          },
          {
            path: "Hospital.DoctorID",
            model: "asset_masters",
            select: "AssetName _id",
          },
        ]);
        break;

      case "Pharmacy":
      case "Pathology":
        await asset.populate({
          path: `${asset?.AssetTypeID?.lookup_value}.LocationID`,
          model: "address_master",
          select: "AddressLine1 AddressLine2 PIN geolocation",
        });
        break;

      case "Attendant":
      case "ClientUser":
        await asset.populate({
          path: `${asset?.AssetTypeID?.lookup_value}.LocationID`,
          model: "address_master",
          select: "AddressLine1 AddressLine2 PIN geolocation",
        });
        break;

      default:
        break;
    }

    // Prepare response
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const response = {
      _id: asset?._id,
      AssetName: asset?.AssetName || "N/A",
      AssetCode: asset?.AssetCode || "N/A",
      AssetType: asset?.AssetTypeID?.lookup_value || "Unknown",
      AssetDetails: asset?.[asset?.AssetTypeID?.lookup_value] || {},
      ProfilePic: asset?.[asset?.AssetTypeID?.lookup_value]?.ProfilePic
        ? `${
            process.env.NODE_ENV === "development"
              ? process.env.LOCAL_IMAGE_URL
              : __ImagePathDetails?.EnvSettingTextValue
          }${asset[asset?.AssetTypeID?.lookup_value]?.ProfilePic}`
        : "",
    };

    return res.json(
      __requestResponse("200", "Asset fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error in GetAssetById:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

router.post("/GetAssetById", async (req, res) => {
  try {
    const id = req.query.id || req.body.id; // Check both query and body for 'id'

    if (!id) {
      return res.json(__requestResponse("400", "Please provide an asset ID."));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json(__requestResponse("400", "Invalid asset ID format."));
    }

    // Populate base data
    const populateData = [
      {
        path: "AssetTypeID",
        select: "lookup_value",
      },
    ];

    const asset = await AssetMaster.findById(id).populate(populateData);

    if (!asset) {
      return res.json(__requestResponse("404", "Asset not found."));
    }

    // Dynamic population based on asset type
    switch (asset?.AssetTypeID?.lookup_value) {
      case "Doctor":
        await asset.populate([
          { path: "Doctor.Designation", select: "lookup_value" },
          {
            path: "Doctor.Hospital",
            model: "asset_masters",
            select: "AssetName _id",
          },
        ]);
        break;

      case "Hospital":
        await asset.populate([
          {
            path: "Hospital.MedicalSpeciality Hospital.HospitalType Hospital.TherapyId Hospital.InsurancePanels",
            select: "lookup_value",
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
          },
          {
            path: "Hospital.DoctorID",
            model: "asset_masters",
            select: "AssetName _id",
          },
        ]);
        break;

      case "Pharmacy":
      case "Pathology":
      case "Attendant":
      case "ClientUser":
        await asset.populate({
          path: `${asset?.AssetTypeID?.lookup_value}.LocationID`,
          model: "address_master",
          select: "AddressLine1 AddressLine2 PIN geolocation",
        });
        break;

      default:
        break;
    }

    // Prepare response
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const response = {
      _id: asset?._id,
      AssetName: asset?.AssetName || "N/A",
      AssetCode: asset?.AssetCode || "N/A",
      AssetType: asset?.AssetTypeID?.lookup_value || "Unknown",
      AssetDetails: asset?.[asset?.AssetTypeID?.lookup_value] || {},
      ProfilePic: asset?.[asset?.AssetTypeID?.lookup_value]?.ProfilePic
        ? `${
            process.env.NODE_ENV === "development"
              ? process.env.LOCAL_IMAGE_URL
              : __ImagePathDetails?.EnvSettingTextValue
          }${asset[asset?.AssetTypeID?.lookup_value]?.ProfilePic}`
        : "",
    };

    return res.json(
      __requestResponse("200", "Asset fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error in GetAssetById:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

module.exports = router;

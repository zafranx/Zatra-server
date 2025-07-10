const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  checkGovernmentOfficialsData,
  checkGovernmentSchemeData,
} = require("../Middleware/middleGovernmentOfficials");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// **Save Government Official**
router.post(
  "/SaveGovernmentOfficials",
  checkGovernmentOfficialsData,
  async (req, res) => {
    const APIEndPointNo = "#GOVT_OFFICIAL001";
    try {
      const {
        government_officials_id,
        asset_type_id,
        parent_id,
        entry_by,
        title,
        name,
        phone,
        email,
        profile_pic,
        profile_info,
        address_id,
      } = req.body;

      const _assetCode = await __AssetCode("GOVERNMENT_OFFICIALS");

      const _governmentOfficialData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        GovernmentOfficials: {
          Title: title,
          Name: name,
          Phone: phone || "",
          Email: email || "",
          ProfilePic: profile_pic || "",
          ProfileInfo: profile_info || "",
          AddressID: address_id ? mongoose.Types.ObjectId(address_id) : null,
        },
      };

      if (!government_officials_id) {
        const newGovernmentOfficial = await AssetMaster.create(
          _governmentOfficialData
        );
        __CreateAuditLog(
          "asset_master",
          "GovernmentOfficials.Add",
          null,
          null,
          _governmentOfficialData,
          newGovernmentOfficial._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Official added successfully.",
            newGovernmentOfficial
          )
        );
      } else {
        const existingOfficial = await AssetMaster.findOne({
          _id: government_officials_id,
        });
        if (!existingOfficial) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedGovernmentOfficial = await AssetMaster.updateOne(
          { _id: government_officials_id },
          { $set: _governmentOfficialData }
        );

        __CreateAuditLog(
          "asset_master",
          "GovernmentOfficials.Edit",
          null,
          existingOfficial,
          _governmentOfficialData,
          government_officials_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Official updated successfully.",
            updatedGovernmentOfficial
          )
        );
      }
    } catch (error) {
      return res.json(
        __requestResponse(
          "500",
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
          error
        )
      );
    }
  }
);

// **Get Government Official List**
router.get("/GetGovernmentOfficialsList", async (req, res) => {
  const APIEndPointNo = "#GOVT_OFFICIAL002";
  try {
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_OFFICIALS",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Government Officials Asset Type not found.")
      );
    }

    const governmentOfficialsList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate({
        path: "GovernmentOfficials.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!governmentOfficialsList || governmentOfficialsList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        data: governmentOfficialsList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          title: data.GovernmentOfficials?.Title,
          name: data.GovernmentOfficials?.Name,
          phone: data.GovernmentOfficials?.Phone,
          email: data.GovernmentOfficials?.Email,
          profile_pic: data.GovernmentOfficials?.ProfilePic,
          profile_info: data.GovernmentOfficials?.ProfileInfo,
          address: data.GovernmentOfficials?.AddressID
            ? {
                _id: data.GovernmentOfficials.AddressID._id,
                address_type:
                  data.GovernmentOfficials.AddressID.AddressTypeId
                    ?.lookup_value,
                line1: data.GovernmentOfficials.AddressID.AddressLine1,
                line2: data.GovernmentOfficials.AddressID.AddressLine2,
                city: data.GovernmentOfficials.AddressID.CityId?.lookup_value,
                state: data.GovernmentOfficials.AddressID.StateId?.lookup_value,
                country:
                  data.GovernmentOfficials.AddressID.CountryId?.lookup_value,
                pin: data.GovernmentOfficials.AddressID.PIN,
                full_address: `${data.GovernmentOfficials.AddressID.AddressLine1}, ${data.GovernmentOfficials.AddressID.AddressLine2}, ${data.GovernmentOfficials.AddressID.CityId?.lookup_value}, ${data.GovernmentOfficials.AddressID.StateId?.lookup_value}, ${data.GovernmentOfficials.AddressID.CountryId?.lookup_value} - ${data.GovernmentOfficials.AddressID.PIN}`,
              }
            : null,
        })),
      })
    );
  } catch (error) {
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

//  **Save Government Scheme**
router.post(
  "/SaveGovernmentScheme",
  checkGovernmentSchemeData,
  async (req, res) => {
    const APIEndPointNo = "#GOV_SCHEME001";
    try {
      const {
        government_scheme_id,
        asset_type_id,
        parent_id,
        entry_by,
        category_id,
        address_id,
        title,
        document,
        short_desc,
        long_desc,
        url,
      } = req.body;

      const _assetCode = await __AssetCode("GOVERNMENT_SCHEME");

      const _governmentSchemeData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: title,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        GovernmentScheme: {
          CategoryID: mongoose.Types.ObjectId(category_id),
          AddressID: mongoose.Types.ObjectId(address_id),
          Title: title,
          Document: document,
          ShortDesc: short_desc || "",
          LongDesc: long_desc || "",
          URL: url || "",
        },
      };

      if (!government_scheme_id) {
        const newGovernmentScheme = await AssetMaster.create(
          _governmentSchemeData
        );
        __CreateAuditLog(
          "asset_master",
          "GovernmentScheme.Add",
          null,
          null,
          _governmentSchemeData,
          newGovernmentScheme._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Scheme added successfully.",
            newGovernmentScheme
          )
        );
      } else {
        const existingGovernmentScheme = await AssetMaster.findOne({
          _id: government_scheme_id,
        });
        if (!existingGovernmentScheme) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedGovernmentScheme = await AssetMaster.updateOne(
          { _id: government_scheme_id },
          { $set: _governmentSchemeData }
        );

        __CreateAuditLog(
          "asset_master",
          "GovernmentScheme.Edit",
          null,
          existingGovernmentScheme,
          _governmentSchemeData,
          government_scheme_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Scheme updated successfully.",
            updatedGovernmentScheme
          )
        );
      }
    } catch (error) {
      return res.json(
        __requestResponse(
          "500",
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
          error
        )
      );
    }
  }
);

//  **Get Government Scheme List**
router.get("/GetGovernmentSchemeList", async (req, res) => {
  const APIEndPointNo = "#GOV_SCHEME002";
  try {
    // Get Government Scheme Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_SCHEME",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Government Scheme Asset Type not found.")
      );
    }

    const governmentSchemeList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("GovernmentScheme.CategoryID", "lookup_value")
      .populate({
        path: "GovernmentScheme.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!governmentSchemeList || governmentSchemeList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        governmentSchemeList.map((scheme) => ({
          _id: scheme._id,
          assetTypeId: scheme.AssetTypeID?._id,
          assetTypeName: scheme.AssetTypeID?.lookup_value,
          parentId: scheme.ParentID?._id,
          parentName: scheme.ParentID?.AssetName,
          title: scheme.GovernmentScheme?.Title,
          document: scheme.GovernmentScheme?.Document,
          shortDesc: scheme.GovernmentScheme?.ShortDesc,
          longDesc: scheme.GovernmentScheme?.LongDesc,
          url: scheme.GovernmentScheme?.URL,
          categoryName: scheme.GovernmentScheme?.CategoryID?.lookup_value,
          address: scheme.GovernmentScheme?.AddressID
            ? {
                _id: scheme.GovernmentScheme.AddressID._id,
                address_type:
                  scheme.GovernmentScheme.AddressID.AddressTypeId?.lookup_value,
                line1: scheme.GovernmentScheme.AddressID.AddressLine1,
                line2: scheme.GovernmentScheme.AddressID.AddressLine2,
                city: scheme.GovernmentScheme.AddressID.CityId?.lookup_value,
                state: scheme.GovernmentScheme.AddressID.StateId?.lookup_value,
                country:
                  scheme.GovernmentScheme.AddressID.CountryId?.lookup_value,
                pin: scheme.GovernmentScheme.AddressID.PIN,
                full_address: `${scheme.GovernmentScheme.AddressID.AddressLine1}, ${scheme.GovernmentScheme.AddressID.AddressLine2}, ${scheme.GovernmentScheme.AddressID.CityId?.lookup_value}, ${scheme.GovernmentScheme.AddressID.StateId?.lookup_value}, ${scheme.GovernmentScheme.AddressID.CountryId?.lookup_value} - ${scheme.GovernmentScheme.AddressID.PIN}`,
              }
            : null,
        }))
      )
    );
  } catch (error) {
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

module.exports = router;

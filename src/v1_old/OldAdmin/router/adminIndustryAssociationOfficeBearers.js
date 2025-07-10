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
  checkIndustryAssociationOfficeBearersData,
} = require("../Middleware/middleIndustryAssociationOfficeBearers");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post(
  "/SaveIndustryAssociationOfficeBearer",
  checkIndustryAssociationOfficeBearersData,
  async (req, res) => {
    const APIEndPointNo = "#INDUSTRYOFFICE001";
    try {
      const {
        office_bearer_id,
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

      const _assetCode = await __AssetCode("INDUSTRY_ASSOCIATION_OFFICE");

      const _officeBearerData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        IndustryAssociationOfficeBearers: {
          Title: title,
          Name: name,
          Phone: phone,
          Email: email,
          ProfilePic: profile_pic || "",
          ProfileInfo: profile_info || "",
          AddressID: address_id ? mongoose.Types.ObjectId(address_id) : null,
        },
      };

      if (!office_bearer_id) {
        // Create a new office bearer
        const newOfficeBearer = await AssetMaster.create(_officeBearerData);
        __CreateAuditLog(
          "asset_master",
          "IndustryAssociationOfficeBearers.Add",
          null,
          null,
          _officeBearerData,
          newOfficeBearer._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Industry Association Office Bearer added successfully.",
            newOfficeBearer
          )
        );
      } else {
        // Update existing office bearer
        const existingOfficeBearer = await AssetMaster.findOne({
          _id: office_bearer_id,
        });
        if (!existingOfficeBearer) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedOfficeBearer = await AssetMaster.updateOne(
          { _id: office_bearer_id },
          { $set: _officeBearerData }
        );

        __CreateAuditLog(
          "asset_master",
          "IndustryAssociationOfficeBearers.Edit",
          null,
          existingOfficeBearer,
          _officeBearerData,
          office_bearer_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Industry Association Office Bearer updated successfully.",
            updatedOfficeBearer
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

router.get("/GetIndustryAssociationOfficeBearerList", async (req, res) => {
  const APIEndPointNo = "#INDUSTRYOFFICE002";
  try {
    // Get Office Bearer Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_INDUSTRY_ASSOCIATION_OFFICE",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse(
          "400",
          "Industry Association Office Bearer Asset Type not found."
        )
      );
    }

    const officeBearerList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate({
        path: "IndustryAssociationOfficeBearers.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!officeBearerList || officeBearerList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        data: officeBearerList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          title: data.IndustryAssociationOfficeBearers?.Title,
          name: data.IndustryAssociationOfficeBearers?.Name,
          phone: data.IndustryAssociationOfficeBearers?.Phone,
          email: data.IndustryAssociationOfficeBearers?.Email,
          profilePic: data.IndustryAssociationOfficeBearers?.ProfilePic,
          profileInfo: data.IndustryAssociationOfficeBearers?.ProfileInfo,
          address: data.IndustryAssociationOfficeBearers?.AddressID
            ? {
                _id: data.IndustryAssociationOfficeBearers.AddressID._id,
                address_type:
                  data.IndustryAssociationOfficeBearers.AddressID.AddressTypeId
                    ?.lookup_value,
                line1:
                  data.IndustryAssociationOfficeBearers.AddressID.AddressLine1,
                line2:
                  data.IndustryAssociationOfficeBearers.AddressID.AddressLine2,
                city: data.IndustryAssociationOfficeBearers.AddressID.CityId
                  ?.lookup_value,
                state:
                  data.IndustryAssociationOfficeBearers.AddressID.StateId
                    ?.lookup_value,
                country:
                  data.IndustryAssociationOfficeBearers.AddressID.CountryId
                    ?.lookup_value,
                pin: data.IndustryAssociationOfficeBearers.AddressID.PIN,
                full_address: `${data.IndustryAssociationOfficeBearers.AddressID.AddressLine1}, ${data.IndustryAssociationOfficeBearers.AddressID.AddressLine2}, ${data.IndustryAssociationOfficeBearers.AddressID.CityId?.lookup_value}, ${data.IndustryAssociationOfficeBearers.AddressID.StateId?.lookup_value}, ${data.IndustryAssociationOfficeBearers.AddressID.CountryId?.lookup_value} - ${data.IndustryAssociationOfficeBearers.AddressID.PIN}`,
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

module.exports = router;

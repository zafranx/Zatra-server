const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  checkIndustryAssociationData,
} = require("../Middleware/middleIndustryAssociation");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post(
  "/SaveIndustryAssociation",
  checkIndustryAssociationData,
  async (req, res) => {
    const APIEndPointNo = "#INDUSTRY001";
    try {
      const {
        industry_association_id,
        asset_type_id,
        parent_id,
        entry_by,
        name,
        description,
        address_id,
      } = req.body;

      const _assetCode = await __AssetCode("INDUSTRY_ASSOCIATION");

      const _industryAssociationData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        IndustryAssociation: {
          Name: name,
          Description: description || "",
          AddressID: mongoose.Types.ObjectId(address_id),
        },
      };

      if (!industry_association_id) {
        const newIndustryAssociation = await AssetMaster.create(
          _industryAssociationData
        );
        __CreateAuditLog(
          "asset_master",
          "IndustryAssociation.Add",
          null,
          null,
          _industryAssociationData,
          newIndustryAssociation._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Industry Association added successfully.",
            newIndustryAssociation
          )
        );
      } else {
        const existingIndustryAssociation = await AssetMaster.findOne({
          _id: industry_association_id,
        });
        if (!existingIndustryAssociation) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedIndustryAssociation = await AssetMaster.updateOne(
          { _id: industry_association_id },
          { $set: _industryAssociationData }
        );

        __CreateAuditLog(
          "asset_master",
          "IndustryAssociation.Edit",
          null,
          existingIndustryAssociation,
          _industryAssociationData,
          industry_association_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Industry Association updated successfully.",
            updatedIndustryAssociation
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

router.get("/GetIndustryAssociationList", async (req, res) => {
  const APIEndPointNo = "#INDUSTRY002";
  try {
    // Get IndustryAssociation Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_INDUSTRY_ASSOCIATION",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Industry Association Asset Type not found.")
      );
    }

    const industryAssociationList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate({
        path: "IndustryAssociation.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!industryAssociationList || industryAssociationList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(industryAssociationList).map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          name: data.IndustryAssociation?.Name,
          description: data.IndustryAssociation?.Description,
          address: data.IndustryAssociation?.AddressID
            ? {
                _id: data.IndustryAssociation.AddressID._id,
                address_type:
                  data.IndustryAssociation.AddressID.AddressTypeId
                    ?.lookup_value,
                line1: data.IndustryAssociation.AddressID.AddressLine1,
                line2: data.IndustryAssociation.AddressID.AddressLine2,
                city: data.IndustryAssociation.AddressID.CityId?.lookup_value,
                state: data.IndustryAssociation.AddressID.StateId?.lookup_value,
                country:
                  data.IndustryAssociation.AddressID.CountryId?.lookup_value,
                pin: data.IndustryAssociation.AddressID.PIN,
                full_address: `${data.IndustryAssociation.AddressID.AddressLine1}, ${data.IndustryAssociation.AddressID.AddressLine2}, ${data.IndustryAssociation.AddressID.CityId?.lookup_value}, ${data.IndustryAssociation.AddressID.StateId?.lookup_value}, ${data.IndustryAssociation.AddressID.CountryId?.lookup_value} - ${data.IndustryAssociation.AddressID.PIN}`,
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

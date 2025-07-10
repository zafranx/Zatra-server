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
  checkRealEstateProjectData,
} = require("../Middleware/middleRealEstateProjects");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// **Save Real Estate Project**
router.post(
  "/SaveRealEstateProject",
  checkRealEstateProjectData,
  async (req, res) => {
    const APIEndPointNo = "#REALESTATE001";
    try {
      const {
        real_estate_project_id,
        asset_type_id,
        parent_id,
        entry_by,
        name,
        short_desc,
        long_desc,
        address_id,
        completion_deadlines,
      } = req.body;

      const _assetCode = await __AssetCode("REAL_ESTATE_PROJECT");

      const _realEstateData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        RealEstateProjects: {
          Name: name,
          ShortDesc: short_desc,
          LongDesc: long_desc,
          AddressID: mongoose.Types.ObjectId(address_id),
          CompletionDeadlines: completion_deadlines,
        },
      };

      if (!real_estate_project_id) {
        const newRealEstate = await AssetMaster.create(_realEstateData);
        __CreateAuditLog(
          "asset_master",
          "RealEstateProjects.Add",
          null,
          null,
          _realEstateData,
          newRealEstate._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Real Estate Project added successfully.",
            newRealEstate
          )
        );
      } else {
        const existingRealEstate = await AssetMaster.findOne({
          _id: real_estate_project_id,
        });
        if (!existingRealEstate) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedRealEstate = await AssetMaster.updateOne(
          { _id: real_estate_project_id },
          { $set: _realEstateData }
        );

        __CreateAuditLog(
          "asset_master",
          "RealEstateProjects.Edit",
          null,
          existingRealEstate,
          _realEstateData,
          real_estate_project_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Real Estate Project updated successfully.",
            updatedRealEstate
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

// **Get Real Estate Project List**
router.get("/GetRealEstateProjectList", async (req, res) => {
  const APIEndPointNo = "#REALESTATE002";
  try {
    // Get RealEstate Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_REAL_ESTATE_PROJECT",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Real Estate Project Asset Type not found.")
      );
    }

    const realEstateList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate({
        path: "RealEstateProjects.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!realEstateList || realEstateList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        realEstateList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          name: data.RealEstateProjects?.Name,
          shortDesc: data.RealEstateProjects?.ShortDesc,
          longDesc: data.RealEstateProjects?.LongDesc,
          completionDeadlines: data.RealEstateProjects?.CompletionDeadlines,
          address: data.RealEstateProjects?.AddressID
            ? {
                _id: data.RealEstateProjects.AddressID._id,
                address_type:
                  data.RealEstateProjects.AddressID.AddressTypeId?.lookup_value,
                line1: data.RealEstateProjects.AddressID.AddressLine1,
                line2: data.RealEstateProjects.AddressID.AddressLine2,
                city: data.RealEstateProjects.AddressID.CityId?.lookup_value,
                state: data.RealEstateProjects.AddressID.StateId?.lookup_value,
                country:
                  data.RealEstateProjects.AddressID.CountryId?.lookup_value,
                pin: data.RealEstateProjects.AddressID.PIN,
                full_address: `${data.RealEstateProjects.AddressID.AddressLine1}, ${data.RealEstateProjects.AddressID.AddressLine2}, ${data.RealEstateProjects.AddressID.CityId?.lookup_value}, ${data.RealEstateProjects.AddressID.StateId?.lookup_value}, ${data.RealEstateProjects.AddressID.CountryId?.lookup_value} - ${data.RealEstateProjects.AddressID.PIN}`,
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

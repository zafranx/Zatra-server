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
  checkGovernmentOfficeData,
} = require("../Middleware/middleGovernmentOffice");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// ** save government office **
router.post(
  "/SaveGovernmentOffice",
  checkGovernmentOfficeData,
  async (req, res) => {
    const APIEndPointNo = "#GOVT_OFFICE001";
    try {
      const {
        government_office_id,
        asset_type_id,
        parent_id,
        entry_by,
        category_id,
        name,
        address_id,
      } = req.body;

      const _assetCode = await __AssetCode("GOVERNMENT_OFFICE");

      const _governmentOfficeData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        GovernmentOffice: {
          CategoryID: mongoose.Types.ObjectId(category_id),
          Name: name,
          AddressID: address_id ? mongoose.Types.ObjectId(address_id) : null,
        },
      };

      if (!government_office_id) {
        const newGovernmentOffice = await AssetMaster.create(
          _governmentOfficeData
        );
        __CreateAuditLog(
          "asset_master",
          "GovernmentOffice.Add",
          null,
          null,
          _governmentOfficeData,
          newGovernmentOffice._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Office added successfully.",
            newGovernmentOffice
          )
        );
      } else {
        const existingGovernmentOffice = await AssetMaster.findOne({
          _id: government_office_id,
        });
        if (!existingGovernmentOffice) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedGovernmentOffice = await AssetMaster.updateOne(
          { _id: government_office_id },
          { $set: _governmentOfficeData }
        );

        __CreateAuditLog(
          "asset_master",
          "GovernmentOffice.Edit",
          null,
          existingGovernmentOffice,
          _governmentOfficeData,
          government_office_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Government Office updated successfully.",
            updatedGovernmentOffice
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

// **Get Government Office List**
router.get("/GetGovernmentOfficeList", async (req, res) => {
  const APIEndPointNo = "#GOVT_OFFICE002";
  try {
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_GOVERNMENT_OFFICE",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Government Office Asset Type not found.")
      );
    }

    const governmentOfficeList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("GovernmentOffice.CategoryID", "lookup_value")
      .populate({
        path: "GovernmentOffice.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!governmentOfficeList || governmentOfficeList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        data: governmentOfficeList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          name: data.GovernmentOffice?.Name,
          categoryId: data.GovernmentOffice?.CategoryID?._id,
          categoryName: data.GovernmentOffice?.CategoryID?.lookup_value,
          address: data.GovernmentOffice?.AddressID
            ? {
                _id: data.GovernmentOffice.AddressID._id,
                address_type:
                  data.GovernmentOffice.AddressID.AddressTypeId?.lookup_value,
                line1: data.GovernmentOffice.AddressID.AddressLine1,
                line2: data.GovernmentOffice.AddressID.AddressLine2,
                city: data.GovernmentOffice.AddressID.CityId?.lookup_value,
                state: data.GovernmentOffice.AddressID.StateId?.lookup_value,
                country:
                  data.GovernmentOffice.AddressID.CountryId?.lookup_value,
                pin: data.GovernmentOffice.AddressID.PIN,
                full_address: `${data.GovernmentOffice.AddressID.AddressLine1}, ${data.GovernmentOffice.AddressID.AddressLine2}, ${data.GovernmentOffice.AddressID.CityId?.lookup_value}, ${data.GovernmentOffice.AddressID.StateId?.lookup_value}, ${data.GovernmentOffice.AddressID.CountryId?.lookup_value} - ${data.GovernmentOffice.AddressID.PIN}`,
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

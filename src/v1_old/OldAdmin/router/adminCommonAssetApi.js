const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __deepClone } = require("../../../utils/constent");
const AssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// ** NOTE one more getasset list api is written in admindoctor.js old api


// **Get List of Assets Based on Asset Type**
router.post("/GetAssetsList1", async (req, res) => {
  try {
    const { AssetName } = req.body;
    if (!AssetName || AssetName.length === 0) {
      return res.json(__requestResponse("400", "Please enter asset name"));
    }

    const populateData = [];
    const AssetTypeIDs = [];

    // Always populate AssetTypeID with lookup_value
    populateData.push({
      path: "AssetTypeID",
      select: "lookup_value",
    });

    const assetTypes = [
      { key: "ASSET_TYPE_DOCTOR", model: "Doctor" },
      { key: "ASSET_TYPE_HOSPITAL", model: "Hospital" },
      { key: "ASSET_TYPE_ATTENDANT", model: "Attendant" },
      { key: "ASSET_TYPE_CARE_PARTNER", model: "CarePartner" },
      { key: "ASSET_TYPE_PATHOLOGY", model: "Pathology" },
      { key: "ASSET_TYPE_PHARMACY", model: "Pharmacy" },
      { key: "ASSET_TYPE_SERVICE_ENTITY", model: "ServiceEntities" },
      { key: "ASSET_TYPE_INDUSTRY_ASSOCIATION", model: "IndustryAssociation" },
      {
        key: "ASSET_TYPE_INDUSTRY_OFFICIALS",
        model: "IndustryAssociationOfficeBearers",
      },
      { key: "ASSET_TYPE_GOVERNMENT_OFFICE", model: "GovernmentOffice" },
      { key: "ASSET_TYPE_GOVERNMENT_OFFICIALS", model: "GovernmentOfficials" },
      { key: "ASSET_TYPE_MARKET", model: "Market" },
      { key: "ASSET_TYPE_SHOP", model: "Shop" },
      { key: "ASSET_TYPE_PLANT_FACTORY", model: "PlantFactory" },
      { key: "ASSET_TYPE_REAL_ESTATE", model: "RealEstateProjects" },
    ];

    for (const asset of assetTypes) {
      if (AssetName.includes(asset.key)) {
        const _AssetType = await AdminEnvSetting.findOne({
          EnvSettingCode: asset.key,
        });

        if (!_AssetType) {
          return res.json(
            __requestResponse("400", `Invalid Asset Type Env (${asset.key})`)
          );
        }

        AssetTypeIDs.push(_AssetType?.EnvSettingValue);

        // **Common Population**
        populateData.push({
          path: `${asset.model}.CategoryID`,
          select: "lookup_value",
        });
        populateData.push({
          path: `${asset.model}.SubCategoryID`,
          select: "lookup_value",
        });
        populateData.push({
          path: `${asset.model}.AddressID`,
          model: "address_master",
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation",
        });

        // **Specific Population based on asset type**
        if (asset.key === "ASSET_TYPE_DOCTOR") {
          populateData.push({
            path: "Doctor.LookupType",
            select: "lookup_value",
          });
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

        if (asset.key === "ASSET_TYPE_HOSPITAL") {
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
      }
    }

    // Fetch Data from AssetMaster
    const assetList = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
      "AssetName AssetCode AssetTypeID"
    ).populate(populateData);

    if (!assetList || assetList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Fetch Image Base Path from Settings
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(assetList).map((item) => ({
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
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

//**Get List of Assets Based on Asset Type**
router.post("/GetAssetsList2", async (req, res) => {
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

    // Dynamically fetch asset type and define populate rules
    const assetTypes = [
      { key: "ASSET_TYPE_DOCTOR", model: "Doctor" },
      { key: "ASSET_TYPE_HOSPITAL", model: "Hospital" },
      { key: "ASSET_TYPE_ATTENDANT", model: "Attendant" },
      { key: "ASSET_TYPE_CARE_PARTNER", model: "CarePartner" },
      { key: "ASSET_TYPE_PATHOLOGY", model: "Pathology" },
      { key: "ASSET_TYPE_PHARMACY", model: "Pharmacy" },
      { key: "ASSET_TYPE_SERVICE_ENTITY", model: "ServiceEntities" },
      { key: "ASSET_TYPE_INDUSTRY_ASSOCIATION", model: "IndustryAssociation" },
      {
        key: "ASSET_TYPE_INDUSTRY_OFFICIALS",
        model: "IndustryAssociationOfficeBearers",
      },
      { key: "ASSET_TYPE_GOVERNMENT_OFFICE", model: "GovernmentOffice" },
      { key: "ASSET_TYPE_GOVERNMENT_OFFICIALS", model: "GovernmentOfficials" },
      { key: "ASSET_TYPE_MARKET", model: "Market" },
      { key: "ASSET_TYPE_SHOP", model: "Shop" },
      { key: "ASSET_TYPE_PLANT_FACTORY", model: "PlantFactory" },
      { key: "ASSET_TYPE_REAL_ESTATE", model: "RealEstateProjects" },
    ];

    for (const asset of assetTypes) {
      if (AssetName.includes(asset.key)) {
        const _AssetType = await AdminEnvSetting.findOne({
          EnvSettingCode: asset.key,
        });

        if (!_AssetType) {
          return res.json(
            __requestResponse("400", `Invalid Asset Type Env (${asset.key})`)
          );
        }

        AssetTypeIDs.push(_AssetType?.EnvSettingValue);

        // Dynamic population based on the asset type
        populateData.push({
          path: `${asset.model}.CategoryID`,
          select: "lookup_value",
        });
        populateData.push({
          path: `${asset.model}.SubCategoryID`,
          select: "lookup_value",
        });
        populateData.push({
          path: `${asset.model}.AddressID`,
          model: "address_master",
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation",
        });
      }
    }

    // Fetch data from AssetMaster
    const assetList = await AssetMaster.find(
      { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
      "AssetName AssetCode AssetTypeID"
    ).populate(populateData);

    if (!assetList || assetList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Fetch image base path from settings
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(assetList).map((item) => ({
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
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;

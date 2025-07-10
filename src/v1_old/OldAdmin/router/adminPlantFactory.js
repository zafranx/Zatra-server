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
const { checkPlantFactoryData } = require("../Middleware/middlePlantFactory");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post("/SavePlantFactory", checkPlantFactoryData, async (req, res) => {
  const APIEndPointNo = "#PLANT001";
  try {
    const {
      plant_factory_id,
      asset_type_id,
      parent_id,
      entry_by,
      category_id,
      sub_category_id,
      name,
      description,
      address_id,
    } = req.body;

    const _assetCode = await __AssetCode("PLANT_FACTORY");

    const _plantFactoryData = {
      AssetCode: _assetCode,
      AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
      ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
      AssetName: name,
      EntryBy: mongoose.Types.ObjectId(entry_by),
      UpdateBy: null,
      PlantFactory: {
        CategoryID: mongoose.Types.ObjectId(category_id),
        SubCategoryID: sub_category_id
          ? mongoose.Types.ObjectId(sub_category_id)
          : null,
        Name: name,
        Description: description || "",
        AddressID: mongoose.Types.ObjectId(address_id),
      },
    };

    if (!plant_factory_id) {
      const newPlantFactory = await AssetMaster.create(_plantFactoryData);
      __CreateAuditLog(
        "asset_master",
        "PlantFactory.Add",
        null,
        null,
        _plantFactoryData,
        newPlantFactory._id,
        null,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Plant Factory added successfully.",
          newPlantFactory
        )
      );
    } else {
      const existingPlantFactory = await AssetMaster.findOne({
        _id: plant_factory_id,
      });
      if (!existingPlantFactory) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedPlantFactory = await AssetMaster.updateOne(
        { _id: plant_factory_id },
        { $set: _plantFactoryData }
      );

      __CreateAuditLog(
        "asset_master",
        "PlantFactory.Edit",
        null,
        existingPlantFactory,
        _plantFactoryData,
        plant_factory_id,
        null,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Plant Factory updated successfully.",
          updatedPlantFactory
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
});

router.get("/GetPlantFactoryList", async (req, res) => {
  const APIEndPointNo = "#PLANT002";
  try {
    // Get PlantFactory Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PLANT_FACTORY",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse(
          "400",
          "Plant Factory Asset Type not found in settings."
        )
      );
    }

    const plantFactoryList = await AssetMaster.find({
      // "PlantFactory.Name": { $exists: true },
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("PlantFactory.CategoryID", "lookup_value")
      .populate("PlantFactory.SubCategoryID", "lookup_value")
      .populate({
        path: "PlantFactory.AddressID",
        model: "address_master", // Refers to address_master schema
        // match: { IsCurrent: true }, // Filter for current address only
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
      });

    if (!plantFactoryList || plantFactoryList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        plantFactoryList: plantFactoryList.map((plantFactory) => ({
          plant_factory_id: plantFactory._id,
          assetTypeId: plantFactory.AssetTypeID?._id,
          assetTypeName: plantFactory.AssetTypeID?.lookup_value,
          parentId: plantFactory.ParentID?._id,
          parentName: plantFactory.ParentID?.AssetName,
          name: plantFactory.PlantFactory?.Name,
          description: plantFactory.PlantFactory?.Description,
          categoryId: plantFactory.PlantFactory?.CategoryID?._id,
          categoryName: plantFactory.PlantFactory?.CategoryID?.lookup_value,
          subCategoryId: plantFactory.PlantFactory?.SubCategoryID?._id,
          subCategoryName:
            plantFactory.PlantFactory?.SubCategoryID?.lookup_value,
          address: plantFactory.PlantFactory?.AddressID
            ? {
                _id: plantFactory.PlantFactory.AddressID._id,
                address_type:
                  plantFactory.PlantFactory.AddressID.AddressTypeId
                    ?.lookup_value,
                line1: plantFactory.PlantFactory.AddressID.AddressLine1,
                line2: plantFactory.PlantFactory.AddressID.AddressLine2,
                city: plantFactory.PlantFactory.AddressID.CityId?.lookup_value,
                state:
                  plantFactory.PlantFactory.AddressID.StateId?.lookup_value,
                country:
                  plantFactory.PlantFactory.AddressID.CountryId?.lookup_value,
                pin: plantFactory.PlantFactory.AddressID.PIN,
                full_address: `${plantFactory.PlantFactory.AddressID.AddressLine1}, ${plantFactory.PlantFactory.AddressID.AddressLine2}, ${plantFactory.PlantFactory.AddressID.CityId?.lookup_value}, ${plantFactory.PlantFactory.AddressID.StateId?.lookup_value}, ${plantFactory.PlantFactory.AddressID.CountryId?.lookup_value} - ${plantFactory.PlantFactory.AddressID.PIN}`,
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

// not in use currently
router.get("/GetPlantFactoryList_new", async (req, res) => {
  const APIEndPointNo = "#PLANT002";
  try {
    const plantFactoryList = await AssetMaster.find({
      "PlantFactory.Name": { $exists: true },
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("PlantFactory.CategoryID", "lookup_value")
      .populate("PlantFactory.SubCategoryID", "lookup_value")
      .populate({
        path: "PlantFactory.AddressID",
        model: "address_master", // Refers to address_master schema
        match: { IsCurrent: true }, // Filter for current address only
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
      });

    if (!plantFactoryList || plantFactoryList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        plantFactoryList: __deepClone(plantFactoryList).map((plantFactory) => ({
          _id: plantFactory._id,
          assetTypeName: plantFactory.AssetTypeID,
          parentName: plantFactory.ParentID,
          name: plantFactory.PlantFactory?.Name,
          description: plantFactory.PlantFactory?.Description,
          categoryName: plantFactory.PlantFactory?.CategoryID,
          subCategoryName: plantFactory.PlantFactory?.SubCategoryID,
          address: plantFactory.PlantFactory?.AddressID
            ? {
                _id: plantFactory.PlantFactory.AddressID._id,
                line1: plantFactory.PlantFactory.AddressID.AddressLine1,
                line2: plantFactory.PlantFactory.AddressID.AddressLine2,
                city: plantFactory.PlantFactory.AddressID.CityId?.lookup_value,
                state:
                  plantFactory.PlantFactory.AddressID.StateId?.lookup_value,
                country:
                  plantFactory.PlantFactory.AddressID.CountryId?.lookup_value,
                pin: plantFactory.PlantFactory.AddressID.PIN,
                full_address: `${plantFactory.PlantFactory.AddressID.AddressLine1}, ${plantFactory.PlantFactory.AddressID.AddressLine2}, ${plantFactory.PlantFactory.AddressID.CityId?.lookup_value}, ${plantFactory.PlantFactory.AddressID.StateId?.lookup_value}, ${plantFactory.PlantFactory.AddressID.CountryId?.lookup_value} - ${plantFactory.PlantFactory.AddressID.PIN}`,
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

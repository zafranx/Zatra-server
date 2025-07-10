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
  checkServiceEntityData,
} = require("../Middleware/middleServiceEntities");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// Save or Update Service Entity
router.post("/SaveServiceEntity", checkServiceEntityData, async (req, res) => {
  const APIEndPointNo = "#SERVICEENTITY001";
  try {
    const {
      service_entity_id,
      asset_type_id,
      parent_id,
      entry_by,
      category_id,
      name,
      description,
      address_id,
    } = req.body;

    const _assetCode = await __AssetCode("SERVICE_ENTITY");

    const _serviceEntityData = {
      AssetCode: _assetCode,
      AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
      ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
      AssetName: name,
      EntryBy: mongoose.Types.ObjectId(entry_by),
      UpdateBy: null,
      ServiceEntities: {
        CategoryID: mongoose.Types.ObjectId(category_id),
        Name: name,
        Description: description || "",
        AddressID: mongoose.Types.ObjectId(address_id),
      },
    };

    if (!service_entity_id) {
      const newServiceEntity = await AssetMaster.create(_serviceEntityData);
      __CreateAuditLog(
        "asset_master",
        "ServiceEntity.Add",
        null,
        null,
        _serviceEntityData,
        newServiceEntity._id,
        null,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Service Entity added successfully.",
          newServiceEntity
        )
      );
    } else {
      const existingServiceEntity = await AssetMaster.findOne({
        _id: service_entity_id,
      });
      if (!existingServiceEntity) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedServiceEntity = await AssetMaster.updateOne(
        { _id: service_entity_id },
        { $set: _serviceEntityData }
      );

      __CreateAuditLog(
        "asset_master",
        "ServiceEntity.Edit",
        null,
        existingServiceEntity,
        _serviceEntityData,
        service_entity_id,
        null,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Service Entity updated successfully.",
          updatedServiceEntity
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

// Get Service Entity List
router.get("/GetServiceEntityList", async (req, res) => {
  const APIEndPointNo = "#SERVICEENTITY002";
  try {
    // Get ServiceEntity Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_SERVICE_ENTITY",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Service Entity Asset Type not found.")
      );
    }

    const serviceEntityList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("ServiceEntities.CategoryID", "lookup_value")
      .populate({
        path: "ServiceEntities.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!serviceEntityList || serviceEntityList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      //   __requestResponse("200", __SUCCESS, {
      //     serviceEntityList: serviceEntityList.map((serviceEntity) => ({
      //       _id: serviceEntity._id,
      //       assetTypeId: serviceEntity.AssetTypeID?._id,
      //       assetTypeName: serviceEntity.AssetTypeID?.lookup_value,
      //       parentId: serviceEntity.ParentID?._id,
      //       parentName: serviceEntity.ParentID?.AssetName,
      //       name: serviceEntity.ServiceEntities?.Name,
      //       description: serviceEntity.ServiceEntities?.Description,
      //       categoryId: serviceEntity.ServiceEntities?.CategoryID?._id,
      //       categoryName: serviceEntity.ServiceEntities?.CategoryID?.lookup_value,
      //       address: serviceEntity.ServiceEntities?.AddressID
      //         ? {
      //             _id: serviceEntity.ServiceEntities.AddressID._id,
      //             address_type:
      //               serviceEntity.ServiceEntities.AddressID.AddressTypeId
      //                 ?.lookup_value,
      //             line1: serviceEntity.ServiceEntities.AddressID.AddressLine1,
      //             line2: serviceEntity.ServiceEntities.AddressID.AddressLine2,
      //             city: serviceEntity.ServiceEntities.AddressID.CityId
      //               ?.lookup_value,
      //             state:
      //               serviceEntity.ServiceEntities.AddressID.StateId?.lookup_value,
      //             country:
      //               serviceEntity.ServiceEntities.AddressID.CountryId
      //                 ?.lookup_value,
      //             pin: serviceEntity.ServiceEntities.AddressID.PIN,
      //             full_address: `${serviceEntity.ServiceEntities.AddressID.AddressLine1}, ${serviceEntity.ServiceEntities.AddressID.AddressLine2}, ${serviceEntity.ServiceEntities.AddressID.CityId?.lookup_value}, ${serviceEntity.ServiceEntities.AddressID.StateId?.lookup_value}, ${serviceEntity.ServiceEntities.AddressID.CountryId?.lookup_value} - ${serviceEntity.ServiceEntities.AddressID.PIN}`,
      //           }
      //         : null,
      //     })),
      //   })
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(serviceEntityList).map((serviceEntity) => ({
          _id: serviceEntity._id,
          assetTypeId: serviceEntity.AssetTypeID?._id,
          assetTypeName: serviceEntity.AssetTypeID?.lookup_value,
          parentId: serviceEntity.ParentID?._id,
          parentName: serviceEntity.ParentID?.AssetName,
          name: serviceEntity.ServiceEntities?.Name,
          description: serviceEntity.ServiceEntities?.Description,
          categoryId: serviceEntity.ServiceEntities?.CategoryID?._id,
          categoryName: serviceEntity.ServiceEntities?.CategoryID?.lookup_value,
          address: serviceEntity.ServiceEntities?.AddressID
            ? {
                _id: serviceEntity.ServiceEntities.AddressID._id,
                address_type:
                  serviceEntity.ServiceEntities.AddressID.AddressTypeId
                    ?.lookup_value,
                line1: serviceEntity.ServiceEntities.AddressID.AddressLine1,
                line2: serviceEntity.ServiceEntities.AddressID.AddressLine2,
                city: serviceEntity.ServiceEntities.AddressID.CityId
                  ?.lookup_value,
                state:
                  serviceEntity.ServiceEntities.AddressID.StateId?.lookup_value,
                country:
                  serviceEntity.ServiceEntities.AddressID.CountryId
                    ?.lookup_value,
                pin: serviceEntity.ServiceEntities.AddressID.PIN,
                full_address: `${serviceEntity.ServiceEntities.AddressID.AddressLine1}, ${serviceEntity.ServiceEntities.AddressID.AddressLine2}, ${serviceEntity.ServiceEntities.AddressID.CityId?.lookup_value}, ${serviceEntity.ServiceEntities.AddressID.StateId?.lookup_value}, ${serviceEntity.ServiceEntities.AddressID.CountryId?.lookup_value} - ${serviceEntity.ServiceEntities.AddressID.PIN}`,
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

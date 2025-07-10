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
  checkAssetCityMappingData,
} = require("../Middleware/middleAssetCityMaping");
const AssetCityMapping = require("../../../models/AssetCityMaping");

router.post(
  "/SaveAssetCityMapping",
  checkAssetCityMappingData,
  async (req, res) => {
    const APIEndPointNo = "#CITYMAP001";
    try {
      const {
        city_mapping_id,
        asset_id,
        group_name,
        city_id,
        city_group_id,
        is_active,
      } = req.body;

      const _mappingData = {
        AssetId: mongoose.Types.ObjectId(asset_id),
        GroupName: group_name,
        CityID: mongoose.Types.ObjectId(city_id),
        CityGroupID: city_group_id
          ? city_group_id.map((id) => mongoose.Types.ObjectId(id))
          : [],
        IsActive: is_active ?? true,
      };

      if (!city_mapping_id) {
        // Create new mapping
        const newMapping = await AssetCityMapping.create(_mappingData);
        __CreateAuditLog(
          "asset_city_mapping",
          "CityMapping.Add",
          null,
          null,
          _mappingData,
          newMapping._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "City Mapping added successfully.",
            newMapping
          )
        );
      } else {
        // Update existing mapping
        const existingMapping = await AssetCityMapping.findById(
          city_mapping_id
        );
        if (!existingMapping) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedMapping = await AssetCityMapping.updateOne(
          { _id: city_mapping_id },
          { $set: _mappingData }
        );

        __CreateAuditLog(
          "asset_city_mapping",
          "CityMapping.Edit",
          null,
          existingMapping,
          _mappingData,
          city_mapping_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "City Mapping updated successfully.",
            updatedMapping
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

router.post("/GetAssetCityMappings", async (req, res) => {
  const APIEndPointNo = "#CITYMAP002";
  try {
    const _assetId = mongoose.Types.ObjectId.isValid(req.body.asset_id)
      ? mongoose?.Types?.ObjectId(req.body.asset_id)
      : null;
    const mappings = await AssetCityMapping.find({
      AssetId: mongoose.Types.ObjectId(_assetId),
    })
      .populate("AssetId", "AssetName")
      .populate("CityID", "lookup_value")
      .populate("CityGroupID", "lookup_value");

    if (!mappings || mappings.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS,  __deepClone(mappings).map((data) => ({
        _id: data._id,
        asset_id: data.AssetId?._id,
        asset_name: data.AssetId?.AssetName,
        group_name: data.GroupName,
        city_name: data.CityID,
        city_group: data.CityGroupID.map((data) => ({
          _id: data?._id,
          lookup_value: data?.lookup_value,
        })),
        is_active: data.IsActive,
      })))
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

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
const { checkMarketData } = require("../Middleware/middleMarket");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post("/SaveMarket", checkMarketData, async (req, res) => {
  const APIEndPointNo = "#MARKET001";
  try {
    const {
      market_id,
      asset_type_id,
      parent_id,
      entry_by,
      category_id,
      sub_category_id,
      name,
      address_id,
    } = req.body;

    const _assetCode = await __AssetCode("MARKET");

    const _marketData = {
      AssetCode: _assetCode,
      AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
      ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
      AssetName: name,
      EntryBy: mongoose.Types.ObjectId(entry_by),
      UpdateBy: null,
      Market: {
        CategoryID: mongoose.Types.ObjectId(category_id),
        SubCategoryID: sub_category_id
          ? mongoose.Types.ObjectId(sub_category_id)
          : null,
        Name: name,
        AddressID: mongoose.Types.ObjectId(address_id),
      },
    };

    if (!market_id) {
      const newMarket = await AssetMaster.create(_marketData);
      __CreateAuditLog(
        "asset_master",
        "Market.Add",
        null,
        null,
        _marketData,
        newMarket._id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Market added successfully.", newMarket)
      );
    } else {
      const existingMarket = await AssetMaster.findOne({ _id: market_id });
      if (!existingMarket) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedMarket = await AssetMaster.updateOne(
        { _id: market_id },
        { $set: _marketData }
      );

      __CreateAuditLog(
        "asset_master",
        "Market.Edit",
        null,
        existingMarket,
        _marketData,
        market_id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Market updated successfully.", updatedMarket)
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

router.get("/GetMarketList", async (req, res) => {
  const APIEndPointNo = "#MARKET002";
  try {
    // Get MARKET Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_MARKET",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "MARKET Asset Type not found in settings.")
      );
    }

    const marketList = await AssetMaster.find({
      // "Market.Name": { $exists: true },
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("Market.CategoryID", "lookup_value")
      .populate("Market.SubCategoryID", "lookup_value")
      .populate({
        path: "Market.AddressID",
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

    if (!marketList || marketList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        marketList: marketList.map((market) => ({
          market_id: market._id,
          assetTypeId: market.AssetTypeID?._id,
          assetTypeName: market.AssetTypeID?.lookup_value,
          parentId: market.ParentID?._id,
          parentName: market.ParentID?.AssetName,
          name: market.Market?.Name,
          categoryId: market.Market?.CategoryID?._id,
          categoryName: market.Market?.CategoryID?.lookup_value,
          subCategoryId: market.Market?.SubCategoryID?._id,
          subCategoryName: market.Market?.SubCategoryID?.lookup_value,
          address: market.Market?.AddressID
            ? {
                _id: market.Market.AddressID._id,
                address_type:
                  market.Market.AddressID.AddressTypeId?.lookup_value,
                line1: market.Market.AddressID.AddressLine1,
                line2: market.Market.AddressID.AddressLine2,
                city: market.Market.AddressID.CityId?.lookup_value,
                state: market.Market.AddressID.StateId?.lookup_value,
                country: market.Market.AddressID.CountryId?.lookup_value,
                pin: market.Market.AddressID.PIN,
                full_address: `${market.Market.AddressID.AddressLine1}, ${market.Market.AddressID.AddressLine2}, ${market.Market.AddressID.CityId?.lookup_value}, ${market.Market.AddressID.StateId?.lookup_value}, ${market.Market.AddressID.CountryId?.lookup_value} - ${market.Market.AddressID.PIN}`,
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

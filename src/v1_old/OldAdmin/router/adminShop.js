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
const { checkShopData } = require("../Middleware/middleShop");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post("/SaveShop", checkShopData, async (req, res) => {
  const APIEndPointNo = "#SHOP001";
  try {
    const {
      shop_id,
      asset_type_id,
      parent_id,
      entry_by,
      category_id,
      name,
      address_id,
      market_id,
      plant_factory_id,
      is_factory_outlet,
      is_shopping_mall,
    } = req.body;

    const _assetCode = await __AssetCode("SHOP");

    const _shopData = {
      AssetCode: _assetCode,
      AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
      ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
      AssetName: name,
      EntryBy: mongoose.Types.ObjectId(entry_by),
      UpdateBy: null,
      Shop: {
        CategoryID: mongoose.Types.ObjectId(category_id),
        Name: name,
        AddressID: mongoose.Types.ObjectId(address_id),
        MarketID: market_id ? mongoose.Types.ObjectId(market_id) : null,
        PlantFactoryID: plant_factory_id
          ? mongoose.Types.ObjectId(plant_factory_id)
          : null,
        IsFactoryOutlet: is_factory_outlet || false,
        IsShoppingMall: is_shopping_mall || false,
      },
    };
    console.log(_shopData,"_shopData`") 

    if (!shop_id) {
      const newShop = await AssetMaster.create(_shopData);
      __CreateAuditLog(
        "asset_master",
        "Shop.Add",
        null,
        null,
        _shopData,
        newShop._id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Shop added successfully.", newShop)
      );
    } else {
      const existingShop = await AssetMaster.findOne({ _id: shop_id });
      if (!existingShop) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedShop = await AssetMaster.updateOne(
        { _id: shop_id },
        { $set: _shopData }
      );

      __CreateAuditLog(
        "asset_master",
        "Shop.Edit",
        null,
        existingShop,
        _shopData,
        shop_id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Shop updated successfully.", updatedShop)
      );
    }
  } catch (error) {

    console.log(error)
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

router.get("/GetShopList", async (req, res) => {
  const APIEndPointNo = "#SHOP002";
  try {
    // Get SHOP Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_SHOP",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "SHOP Asset Type not found in settings.")
      );
    }

    const shopList = await AssetMaster.find({
      //  "Shop.Name": { $exists: true }
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("Shop.CategoryID", "lookup_value")
      .populate({
        path: "Shop.AddressID",
        model: "address_master", // Refers to address_master schema
        // match: { IsCurrent: true }, // Filter for current address only
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
      })
      .populate("Shop.MarketID", "AssetName")
      .populate("Shop.PlantFactoryID", "AssetName");

    if (!shopList || shopList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        shopList: shopList.map((shop) => ({
          shop_id: shop._id,
          assetTypeId: shop.AssetTypeID?._id,
          assetTypeName: shop.AssetTypeID?.lookup_value,
          parentId: shop.ParentID?._id,
          parentName: shop.ParentID?.AssetName,
          name: shop.Shop?.Name,
          categoryId: shop.Shop?.CategoryID?._id,
          categoryName: shop.Shop?.CategoryID?.lookup_value,
          marketId: shop.Shop?.MarketID?._id,
          marketName: shop.Shop?.MarketID?.AssetName,
          plantFactoryId: shop.Shop?.PlantFactoryID?._id,
          plantFactoryName: shop.Shop?.PlantFactoryID?.AssetName,
          isFactoryOutlet: shop.Shop?.IsFactoryOutlet,
          isShoppingMall: shop.Shop?.IsShoppingMall,
          address: shop.Shop?.AddressID
            ? {
                _id: shop.Shop.AddressID._id,
                address_type:
                shop.Shop.AddressID.AddressTypeId
                  ?.lookup_value,
                address_type: shop.Shop.AddressID.AddressTypeId?.lookup_value,
                line1: shop.Shop.AddressID.AddressLine1,
                line2: shop.Shop.AddressID.AddressLine2,
                city: shop.Shop.AddressID.CityId?.lookup_value,
                state: shop.Shop.AddressID.StateId?.lookup_value,
                country: shop.Shop.AddressID.CountryId?.lookup_value,
                pin: shop.Shop.AddressID.PIN,
                full_address: `${shop.Shop.AddressID.AddressLine1}, ${shop.Shop.AddressID.AddressLine2}, ${shop.Shop.AddressID.CityId?.lookup_value}, ${shop.Shop.AddressID.StateId?.lookup_value}, ${shop.Shop.AddressID.CountryId?.lookup_value} - ${shop.Shop.AddressID.PIN}`,
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
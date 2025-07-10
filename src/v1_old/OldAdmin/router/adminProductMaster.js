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
const { checkProductData } = require("../Middleware/middleProductMaster");
const ProductMaster = require("../../../models/ProductMaster");

// **Save Product**
router.post("/SaveProduct", checkProductData, async (req, res) => {
  const APIEndPointNo = "#PRODUCT001";
  try {
    const {
      product_id,
      asset_id,
      category_id,
      sub_category_id,
      brand_id,
      plant_id,
      product_name,
      short_desc,
      long_desc,
      city_id,
      city_group_id,
      mrp,
      discounts,
      offer_price,
      product_images,
      product_videos,
      is_odop,
      is_vocal_for_local,
      is_active,
    } = req.body;

    const _productData = {
      AssetId: mongoose.Types.ObjectId(asset_id),
      CategoryID: mongoose.Types.ObjectId(category_id),
      SubCategoryID: sub_category_id
        ? mongoose.Types.ObjectId(sub_category_id)
        : null,
      BrandID: mongoose.Types.ObjectId(brand_id),
      PlantID: plant_id
        ? plant_id.map((id) => mongoose.Types.ObjectId(id))
        : [],
      ProductName: product_name,
      ShortDesc: short_desc || "",
      LongDesc: long_desc || "",
      CityID: city_id ? mongoose.Types.ObjectId(city_id) : null,
      CityGroupID: city_group_id
        ? city_group_id.map((id) => mongoose.Types.ObjectId(id))
        : [],
      MRP: mrp,
      Discounts: discounts || 0,
      OfferPrice: offer_price || mrp,
      ProductImages: product_images || [],
      ProductVideos: product_videos || [],
      IsODOP: is_odop || false,
      IsVocalForLocal: is_vocal_for_local || false,
      IsActive: is_active || true,
    };

    if (!product_id) {
      const newProduct = await ProductMaster.create(_productData);
      __CreateAuditLog(
        "product_master",
        "Product.Add",
        null,
        null,
        _productData,
        newProduct._id,
        asset_id,
        null
      );
      return res.json(
        __requestResponse("200", "Product added successfully.", newProduct)
      );
    } else {
      const existingProduct = await ProductMaster.findOne({ _id: product_id });
      if (!existingProduct) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedProduct = await ProductMaster.updateOne(
        { _id: product_id },
        { $set: _productData }
      );

      __CreateAuditLog(
        "product_master",
        "Product.Edit",
        null,
        existingProduct,
        _productData,
        product_id,
        asset_id,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Product updated successfully.",
          updatedProduct
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

// **Get Product List**
router.get("/GetProductList", async (req, res) => {
  const APIEndPointNo = "#PRODUCT002";
  try {
    const productList = await ProductMaster.find()
      .populate("AssetId", "AssetName")
      .populate("CategoryID", "lookup_value")
      .populate("SubCategoryID", "lookup_value")
      .populate("BrandID", "Name")
      .populate("PlantID", "AssetName")
      .populate({
        path: "CityID CityGroupID",
        select: "lookup_value",
      });

    if (!productList || productList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        data: productList.map((data) => ({
          _id: data._id,
          assetId: data.AssetId?._id,
          assetName: data.AssetId?.AssetName,
          categoryId: data.CategoryID?._id,
          categoryName: data.CategoryID?.lookup_value,
          subCategoryId: data.SubCategoryID?._id,
          subCategoryName: data.SubCategoryID?.lookup_value,
          brandId: data.BrandID?._id,
          brandName: data.BrandID?.Name,
          plantIds: data.PlantID?.map((plant) => plant._id),
          plantNames: data.PlantID?.map((plant) => plant.AssetName),
          productName: data.ProductName,
          shortDesc: data.ShortDesc,
          longDesc: data.LongDesc,
          cityId: data.CityID?._id,
          cityName: data.CityID?.lookup_value,
          cityGroupIds: data.CityGroupID?.map((city) => city._id),
          cityGroupNames: data.CityGroupID?.map((city) => city.lookup_value),
          mrp: data.MRP,
          discounts: data.Discounts,
          offerPrice: data.OfferPrice,
          productImages: data.ProductImages,
          productVideos: data.ProductVideos,
          isODOP: data.IsODOP,
          isVocalForLocal: data.IsVocalForLocal,
          isActive: data.IsActive,
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

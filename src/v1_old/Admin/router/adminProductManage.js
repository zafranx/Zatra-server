const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const Products = require("../../../models/Products");
const ProductDetails = require("../../../models/ProductDetails");

const { AssetMaster } = require("../../../models/AssetMaster");

const {
  checkProductData,
  checkProductDetailData,
} = require("../Middleware/middleProduct");
const { __CreateAuditLog } = require("../../../utils/auditlog");

//  Add or Edit Product
router.post("/SaveProduct", checkProductData, async (req, res) => {
  try {
    const {
      product_id,
      ProductTypeID,
      ProductDesc,
      ProductPictures,
      MRP,
      ProductCategoryID,
      ProductSubCategoryID,
      MaxCapPrice,
      ForExhibition,
      ExhibitorID,
      AssetID,
    } = req.body;

    const productData = {
      ProductTypeID,
      ProductDesc,
      ProductPictures,
      MRP,
      ProductCategoryID,
      ProductSubCategoryID,
      MaxCapPrice,
      ForExhibition,
      ExhibitorID,
      AssetID,
    };

    if (!product_id) {
      const created = await Products.create(productData);
      __CreateAuditLog(
        "products",
        "Product.Add",
        null,
        null,
        productData,
        created._id,
        AssetID
      );
      return res.json(__requestResponse("200", __SUCCESS, created));
    } else {
      const oldData = await Products.findById(product_id);
      if (!oldData)
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

      await Products.updateOne({ _id: product_id }, { $set: productData });
      __CreateAuditLog(
        "products",
        "Product.Edit",
        null,
        oldData,
        productData,
        product_id,
        AssetID
      );
      return res.json(__requestResponse("200", __SUCCESS, {}));
    }
  } catch (error) {
    return res.json(__requestResponse("500", error.message, __SOME_ERROR));
  }
});

router.post("/ListProducts", async (req, res) => {
  try {
    const products = await Products.find({})
      .populate("ProductTypeID", "lookup_value")
      .populate("ExhibitorID", "ExhibitorName")
      .populate("AssetID", "AssetName");

    const finalList = [];

    for (const product of products) {
      let categoryName = null;
      let subCategoryName = null;

      if (product.AssetID) {
        const asset = await AssetMaster.findById(product.AssetID);

        if (asset) {
          const category = asset.ProductCategories?.find(
            (cat) =>
              cat._id?.toString() === product.ProductCategoryID?.toString()
          );
          const subCategory = asset.ProductSubCategories?.find(
            (sub) =>
              sub._id?.toString() === product.ProductSubCategoryID?.toString()
          );

          categoryName = category?.CategoryName || null;
          subCategoryName = subCategory?.SubCategoryName || null;
        }
      }

      finalList.push({
        _id: product._id,
        // ProductTypeID: product.ProductTypeID?.lookup_value,
        ProductTypeID: product.ProductTypeID,
        ProductDesc: product.ProductDesc,
        MRP: product.MRP,
        MaxCapPrice: product.MaxCapPrice,
        // AssetID: product.AssetID?.AssetName,
        AssetID: product.AssetID,
        ForExhibition: product.ForExhibition,
        ExhibitorID: product.ExhibitorID,
        ProductCategory: {
          _id: product.ProductCategoryID,
          name: categoryName,
        },
        ProductSubCategory: {
          _id: product.ProductSubCategoryID,
          name: subCategoryName,
        },
        ProductPictures: product.ProductPictures,
        createdAt: product.createdAt,
      });
    }

    return res.json(__requestResponse("200", __SUCCESS, finalList));
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

//  product detail Apis

router.post("/debug", (req, res) => {
  console.log("🔥 DEBUG ROUTE HIT");
  res.send("ok");
});

//  Add/Edit Product Detail
router.post("/SaveProductDetail", checkProductDetailData, async (req, res) => {
  const APIEndPointNo = "#PRODUCT_DETAIL_001";
  try {
    const { detail_id, ProductID, ValueType, ValueKey, Value } = req.body;

    const data = { ProductID, ValueType, ValueKey, Value };

    if (!detail_id) {
      const created = await ProductDetails.create(data);
      // audit log
      __CreateAuditLog(
        "products_details",
        "ProductDetail.Add",
        null,
        null,
        data,
        created._id,
        ProductID,
        null
      );
      return res.json(
        __requestResponse("200", "Product Detail Added", created)
      );
    } else {
      const existing = await ProductDetails.findById(detail_id);
      if (!existing) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
      }

      await ProductDetails.updateOne({ _id: detail_id }, { $set: data });
      // audit log
      __CreateAuditLog(
        "products_details",
        "ProductDetail.Edit",
        null,
        existing,
        data,
        detail_id,
        ProductID,
        null
      );
      return res.json(__requestResponse("200", "Product Detail Updated"));
    }
  } catch (error) {
    console.error("SaveProductDetail Error:", error.message);
    return res.json(
      __requestResponse("500", `${APIEndPointNo}_0.1: ${error.message}`)
    );
  }
});

router.post("/ListProductDetails", async (req, res) => {
  const APIEndPointNo = "#PRODUCT_DETAIL_002";
  try {
    const { ProductID } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ProductID)) {
      return res.json(__requestResponse("400", "Invalid Product ID"));
    }

    const details = await ProductDetails.find({ ProductID });

    return res.json(__requestResponse("200", __SUCCESS, details));
  } catch (error) {
    console.error("ListProductDetails Error:", error.message);
    return res.json(
      __requestResponse("500", `${APIEndPointNo}_0.1: ${error.message}`)
    );
  }
});


module.exports = router;

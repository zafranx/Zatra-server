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
const { checkBrandData } = require("../Middleware/middleBrand");
const BrandMaster = require("../../../models/BrandMaster");

router.post("/SaveBrand", checkBrandData, async (req, res) => {
  const APIEndPointNo = "#BRAND001";
  try {
    let {
      brand_id,
      assetId,
      categoryId,
      subCategoryId,
      name,
      shortDesc,
      longDesc,
      trademarkImages,
      caption,
    } = req.body;

    const _brandData = {
      AssetId: mongoose.Types.ObjectId(assetId),
      // CategoryID: mongoose.Types.ObjectId(categoryId),
      CategoryID: categoryId ? mongoose.Types.ObjectId(categoryId) : null,
      SubCategoryID: subCategoryId
        ? mongoose.Types.ObjectId(subCategoryId)
        : null,
      Name: name,
      ShortDesc: shortDesc || "",
      LongDesc: longDesc || "",
      // TrademarkImages: trademarkImages || [],
      TrademarkImages: Array.isArray(trademarkImages) ? trademarkImages : [],
      Caption: caption || "",
    };

    if (!brand_id) {
      // Create a new brand
      const newBrand = await BrandMaster.create(_brandData);
      __CreateAuditLog(
        "brands_master",
        "Brand.Add",
        null,
        null,
        _brandData,
        newBrand._id,
        assetId,
        null
      );
      return res.json(
        __requestResponse("200", "Brand added successfully.", newBrand)
      );
    } else {
      // Validate `brand_id`
      if (!mongoose.isValidObjectId(brand_id)) {
        return res.json(__requestResponse("400", "Invalid Brand ID"));
      }

      // Update existing brand
      const existingBrand = await BrandMaster.findOne({ _id: brand_id });
      if (!existingBrand) {
        return res.json(__requestResponse("400", "Brand not found"));
      }

      const updatedBrand = await BrandMaster.updateOne(
        { _id: brand_id },
        { $set: _brandData }
      );

      __CreateAuditLog(
        "brands_master",
        "Brand.Edit",
        null,
        existingBrand,
        _brandData,
        brand_id,
        assetId,
        null
      );
      return res.json(
        __requestResponse("200", "Brand updated successfully.", updatedBrand)
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

// GET Brand List
router.get("/GetBrandList", async (req, res) => {
  try {
    const brandList = await BrandMaster.find()
      .populate("AssetId", "AssetName") // Populate Asset Name from Asset Master
      .populate("CategoryID", "lookup_value") // Populate Category Name from Lookups
      .populate("SubCategoryID", "lookup_value"); // Populate SubCategory Name from Lookups

    if (!brandList || brandList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        brandList: __deepClone(brandList).map((brand) => ({
          brand_id: brand._id,
          assetId: brand.AssetId?._id,
          assetName: brand.AssetId?.AssetName,
          categoryId: brand.CategoryID?._id,
          categoryName: brand.CategoryID?.lookup_value,
          subCategoryId: brand.SubCategoryID?._id,
          subCategoryName: brand.SubCategoryID?.lookup_value,
          name: brand.Name,
          shortDesc: brand.ShortDesc,
          longDesc: brand.LongDesc,
          trademarkImages: brand.TrademarkImages,
          caption: brand.Caption,
        })),
      })
    );
  } catch (error) {
    console.error("Error in GetBrandList:", error);
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

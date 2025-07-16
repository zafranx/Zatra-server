const express = require("express");
const router = express.Router();

const BrandMaster = require("../../../models/BrandMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { validateSaveBrand } = require("../Middleware/brandMaster.validation");

// {
//   "BrandAssociatedWith": "664f11c2c2f8e23dcf8b6b12",  // ID from either asset_user_master or asset_master
//   "CreatedRef": "asset_user_master",                 // or "asset_master"
//   "AssetId": "664f11c2c2f8e23dcf8b6b45",
//   "ProductId": "664f11c2c2f8e23dcf8b6e99",
//   "BrandTypeId": "664f11c2c2f8e23dcf8b6123",
//   "BrandImage": "https://cdn.example.com/brand-image.jpg",
//   "BrandText": "Luxury Perfume Brand",
//   "BrandAdvertisements": "https://cdn.example.com/ad.jpg",
//   "BrandVideos": "https://cdn.example.com/ad.mp4",
//   "Comments": "Top rated brand for summer collection"
// }

// Add/Edit Brand
router.post("/SaveBrand", validateSaveBrand, async (req, res) => {
  try {
    const {
      _id,
      BrandAssociatedWith,
      CreatedRef,
      AssetId,
      ProductId,
      BrandTypeId,
      BrandImage,
      BrandText,
      BrandAdvertisements,
      BrandVideos,
      Comments,
    } = req.body;

    const brandData = {
      BrandAssociatedWith,
      CreatedRef,
      AssetId,
      ProductId,
      BrandTypeId,
      BrandImage,
      BrandText,
      BrandAdvertisements,
      BrandVideos,
      Comments,
    };

    if (!_id) {
      const newRec = await BrandMaster.create(brandData);
      await __CreateAuditLog(
        "brand_master",
        "Brand.Add",
        null,
        null,
        brandData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await BrandMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await BrandMaster.updateOne({ _id }, { $set: brandData });
      await __CreateAuditLog(
        "brand_master",
        "Brand.Edit",
        null,
        oldRec,
        brandData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// Brand List with optional filter & pagination old
router.post("/BrandList_old", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.body;
    const query = {};

    if (search && search.trim() !== "") {
      query.BrandText = { $regex: search.trim(), $options: "i" };
    }

    const skip = (page - 1) * limit;

    const total = await BrandMaster.countDocuments(query);
    const list = await BrandMaster.find(query)
      .populate({
        path: "BrandAssociatedWith",
        select: "Name",
        strictPopulate: false,
      })
      .populate("AssetId", "Name")
      .populate("ProductId", "ProductName")
      .populate("BrandTypeId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page,
        limit,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// New api
// Brand List with optional filter & pagination (dynamic population)
router.post("/BrandList", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.body;
    const query = {};

    if (search && search.trim() !== "") {
      query.BrandText = { $regex: search.trim(), $options: "i" };
    }

    const skip = (page - 1) * limit;
    const total = await BrandMaster.countDocuments(query);

    let list = await BrandMaster.find(query)
      .populate("AssetId", "Name")
      .populate("ProductId", "ProductName")
      .populate("BrandTypeId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Dynamic population of BrandAssociatedWith based on CreatedRef
    list = await Promise.all(
      list.map(async (brand) => {
        let associatedData = null;

        if (brand.CreatedRef === "asset_master") {
          associatedData = await require("../../../models/AssetMaster").findById(
            brand.BrandAssociatedWith
          ).select("Name");
        } else if (brand.CreatedRef === "product_master") {
          associatedData = await require("../../../models/ProductMaster").findById(
            brand.BrandAssociatedWith
          ).select("ProductName");
        }

        return {
          ...brand,
          BrandAssociatedWith: associatedData,
        };
      })
    );

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page,
        limit,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});


module.exports = router;

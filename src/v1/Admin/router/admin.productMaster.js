const express = require("express");
const router = express.Router();

const ProductMaster = require("../../../models/ProductMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { validateSaveProduct } = require("../Middleware/productMaster.validation");

// Save (Add/Edit) Product
router.post("/SaveProduct", validateSaveProduct, async (req, res) => {
  try {
    const {
      _id,
      LegalEntityId,
      CategoryId,
      SubCategoryId,
      BrandId,
      ProductName,
      ShortDesc,
      LongDesc,
      ProductImages,
      ProductVideos,
      IsActive,
    } = req.body;

    const saveData = {
      LegalEntityId,
      CategoryId,
      SubCategoryId,
      BrandId,
      ProductName,
      ShortDesc,
      LongDesc,
      ProductImages,
      ProductVideos,
      IsActive,
    };

    if (!_id) {
      const newRec = await ProductMaster.create(saveData);
      await __CreateAuditLog(
        "product_master",
        "Product.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await ProductMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await ProductMaster.updateOne(
        { _id },
        { $set: saveData }
      );
      await __CreateAuditLog(
        "product_master",
        "Product.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// Product List (with pagination and optional filters)
router.post("/ProductList", async (req, res) => {
  try {
    const {
      BrandId,
      CategoryId,
      SubCategoryId,
      LegalEntityId,
      IsActive,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};

    if (BrandId) filter.BrandId = BrandId;
    if (CategoryId) filter.CategoryId = CategoryId;
    if (SubCategoryId) filter.SubCategoryId = SubCategoryId;
    if (LegalEntityId) filter.LegalEntityId = LegalEntityId;
    if (typeof IsActive === "boolean") filter.IsActive = IsActive;

    if (search) {
      filter.ProductName = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProductMaster.find(filter)
        .populate("LegalEntityId", "Name")
        .populate("CategoryId", "lookup_value")
        .populate("SubCategoryId", "lookup_value")
        .populate("BrandId", "BrandName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        data: __deepClone(data),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});
  

module.exports = router;

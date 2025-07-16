const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");

const ProductMaster = require("../../../models/ProductMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateSaveProduct,
  validateSaveProductVariant,
  validateSaveProductInventory,
  validateSaveProductInward,
} = require("../Middleware/productMaster.validation");
const ProductVariantMaster = require("../../../models/ProductVariantMaster");
const ProductInventoryMaster = require("../../../models/ProductInventoryMaster");
const ProductInwardMovement = require("../../../models/ProductInwardMovement");
const ProductOutwardMovement = require("../../../models/ProductOutwardMovement");

// Save (Add/Edit) Product
router.post("/SaveProduct", validateSaveProduct, async (req, res) => {
  try {
    const {
      _id,
      AssetId,
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
      AssetId,
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

    if (!_id || _id === "" || _id === null) {
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
      AssetId,
      IsActive,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};

    if (BrandId) filter.BrandId = BrandId;
    if (CategoryId) filter.CategoryId = CategoryId;
    if (SubCategoryId) filter.SubCategoryId = SubCategoryId;
    if (AssetId) filter.AssetId = AssetId;
    if (typeof IsActive === "boolean") filter.IsActive = IsActive;

    if (search) {
      filter.ProductName = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProductMaster.find(filter)
        .populate("AssetId", "Name")
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
        list: __deepClone(data),
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

// Save Product Variant (Add/Edit)
router.post(
  "/SaveProductVariant",
  validateSaveProductVariant,
  async (req, res) => {
    try {
      const {
        _id,
        AssetId,
        ProductId,
        ProductVariantName,
        VariantCode,
        ShortDesc,
        LongDesc,
        ImageGallery,
        VideoGallery,
        MRP,
        OnlyForB2B,
      } = req.body;

      const saveData = {
        AssetId,
        ProductId,
        ProductVariantName,
        VariantCode,
        ShortDesc,
        LongDesc,
        ImageGallery,
        VideoGallery,
        MRP,
        OnlyForB2B,
      };

      if (!_id || _id === "" || _id === null) {
        const newRec = await ProductVariantMaster.create(saveData);
        await __CreateAuditLog(
          "product_variant_master",
          "ProductVariant.Add",
          null,
          null,
          saveData,
          newRec._id
        );
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await ProductVariantMaster.findById(_id);
        if (!oldRec)
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        const updated = await ProductVariantMaster.updateOne(
          { _id },
          { $set: saveData }
        );

        await __CreateAuditLog(
          "product_variant_master",
          "ProductVariant.Edit",
          null,
          oldRec,
          saveData,
          _id
        );
        return res.json(__requestResponse("200", __SUCCESS, updated));
      }
    } catch (error) {
      console.log(error);
      return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
  }
);

// List Product Variants
router.post("/ProductVariantList", async (req, res) => {
  try {
    const { ProductId } = req.body;
    const filter = ProductId ? { ProductId } : {};

    const variants = await ProductVariantMaster.find(filter)
      .populate("AssetId", "Name") // Asset Name
      .populate("ProductId", "ProductName")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(__requestResponse("200", __SUCCESS, __deepClone(variants)));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// Add / Edit SaveProductInventory
router.post(
  "/SaveProductInventory",
  validateSaveProductInventory,
  async (req, res) => {
    try {
      // const _id = mongoose.Types.ObjectId(req.body._id);
      const { _id, AssetId, ProductVariantId, LotNo, Quantity } = req.body;
      const saveData = { AssetId, ProductVariantId, LotNo, Quantity };

      if (!_id || _id === "" || _id === null) {
        const newRec = await ProductInventoryMaster.create(saveData);
        await __CreateAuditLog(
          "product_inventory_master",
          "ProductInventory.Add",
          null,
          null,
          saveData,
          newRec._id
        );
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await ProductInventoryMaster.findById(_id);
        if (!oldRec)
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        const updated = await ProductInventoryMaster.updateOne(
          { _id },
          { $set: saveData }
        );
        await __CreateAuditLog(
          "product_inventory_master",
          "ProductInventory.Edit",
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
  }
);

// ProductInventoryList
router.post("/ProductInventoryList", async (req, res) => {
  try {
    const { ProductVariantId, LotNo, page = 1, limit = 10 } = req.body;

    const filter = {};
    if (ProductVariantId) filter.ProductVariantId = ProductVariantId;
    if (LotNo) filter.LotNo = { $regex: LotNo, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProductInventoryMaster.find(filter)
        .populate("AssetId", "Name") // Asset Name
        .populate("ProductVariantId", "ProductVariantName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductInventoryMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
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

// SaveProductInward API
router.post(
  "/SaveProductInward",
  validateSaveProductInward,
  async (req, res) => {
    try {
      const {
        _id: rawId,
        ProductVariantId,
        LotNo,
        InputQuantity,
        DateTime,
      } = req.body;
      const saveData = { ProductVariantId, LotNo, InputQuantity, DateTime };

      let _id = null;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        _id = mongoose.Types.ObjectId(rawId);
      }

      if (!_id) {
        const newRec = await ProductInwardMovement.create(saveData);
        await __CreateAuditLog(
          "product_inward_movement",
          "ProductInward.Add",
          null,
          null,
          saveData,
          newRec._id
        );
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await ProductInwardMovement.findById(_id);
        if (!oldRec)
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        const updated = await ProductInwardMovement.updateOne(
          { _id },
          { $set: saveData }
        );
        await __CreateAuditLog(
          "product_inward_movement",
          "ProductInward.Edit",
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
  }
);
// ProductInwardList
router.post("/ProductInwardList", async (req, res) => {
  try {
    const { ProductVariantId, LotNo, page = 1, limit = 10 } = req.body;

    const filter = {};
    if (ProductVariantId) filter.ProductVariantId = ProductVariantId;
    if (LotNo) filter.LotNo = { $regex: LotNo, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProductInwardMovement.find(filter)
        .populate("ProductVariantId", "ProductVariantName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductInwardMovement.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
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

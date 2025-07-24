// routes/cityContact.routes.js
const express = require("express");
const router = express.Router();
const CityContactMaster = require("../../../models/CityContactMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const HelplineMaster = require("../../../models/HelplineMaster");
const GovtPolicyMaster = require("../../../models/GovtPolicyMaster");
const ProjectMaster = require("../../../models/ProjectMaster");
const DestinationMaster = require("../../../models/DestinationMaster");
const DestinationAmenitiesMaster = require("../../../models/DestinationAmenitiesMaster");
const ProductMaster = require("../../../models/ProductMaster");
const AssetMaster = require("../../../models/AssetMaster");
const ProductVariantMaster = require("../../../models/ProductVariantMaster");

// List City Contacts with optional filter & pagination
router.post("/CityContactList", async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      CityId,
      ContactTypeId,
    } = req.body;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const filter = {};
    if (search) {
      filter.ContactName = { $regex: search, $options: "i" };
    }
    if (CityId) filter.CityId = CityId;
    if (ContactTypeId) filter.ContactTypeId = ContactTypeId;

    const total = await CityContactMaster.countDocuments(filter);
    const list = await CityContactMaster.find(filter)
      .populate("CityId", "lookup_value")
      .populate("ContactTypeId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitInt)
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: pageInt,
        limit: limitInt,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// List Helplines with pagination and search
router.post("/HelplineList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;

    const filter = {};
    if (search) {
      filter.ContactPersonName = { $regex: search, $options: "i" };
    }
    if (CityId) {
      filter.CityId = CityId;
    }

    const total = await HelplineMaster.countDocuments(filter);
    const list = await HelplineMaster.find(filter)
      .populate("CityId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// List GovtPolicy with pagination and search
router.post("/GovtPolicyList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;
    const filter = {};

    if (search) filter.PolicyTitle = { $regex: search, $options: "i" };
    if (CityId) filter.CityId = CityId;

    const total = await GovtPolicyMaster.countDocuments(filter);
    const list = await GovtPolicyMaster.find(filter)
      .populate("CityId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// 🔹 List Projects (with pagination and optional filters) or Investment Opportunties
router.post("/listProjectsOrInvestmentOpportunities", async (req, res) => {
  try {
    const {
      CityId,
      ProjectType,
      ApprovalStatus,
      Amenities,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};

    if (CityId) filter.CityId = CityId;
    if (ProjectType) filter.ProjectType = ProjectType;
    if (ApprovalStatus) filter.ApprovalStatus = ApprovalStatus;
    if (Amenities && Array.isArray(Amenities) && Amenities.length > 0) {
      filter.Amenities = { $in: Amenities };
    }

    if (search) {
      filter.ProjectName = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      ProjectMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ProjectType", "lookup_value")
        .populate("AvailableSizes.Unit", "lookup_value")
        .populate("ApprovalStatus", "lookup_value")
        .populate("Amenities", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      ProjectMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: parsedPage,
        limit: parsedLimit,
        list: __deepClone(data),
      })
    );
  } catch (error) {
    console.error("❌ Error in listProjects:", error);
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// Destination List
// (City ID, Destination Type ID, Search, Page, Limit)
router.post("/DestinationList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationTypeId,
      DestinationSubTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationTypeId) filter.DestinationTypeId = DestinationTypeId;
    if (DestinationSubTypeId)
      filter.DestinationSubTypeId = DestinationSubTypeId;
    if (search) filter.Destination = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationTypeId", "lookup_value")
        .populate("DestinationSubTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationMaster.countDocuments(filter),
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
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// DestinationAmenities List
// (City ID, DestinationID, AmenityID, Search, Page, Limit)
router.post("/DestinationAmenitiesList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationId,
      AmenityTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationId) filter.DestinationId = DestinationId;
    if (AmenityTypeId) filter.AmenityTypeId = AmenityTypeId;
    if (search) filter.Amenity = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationAmenitiesMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationId", "lookup_value")
        .populate("AmenityTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationAmenitiesMaster.countDocuments(filter),
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
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// AssetList with Product Count New api
router.post("/AssetList", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetId,
      LegalEntityTypeId,
      Industry_Sector,
      Industry_Sub_Sector,
      CityId,
      DestinationId,
      AssetType,
      EstablishmentId,
      CityIndicatorId,
    } = req.body;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const filter = {};
    if (search) {
      filter.Name = { $regex: search, $options: "i" };
    }
    if (AssetId) filter._id = AssetId;
    if (LegalEntityTypeId) filter.LegalEntityTypeId = LegalEntityTypeId;
    if (Industry_Sector) filter.Industry_Sector = Industry_Sector;
    if (Industry_Sub_Sector) filter.Industry_Sub_Sector = Industry_Sub_Sector;
    if (CityId) filter.CityId = CityId;
    if (DestinationId) filter.DestinationId = DestinationId;
    if (AssetType) filter.AssetType = AssetType;
    if (EstablishmentId) filter.EstablishmentId = EstablishmentId;
    if (CityIndicatorId) filter.CityIndicatorId = CityIndicatorId;

    const total = await AssetMaster.countDocuments(filter);

    let list = await AssetMaster.find(filter)
      .populate("CityId", "lookup_value")
      .populate("DestinationId", "Destination")
      .populate("LegalEntityTypeId", "lookup_value")
      .populate("Industry_Sector", "lookup_value")
      .populate("Industry_Sub_Sector", "lookup_value")
      .populate("CityIndicatorId", "CityIndicatorName")
      .populate("EstablishmentId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .lean();

    // Add Product Count per Asset
    const assetIds = list.map((asset) => asset._id);

    const productCounts = await ProductMaster.aggregate([
      { $match: { AssetId: { $in: assetIds } } },
      {
        $group: {
          _id: "$AssetId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    list = list.map((asset) => ({
      ...asset,
      ProductCount: countMap[asset._id.toString()] || 0,
    }));

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page: pageInt,
        limit: limitInt,
      })
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// Product List (with pagination and optional filters)
router.post("/ProductList_old", async (req, res) => {
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

// Run these in MongoDB for faster filtering/search:
// db.productmasters.createIndex({ ProductName: "text" });
// db.productmasters.createIndex({ BrandId: 1 });
// db.productmasters.createIndex({ CategoryId: 1 });
// db.productmasters.createIndex({ SubCategoryId: 1 });
// db.productmasters.createIndex({ AssetId: 1 });

// Product List (with variants included)
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

    const [products, total] = await Promise.all([
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

    const productIds = products.map((p) => p._id);

    // Fetch variants for these products
    const productVariants = await ProductVariantMaster.find({
      ProductId: { $in: productIds },
    })
      .select("-__v")
      .lean();

    // Group variants by ProductId
    const variantMap = {};
    productVariants.forEach((variant) => {
      const pid = variant.ProductId.toString();
      if (!variantMap[pid]) variantMap[pid] = [];
      variantMap[pid].push(variant);
    });

    // Attach variants to each product
    const enrichedProducts = products.map((product) => ({
      ...product,
      Variants: variantMap[product._id.toString()] || [],
    }));

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(enrichedProducts),
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

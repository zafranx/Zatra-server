const express = require("express");
const router = express.Router();
const PatientEducation = require("../../../models/PatientEducation");
const AdminLookup = require("../../../models/lookupmodel");

const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");
const {
  __RECORD_NOT_FOUND,
  __SUCCESS,
  __SOME_ERROR,
} = require("../../../utils/variable");

// Get Patient Education List
router.post("/PatientEducationList", async (req, res) => {
  try {
    // Extract page, limit, and LookupType from request body
    let { LookupType, Category, page = 1, limit = 20 } = req.body;

    if (!LookupType || LookupType.length === 0) {
      return res.json(__requestResponse("400", "Please provide LookupType(s)"));
    }

    // Ensure LookupType is always an array
    if (!Array.isArray(LookupType)) {
      LookupType = [LookupType]; // Convert to array if single value
    }

    // ** Convert LookupType Strings to ObjectIds**
    const lookupIds = await AdminLookup.find({
      lookup_value: { $in: LookupType }, // Match strings in admin_lookups
    }).select("_id");

    const lookupObjectIds = lookupIds.map((doc) => doc._id);

    if (lookupObjectIds.length === 0) {
      return res.json(__requestResponse("400", "Invalid LookupType(s)"));
    }

    // **Parse page and limit**
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // **Build Query Filter**
    const filter = {
      LookupType: { $in: lookupObjectIds },
      IsActive: true, // ✅ Fetch only `IsActive: true` from database
    };

    // // 🔹 If `category` is provided, add category filter
    // if (category && category.trim() !== "") {
    //   filter.Category = category;
    // }

    // **Apply Category Filtering (Exact & Starts With)**
    if (Category) {
      if (!Array.isArray(Category)) {
        Category = [Category]; // Convert to array if single value
      }

      // Create regex patterns for each category to match exact & starts-with
      const categoryRegex = Category.map((cat) => new RegExp(`^${cat}`, "i"));
      filter.$or = [
        { Category: { $in: Category } },
        { Category: { $in: categoryRegex } },
      ];
    }

    // **Fetch Data with Pagination**
    const posts = await PatientEducation.find(filter)
      .populate("AssetId", "AssetName")
      // .populate("LookupType", "lookup_value")
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Category SubCategory createdAt"
      )
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip((pageNumber - 1) * pageSize) //  Skip previous pages
      .limit(pageSize); //  Limit results per page

    // **Get Total Count for Pagination**
    const totalCount = await PatientEducation.countDocuments(filter);

    const response = {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      records: posts,
    };

    return res.json(
      __requestResponse("200", "Data fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error in PatientEducationList:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// not in use
router.post("/PatientEducationList-new", async (req, res) => {
  try {
    // Extract parameters from request body
    let { LookupType, Category, page = 1, limit = 20 } = req.body;

    // Ensure LookupType is always an array
    if (!LookupType || LookupType.length === 0) {
      return res.json(__requestResponse("400", "Please provide LookupType(s)"));
    }
    if (!Array.isArray(LookupType)) {
      LookupType = [LookupType]; // Convert single value to array
    }

    // **Convert LookupType Strings to ObjectIds**
    const lookupIds = await AdminLookup.find({
      lookup_value: { $in: LookupType },
    }).select("_id lookup_value");

    const lookupObjectIds = lookupIds.map((doc) => doc._id);
    const lookupTypeMappings = lookupIds.reduce((acc, doc) => {
      acc[doc._id.toString()] = doc.lookup_value;
      return acc;
    }, {});

    if (lookupObjectIds.length === 0) {
      return res.json(__requestResponse("400", "Invalid LookupType(s)"));
    }

    // **Parse page and limit**
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // **Build Query Filter**
    const filter = { LookupType: { $in: lookupObjectIds } };

    // // 🔹 If `category` is provided, add category filter
    // if (category && category.trim() !== "") {
    //   filter.Category = category;
    // }

    // **Step 4: Apply Category Filtering (Exact & Starts With)**
    if (Category) {
      if (!Array.isArray(Category)) {
        Category = [Category]; // Convert to array if single value
      }

      // Create regex patterns for each category to match exact & starts-with
      const categoryRegex = Category.map((cat) => new RegExp(`^${cat}`, "i"));
      filter.$or = [
        { Category: { $in: Category } },
        { Category: { $in: categoryRegex } },
      ];
    }

    // **Fetch Data with Pagination**
    const posts = await PatientEducation.find(filter)
      .populate("AssetId", "AssetName") // Populate Asset Name
      .populate("LookupType", "lookup_value") // Populate LookupType
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Category SubCategory LookupType"
      )
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip((pageNumber - 1) * pageSize) // Skip previous pages
      .limit(pageSize); // Limit results per page

    // ** Get Total Count for Pagination**
    const totalCount = await PatientEducation.countDocuments(filter);

    const response = {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      records: posts.map((post) => ({
        _id: post._id,
        AssetId: post.AssetId,
        AssetName: post.AssetId?.AssetName || "",
        Title: post.Title,
        YouTubeLink: post.YouTubeLink,
        YouTubeThumbnail: post.YouTubeThumbnail,
        Content: post.Content,
        Tags: post.Tags,
        Category: post.Category,
        SubCategory: post.SubCategory,
        LookupType: post.LookupType.map((lt) => ({
          _id: lt._id,
          lookup_value:
            lookupTypeMappings[lt._id.toString()] || lt.lookup_value,
        })),
      })),
    };

    return res.json(
      __requestResponse("200", "Data fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error in PatientEducationList:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// not in use
router.post("/PatientEducationListx", async (req, res) => {
  try {
    // Extract page and limit from query parameters with defaults
    const { LookupType, page = 1, limit = 20 } = req.body;
    if (!LookupType || LookupType?.length === 0) {
      return res.json(__requestResponse("400", "Please provide LookupType(s)"));
    }

    // Convert LookupType to an array if it's a single value
    if (!Array.isArray(LookupType)) {
      LookupType = [LookupType]; // Convert to an array
    }

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build the query filter for LookupType
    const filter = {
      LookupType: { $in: LookupType }, // Filters matching any LookupType
    };

    // Fetch data with pagination and sorting (latest blogs first)
    const posts = await PatientEducation.find(filter)
      .populate("AssetId", "AssetName")
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Category SubCategory"
      )
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip((pageNumber - 1) * pageSize) // Skip records for previous pages
      .limit(pageSize); // Limit results to the specified page size

    // Get total count for pagination metadata
    const totalCount = await PatientEducation.countDocuments();

    // Prepare the response
    const response = {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      records: posts,
    };

    return res.json(
      __requestResponse("200", "Data fetched successfully.", response)
    );
  } catch (error) {
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// Get Patient Education by ID
router.get("/PatientEducation/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json(__requestResponse("400", "Invalid PatientEducation ID."));
    }

    const post = await PatientEducation.findById(id)
      .populate("AssetId", "AssetName") // Include associated asset name
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Category SubCategory"
      );

    if (!post) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    // Return the post data
    return res.json(__requestResponse("200", __SUCCESS, post));
  } catch (error) {
    console.error("Error in PatientEducation/:id:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// Get Patient Education Categories for websites
router.post("/GetPatientEducationCategories", async (req, res) => {
  try {
    // asset_id means doctor id
    const { asset_id } = req.body;

    // Build match filter (if DoctorId is provided, filter by it)
    const matchFilter = asset_id
      ? { AssetId: mongoose.Types.ObjectId(asset_id) }
      : {};

    // Aggregation Pipeline to Get Unique Categories (excluding null or empty)
    const categories = await PatientEducation.aggregate([
      { $match: matchFilter }, // Apply DoctorId filter if exists
      { $group: { _id: "$Category" } }, // Group by Category
      { $match: { _id: { $nin: [null, ""] } } }, // Exclude null or empty categories
      { $project: { _id: 0, Category: "$_id" } }, // Format output
    ]);

    // Response Handling
    return res.json(
      __requestResponse("200", "Categories fetched successfully.", categories)
    );
  } catch (error) {
    console.error("Error in GetPatientEducationCategories:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

module.exports = router;

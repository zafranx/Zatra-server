const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PatientEducation = require("../../../models/PatientEducation");
const { __requestResponse } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  checkPatientEducation,
} = require("../Middleware/middlePatientEducation");
// const { __fetchToken } = require("../Middleware/adminAuthentication");

// Get Patient Education Categories
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

// not in use
router.post(
  "/SavePatientEducation-old",
  checkPatientEducation,
  // __fetchToken,
  async (req, res) => {
    const APIEndPointNo = "#PE0001";
    // const asset_id = req.user?.id; // getting id from middleware  __fetchToken

    try {
        let _lookup_type = req.body.lookup_type
          ? req.body.lookup_type.map((id) => mongoose.Types.ObjectId(id))
          : [];
console.log(_lookup_type, "_lookup_type");
      const {
        patientEducation_id,
        AssetId,
        Title,
        YouTubeLink,
        YouTubeThumbnail,
        Content,
        Category,
        SubCategory,
        Tags,
        IsActive,
      } = req.body;
      // console.log(req.body, "body SavePatientEducation");
      if (!patientEducation_id) {
        // Create new record
        const newPatientEducation = new PatientEducation({
          AssetId: mongoose.Types.ObjectId(AssetId),
          LookupType: _lookup_type,
          Title,
          YouTubeLink,
          YouTubeThumbnail,
          Content,
          Category,
          SubCategory,
          Tags,
          IsActive,
          ViewsCount: 0, // Initialize with 0 views
        });

        const createdRecord = await newPatientEducation.save();

        // Audit Log
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Add",
          null,
          null,
          createdRecord,
          createdRecord._id,
          null,
          null
        );

        return res.json(__requestResponse("200", __SUCCESS, createdRecord));
      } else {
        // Edit existing record
        const existingRecord = await PatientEducation.findById(
          patientEducation_id
        );
        if (!existingRecord) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedData = {
          AssetId,
          LookupType: _lookup_type,
          Title,
          YouTubeLink,
          YouTubeThumbnail,
          Content,
          Category,
          SubCategory,
          Tags,
          IsActive,
        };

        const updatedRecord = await PatientEducation.findByIdAndUpdate(
          patientEducation_id,
          updatedData,
          { new: true }
        );

        // Audit Log
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Edit",
          null,
          existingRecord,
          updatedRecord,
          patientEducation_id,
          null,
          null
        );

        return res.json(__requestResponse("200", __SUCCESS, updatedRecord));
      }
    } catch (error) {
      return res.json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
    }
  }
);

router.post(
  "/SavePatientEducation",
  checkPatientEducation,
  async (req, res) => {
    try {
      const APIEndPointNo = "#PE0001";

      let _lookup_type = req.body.lookup_type
        ? req.body.lookup_type.map((id) => new mongoose.Types.ObjectId(id))
        : [];

      console.log(_lookup_type, "_lookup_type");

      const {
        patientEducation_id,
        AssetId,
        Title,
        YouTubeLink,
        YouTubeThumbnail,
        Content,
        Category,
        SubCategory,
        Tags,
        IsActive,
      } = req.body;

      if (!patientEducation_id) {
        // Create new record
        const newPatientEducation = new PatientEducation({
          AssetId: mongoose.Types.ObjectId(AssetId),
          LookupType: _lookup_type, // Fix: Ensure it's properly assigned
          Title,
          YouTubeLink,
          YouTubeThumbnail,
          Content,
          Category,
          SubCategory,
          Tags,
          IsActive,
          ViewsCount: 0, // Initialize with 0 views
        });

        const createdRecord = await newPatientEducation.save();

        // Audit Log
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Add",
          null,
          null,
          createdRecord,
          createdRecord._id,
          null,
          null
        );

        return res.json(__requestResponse("200", __SUCCESS, createdRecord));
      } else {
        // Update existing record with explicit `$set`
        const existingRecord = await PatientEducation.findById(
          patientEducation_id
        );
        if (!existingRecord) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedRecord = await PatientEducation.findByIdAndUpdate(
          patientEducation_id,
          {
            $set: {
              AssetId: mongoose.Types.ObjectId(AssetId),
              LookupType: _lookup_type, // Fix: Explicitly set LookupType
              Title,
              YouTubeLink,
              YouTubeThumbnail,
              Content,
              Category,
              SubCategory,
              Tags,
              IsActive,
            },
          },
          { new: true, runValidators: true } // Fix: Ensure schema validation runs
        );

        // Audit Log
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Edit",
          null,
          existingRecord,
          updatedRecord,
          patientEducation_id,
          null,
          null
        );

        return res.json(__requestResponse("200", __SUCCESS, updatedRecord));
      }
    } catch (error) {
      console.log(error, "error");
      return res.json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
    }
  }
);


router.post(
  "/SavePatientEducation-new",
  checkPatientEducation,
  async (req, res) => {
    try {
      const APIEndPointNo = "#PE0001";

      // Convert lookup_type IDs to ObjectId
      let _lookup_type = req.body.lookup_type
        ? req.body.lookup_type.map((id) => mongoose.Types.ObjectId(id))
        : [];

      let _patientEducation_id = req.body.patientEducation_id;

      // Extract fields from the request body
      let title = req.body.title;
      let youtube_link = req.body.youtube_link;
      let youtube_thumbnail = req.body.youtube_thumbnail;
      let content = req.body.content;
      let category = req.body.category
        ? mongoose.Types.ObjectId(req.body.category)
        : null;
      let sub_category = req.body.sub_category
        ? mongoose.Types.ObjectId(req.body.sub_category)
        : null;
      let tags = req.body.tags || [];
      let is_active = req.body.is_active || false;

      let _local_patientEducation_id = null;

      let _patientEducationData = {
        LookupType: _lookup_type,
        Title: title,
        YouTubeLink: youtube_link,
        YouTubeThumbnail: youtube_thumbnail,
        Content: content,
        Category: category,
        SubCategory: sub_category,
        Tags: tags,
        IsActive: is_active,
        ViewsCount: 0, // Initialize view count
      };

      if (!_patientEducation_id) {
        // Create new Patient Education Record
        await PatientEducation
          .create(_patientEducationData)
          .then((x) => {
            _local_patientEducation_id = x._id;
            return res.status(200).json(__requestResponse("200", __SUCCESS, x));
          })
          .catch((error) => {
            return res.json(
              __requestResponse(
                "501",
                "Patient Education Save Error",
                `Error Code: ${APIEndPointNo}_1: ${error}`
              )
            );
          });

        // Create Audit Log
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Add",
          null,
          null,
          _patientEducationData,
          _local_patientEducation_id,
          null,
          null
        );
      } else {
        // Update existing Patient Education record
        const _oldrec = await PatientEducation.findOne({
          _id: _patientEducation_id,
        });

        const _patientEducationUpdate = await PatientEducation.updateOne(
          { _id: _patientEducation_id },
          {
            $set: {
              ..._patientEducationData,
            },
          }
        );

        // Create Audit Log for Update
        __CreateAuditLog(
          "patient_education",
          "PatientEducation.Edit",
          null,
          _oldrec ? _oldrec : null,
          _patientEducationData,
          _patientEducation_id,
          null,
          null
        );

        return res
          .status(200)
          .json(__requestResponse("200", __SUCCESS, _patientEducationUpdate));
      }
    } catch (error) {
      console.log(error, "error");
      return res.json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error}`
        )
      );
    }
  }
);

// not in use
router.get("/PatientEducationList", async (req, res) => {
  try {
    // Extract page and limit from query parameters with defaults
    const { page = 1, limit = 20 } = req.query;

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Fetch data with pagination and sorting (latest blogs first)
    const posts = await PatientEducation.find()
      .populate("AssetId", "AssetName")
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags LikeCount CommentCount ViewsCount"
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
// not in use
router.get("/PatientEducationList2", async (req, res) => {
  try {
    const { AssetId, page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    // Validate AssetId
    if (AssetId && !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.json(__requestResponse("400", "Invalid AssetId."));
    }

    // Build the match stage based on AssetId
    const matchStage = AssetId
      ? { AssetId: mongoose.Types.ObjectId(AssetId) }
      : {};

    // Match stage to filter by AssetId
    // const matchStage = AssetId
    //   ? { AssetId: mongoose.Types.ObjectId(AssetId), isActive: true }
    //   : { isActive: true };

    const pipeline = [
      // { $match: { ...matchStage, isActive: true } }, // Filter by AssetId and active blogs
      { $match: matchStage }, // Filter by AssetId and isActive

      // Match active blogs
      // { $match: { isActive: true } },

      // Lookup Asset data
      {
        $lookup: {
          from: "asset_masters",
          localField: "AssetId",
          foreignField: "_id",
          as: "AssetData",
        },
      },
      { $unwind: { path: "$AssetData", preserveNullAndEmptyArrays: true } },

      // Lookup specialties data
      {
        $lookup: {
          from: "asset_specialty_mappings",
          localField: "AssetId",
          foreignField: "AssetId",
          as: "SpecialtyData",
        },
      },
      { $unwind: { path: "$SpecialtyData", preserveNullAndEmptyArrays: true } },

      // Lookup specialties, subspecialties, and super specializations
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SpecialtyData.SpecialtyId",
          foreignField: "_id",
          as: "SpecialtyDetails",
        },
      },
      {
        $unwind: {
          path: "$SpecialtyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SpecialtyData.SubSpeciality",
          foreignField: "_id",
          as: "SubSpecialityDetails",
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "SpecialtyData.SuperSpecialization",
          foreignField: "_id",
          as: "SuperSpecializationDetails",
        },
      },

      // Sort by creation date
      { $sort: { createdAt: -1 } },

      // Pagination
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },

      // Project the necessary fields
      {
        $project: {
          _id: 1,
          Title: 1,
          YouTubeLink: 1,
          YouTubeThumbnail: 1,
          Content: 1,
          Tags: 1,
          LikeCount: 1,
          CommentCount: 1,
          ViewsCount: 1,
          // AssetData: 1,
          "AssetData.AssetName": 1,
          "SpecialtyDetails.lookup_value": 1,
          "SubSpecialityDetails.lookup_value": 1,
          "SuperSpecializationDetails.lookup_value": 1,
        },
      },
    ];

    // Run the aggregation pipeline
    const posts = await PatientEducation.aggregate(pipeline);

    // // Get total count for pagination metadata
    // const totalCount = await PatientEducation.countDocuments({
    //   isActive: true,
    // });
    // Get the total count for filtered records
    const totalCount = await PatientEducation.countDocuments(matchStage);

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
    console.error("Error in PatientEducationList API:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// used in admin
// data by asset_id without Aggregation for admin panel
router.get("/PatientEducationListByAsset", async (req, res) => {
  try {
    // Extract AssetId, page, and limit from query parameters with defaults
    const { AssetId, page = 1, limit = 20 } = req.query;

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Validate AssetId if provided
    if (AssetId && !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.json(__requestResponse("400", "Invalid AssetId."));
    }

    // Build the query filter
    const filter = {};
    if (AssetId) {
      filter.AssetId = AssetId;
    }

    // Fetch the records with pagination and sorting
    const posts = await PatientEducation.find(filter)
      .populate("AssetId", "AssetName") // Populate AssetName from asset_masters
      .populate({
        path: "LookupType",
        model: "admin_lookups", // Reference to the admin_lookups collection
        select: "lookup_value", // Select only lookup_value
      })
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Category SubCategory LikeCount CommentCount ViewsCount IsActive"
      )
      // .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip((pageNumber - 1) * pageSize) // Skip records for previous pages
      .limit(pageSize); // Limit results to the page size

    // Count total records for pagination metadata
    const totalCount = await PatientEducation.countDocuments(filter);

    // Prepare the response
    const response = {
      totalRecords: totalCount, // Total filtered records
      currentPage: pageNumber, // Current page
      totalPages: Math.ceil(totalCount / pageSize), // Total pages
      records: posts, // Filtered blog posts
    };

    return res.json(
      __requestResponse("200", "Data fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error in /PatientEducationListByAsset:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// data by asset_id with Aggregation   admin panel
router.get("/PatientEducationListByAsset2", async (req, res) => {
  try {
    // Extract AssetId, page, and limit from query parameters with defaults
    const { AssetId, page = 1, limit = 20 } = req.query;

    // Parse page and limit to integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Validate AssetId
    if (AssetId && !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.json(__requestResponse("400", "Invalid AssetId."));
    }

    // Build the match stage based on AssetId
    const matchStage = AssetId
      ? { AssetId: mongoose.Types.ObjectId(AssetId) }
      : {};

    // Use aggregation to fetch and filter blogs
    const pipeline = [
      { $match: { ...matchStage, isActive: true } }, // Filter by AssetId and active blogs
      {
        $lookup: {
          from: "asset_masters", // Lookup from asset_masters collection
          localField: "AssetId",
          foreignField: "_id",
          as: "AssetDetails",
        },
      },
      { $unwind: { path: "$AssetDetails", preserveNullAndEmptyArrays: true } }, // Unwind AssetDetails
      {
        $project: {
          Title: 1,
          YouTubeLink: 1,
          YouTubeThumbnail: 1,
          Content: 1,
          Tags: 1,
          Category: 1,
          SubCategory: 1,
          LikeCount: 1,
          CommentCount: 1,
          ViewsCount: 1,
          IsActive: 1,
          "AssetDetails.AssetName": 1, // Include AssetName from AssetDetails
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by creation date
      { $skip: (pageNumber - 1) * pageSize }, // Pagination: skip records for previous pages
      { $limit: pageSize }, // Pagination: limit results to the page size
    ];

    // Execute the aggregation pipeline
    const posts = await PatientEducation.aggregate(pipeline);

    // Get total count for pagination metadata
    const totalCount = await PatientEducation.countDocuments(matchStage);

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
    console.error("Error in /PatientEducationListByAsset:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});


router.post("/like", async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const post = await PatientEducation.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.Likes.find(
      (like) => like.UserID.toString() === userId
    );
    if (alreadyLiked) {
      // Unlike the post
      post.Likes = post.Likes.filter(
        (like) => like.UserID.toString() !== userId
      );
      post.LikeCount = post.Likes.length;
    } else {
      // Like the post
      post.Likes.push({ UserID: userId });
      post.LikeCount = post.Likes.length;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/comment", async (req, res) => {
  const { postId, userId, commentId, comment } = req.body;

  try {
    const post = await PatientEducation.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (commentId) {
      // Edit Comment
      const existingComment = post.Comments.id(commentId);
      if (!existingComment)
        return res.status(404).json({ message: "Comment not found" });

      existingComment.Comment = comment;
      existingComment.PostedAt = Date.now();
    } else {
      // Add New Comment
      post.Comments.push({ UserID: userId, Comment: comment });
      post.CommentCount = post.Comments.length;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/comment", async (req, res) => {
  const { postId, commentId } = req.body;

  try {
    const post = await PatientEducation.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.Comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.remove();
    post.CommentCount = post.Comments.length;

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// not in use
router.get("/PatientEducation/:id____", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Need to pass middle ware to get user id other wise pass id from req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json(__requestResponse("400", "Invalid PatientEducation ID."));
    }

    const post = await PatientEducation.findById(id)
      .populate("AssetId", "AssetName")
      .select(
        "Title YouTubeLink YouTubeThumbnail Content Tags Likes Comments LikeCount CommentCount ViewsCount Views createdAt updatedAt"
      );

    if (!post) {
      return res.json(__requestResponse("404", "PatientEducation not found."));
    }

    // Check if the user has already viewed the post
    const hasViewed = post.Views.some(
      (view) => view.UserID?.toString() === userId
    );

    if (!hasViewed) {
      // Increment views count and add user to Views array
      post.ViewsCount += 1;
      post.Views.push({ UserID: userId });
      await post.save();
    }

    return res.json(
      __requestResponse("200", "Data fetched successfully.", post)
    );
  } catch (error) {
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

// not in use
router.post("/IncrementViews", async (req, res) => {
  const APIEndPointNo = "#PE0002";

  try {
    const { patientEducation_id } = req.body;

    if (!patientEducation_id) {
      return res.json(
        __requestResponse(
          "400",
          __VALIDATION_ERROR,
          "PatientEducation ID is required"
        )
      );
    }

    const updatedRecord = await PatientEducation.findByIdAndUpdate(
      patientEducation_id,
      { $inc: { ViewsCount: 1 } },
      { new: true }
    );

    if (!updatedRecord) {
      return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
    }

    return res.json(__requestResponse("200", __SUCCESS, updatedRecord));
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
      )
    );
  }
});

module.exports = router;

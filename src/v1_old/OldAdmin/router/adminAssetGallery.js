const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");
const { checkAssetGallery } = require("../Middleware/middleAssetGallery");

const tlbAssetGallery = require("../../../models/AssetGallery");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Save or Update Asset Gallery
// router.post("/SaveAssetGalleryx", checkAssetGallery, async (req, res) => {
//   const APIEndPointNo = "#KCC0010";
//   try {
//     const { AssetId, GalleryName, Data, assetGallery_id } = req.body;

//     if (!assetGallery_id) {
//       // Add a new Asset Gallery
//       const newAssetGallery = {
//         AssetId: mongoose.Types.ObjectId(AssetId),
//         GalleryName,
//         Data: Data || [],
//       };

//       const createdGallery = await tlbAssetGallery.create(newAssetGallery);
//       __CreateAuditLog(
//         "asset_repositories",
//         "AssetGallery.Add",
//         null,
//         null,
//         newAssetGallery,
//         createdGallery._id,
//         AssetId,
//         null
//       );

//       return res
//         .json(__requestResponse("200", __SUCCESS, createdGallery))
//         .status(200);
//     } else {
//       // Update an existing Asset Gallery
//       const existingRecord = await tlbAssetGallery.findOne({
//         _id: assetGallery_id,
//       });
//       if (!existingRecord) {
//         return res
//           .json(__requestResponse("400", "Asset gallery not found"))
//           .status(400);
//       }

//       const updatedAssetGallery = {
//         GalleryName,
//         Data,
//       };

//       await tlbAssetGallery.updateOne(
//         { _id: assetGallery_id },
//         { $set: updatedAssetGallery }
//       );
//       __CreateAuditLog(
//         "asset_repositories",
//         "AssetGallery.Edit",
//         null,
//         existingRecord,
//         updatedAssetGallery,
//         assetGallery_id,
//         AssetId,
//         null
//       );

//       return res
//         .json(
//           __requestResponse("200", __SUCCESS, "Gallery updated successfully")
//         )
//         .status(200);
//     }
//   } catch (error) {
//     return res
//       .json(
//         __requestResponse(
//           "400",
//           __SOME_ERROR,
//           //   `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
//           "Error Code: " + APIEndPointNo + "_0.1:" + error
//         )
//       )
//       .status(400);
//   }
// });

// Save or Update Asset Gallery
router.post("/SaveAssetGallery", checkAssetGallery, async (req, res) => {
  const APIEndPointNo = "#KCC0010";
  try {
    const { AssetId, GalleryName, Data, assetGallery_id } = req.body;

    // Validate AssetId
    if (!AssetId || !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.json(__requestResponse("400", "Invalid AssetId")).status(400);
    }

    // Prepare Data array with validation for PosterImage
    const formattedData = Data.map((item) => ({
      Content: item.Content,
      MIMEType: item.MIMEType,
      SortOrder: item.SortOrder || 0,
      ContentType: item.ContentType,
      ContentDesc: item.ContentDesc,
      PosterImage:
        item.ContentType === "Video" ? item.PosterImage || null : null,
    }));

    // If assetGallery_id is not provided, create a new Asset Gallery
    if (!assetGallery_id) {
      const newAssetGallery = {
        AssetId: mongoose.Types.ObjectId(AssetId),
        GalleryName,
        Data: formattedData,
      };

      const createdGallery = await tlbAssetGallery.create(newAssetGallery);

      // Audit log for creating a new asset gallery
      __CreateAuditLog(
        "asset_repositories",
        "AssetGallery.Add",
        null,
        null,
        newAssetGallery,
        createdGallery._id,
        AssetId,
        null
      );

      return res
        .json(__requestResponse("200", __SUCCESS, createdGallery))
        .status(200);
    } else {
      // Update an existing Asset Gallery
      const existingRecord = await tlbAssetGallery.findOne({
        _id: assetGallery_id,
      });

      if (!existingRecord) {
        return res
          .json(__requestResponse("400", "Asset gallery not found"))
          .status(400);
      }

      const updatedAssetGallery = {
        GalleryName,
        Data: formattedData,
      };

      await tlbAssetGallery.updateOne(
        { _id: assetGallery_id },
        { $set: updatedAssetGallery }
      );

      // Audit log for updating an existing asset gallery
      __CreateAuditLog(
        "asset_repositories",
        "AssetGallery.Edit",
        null,
        existingRecord,
        updatedAssetGallery,
        assetGallery_id,
        AssetId,
        null
      );

      return res
        .json(
          __requestResponse("200", __SUCCESS, "Gallery updated successfully")
        )
        .status(200);
    }
  } catch (error) {
    return res
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          //   `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
          "Error Code: " + APIEndPointNo + "_0.1:" + error
        )
      )
      .status(400);
  }
});

// Fetch Asset Gallery List
router.post("/GetAssetGalleryList", async (req, res) => {
  const APIEndPointNo = "#KCC0011";
  try {
    const { AssetId } = req.body;
    const filter = {};

    // Validate the presence of AssetId in the request body
    if (AssetId) {
      if (!mongoose.Types.ObjectId.isValid(AssetId)) {
        return res
          .json(__requestResponse("400", "Invalid AssetId"))
          .status(400);
      }
      filter.AssetId = mongoose.Types.ObjectId(AssetId);
    }

    // Fetch galleries with the specified filter
    const galleries = await tlbAssetGallery
      .find(filter)
      .select("-__v -createdAt -updatedAt");

    // Format the response to include gallery name, images, and videos
    const formattedGalleries = galleries.map((gallery) => ({
      assetGallery_id: gallery._id,
      AssetId: gallery.AssetId,
      GalleryName: gallery.GalleryName,
      Media: gallery.Data.map((item) => ({
        Content: item.Content,
        MIMEType: item.MIMEType,
        SortOrder: item.SortOrder,
        ContentType: item.ContentType,
        ContentDesc: item.ContentDesc,
        PosterImage: item.ContentType === "Video" ? item.PosterImage : null,
      })),
    }));

    return res
      .json(__requestResponse("200", __SUCCESS, formattedGalleries))
      .status(200);
  } catch (error) {
    return res
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          //   `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
          "Error Code: " + APIEndPointNo + "_0.1:" + error
        )
      )
      .status(400);
  }
});

module.exports = router;

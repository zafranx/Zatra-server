// Ancillary Services Master fields Ancillary Service Type (drop down values Transport, Priest, Tour Guide), Ancillary Service Provider,
//  Phone Number, ID Number, ID Card Picture, Picture Gallery,
//  Video Gallery, Is Verified (Yes/No), Verification Report (upload)
const mongoose = require("mongoose");

const _SchemaDesign = new mongoose.Schema(
  {
    ServiceType: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ServiceProvider: {
      type: String,
      required: true,
    },
    PhoneNumber: {
      type: String,
      required: true,
    },
    IdNumber: {
      type: String,
      required: true,
    },
    IdCardPicture: {
      type: String, // URL/path to the uploaded ID card image
    },
    PictureGallery: [
      {
        type: String, // Array of image URLs/paths
      },
    ],
    VideoGallery: [
      {
        type: String, // Array of video URLs/paths
      },
    ],
    IsVerified: {
      type: Boolean,
      default: false,
    },
    VerificationReport: {
      type: String, // URL/path to the verification report document
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ancillary_services_master", _SchemaDesign);

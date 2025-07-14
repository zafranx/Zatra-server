// Legal Entity (Legal Entity Type, Name, Registration Number, GST Number, PAN Number,
//  Registration Address, Authorised Representative, Phone Number,
//  Email Address, Website, LinkedIn, Instagram Page, Facebook Page, Industry/ Sector, Sub Sector)

const mongoose = require("mongoose");
// Legal Entity -Asset Master
const _SchemaDesign = new mongoose.Schema(
  {
    CityId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    DestinationId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    AssetType: String,
    LegalEntityTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Name: String,
    Registration_Number: { type: String, unique: true, sparse: true },
    GST: { type: String, unique: true, sparse: true },
    PAN: { type: String, unique: true, sparse: true },
    Registration_Address: String,
    Authorised_Representative: String,
    Phone: Number,
    EmailAddress: String,
    Website: String,
    LinkedIn: String,
    Instagram: String,
    Facebook: String,
    Industry_Sector: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Industry_Sub_Sector: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Logo: String,
    IsVerified: { type: Boolean, default: false },
    VerifiedBy: { type: String, default: "" },
    VerificationDate: { type: Date },
    VerificationReport: { type: String },
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("asset_master", _SchemaDesign);
// module.exports = mongoose.model("legal_entity", _SchemaDesign);

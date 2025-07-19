// Investment Opportunities fields (City ID, Project Type Drop Down, Project Name,
//  Project Location, Picture Gallery, Video Gallery, Minimum Investment in INR, Assured ROI (%),
//  Lock in Period (years), Project Start Date, Completion Deadline, Available Sizes (multiple - Unit, Size), Approval Status (Multiple), Contact Name, 
// Phone Number, Email Address, Project Developer (s), Banking Partner (s),
//  Distance from City, Distance from Airport, Distance from Railway Station, Amenities (multiple), Comments
const mongoose = require("mongoose");
// Project Master or  Investment Opportunties
const _SchemaDesign = new mongoose.Schema(
  {
    CityId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ProjectType: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ProjectName: String,
    ProjectLocation: String,
    PictureGallery: [String],
    VideoGallery: [String],
    MinimumInvestment: String,
    AssuredROI: String,
    LockinPeriod: String,
    ProjectStartDate: Date,
    CompletionDeadline: Date,
    AvailableSizes: [
      {
        Unit: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "admin_lookups",
        },
        Size: String,
      },
    ],
    ApprovalStatus: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
      },
    ],
    ContactName: String,
    PhoneNumber: String,
    EmailAddress: String,
    ProjectDeveloper: [String],
    BankingPartner: [String],
    DistancefromCity: String,
    DistancefromAirport: String,
    DistancefromRailwayStation: String,
    Amenities: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
      },
    ],
    Comments: String,
    Geolocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("project_master", _SchemaDesign);

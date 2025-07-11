const mongoose = require("mongoose");
// Venue Master
const _SchemaDesign = new mongoose.Schema(
  {
    VenueTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
      // Event Type Values - City, Exhibition Centre
    },
    City_Exhibition_Centre_Name: String,
    Layout_Doc: String,
    Address_line1: String,
    Address_line2: String,
    PostalCode: Number,
    StateId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
    CityId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
    Geolocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("venue_master", _SchemaDesign);


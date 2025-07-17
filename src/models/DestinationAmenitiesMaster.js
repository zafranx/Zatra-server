// Destination Amenities Master (City ID, Destination ID, Amenity ID, Geolocation)
// Destination Amenities Master
const mongoose = require("mongoose");
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
    AmenityTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Geolocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("destination_amenities_master", _SchemaDesign);

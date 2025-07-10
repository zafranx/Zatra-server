const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_masters",
    },
    BannerImg: String,
    EventName: {
      type: String,
    },
    EventTypeID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    TripCategoryID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    // Address: {
    //     type: String,
    // },
    // GeoAddress: {
    //     type: { type: String, enum: ["Point"], default: "Point" },
    //     coordinates: {
    //         type: [Number],
    //         default: [0, 0],
    //         // required: true
    //     }, // [longitude, latitude]
    // },
    AddressID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "address_master",
    },
    CityID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Organizers: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "organizer",
      },
    ],
    EventFromDate: {
      type: Date,
    },
    EventToDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
SchemaDesign.index({ GeoAddress: "2dsphere" });

module.exports = mongoose.model("event_masters", SchemaDesign);

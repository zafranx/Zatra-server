// create table Destination Master fields
//  (City ID, Destination ID, Destination Type ID, Destination, Short Description, Wiki Page Link) ,Geolocation
const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema({
  CityId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  PanchtatvaCategoryId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  PanchtatvaSubcategoryId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  // DestinationTypeId: {
  //   type: mongoose.SchemaTypes.ObjectId,
  //   ref: "admin_lookups",
  // }, // removed by gourav sir
  // DestinationSubTypeId: {
  //   type: mongoose.SchemaTypes.ObjectId,
  //   ref: "admin_lookups",
  // },// removed by gourav sir
  Destination: String,
  Lane: [
    {
      LaneNumber: String,
      LaneName: String,
    },
  ],
  Hall: [
    {
      HallNumber: String,
      HallName: String,
    },
  ],
  Floor: [
    {
      FloorNumber: String,
      FloorName: String,
    },
  ],
  EntryFee: [
    {
      FeeCategory: String,
      FeeAmount: String,
    },
  ],
  WorkingDays: [
    {
      type: String,
    },
  ],
  // WorkingDays: [
  //   {
  //     Day: {
  //       type: String,
  //       enum: [
  //         "Sunday",
  //         "Monday",
  //         "Tuesday",
  //         "Wednesday",
  //         "Thursday",
  //         "Friday",
  //         "Saturday",
  //       ],
  //     },
  //     IsOpen: {
  //       type: Boolean,
  //       default: true,
  //     },
  //   },
  // ],
  OpeningHours: {
    OpeningTime: Date,
    ClosingTime: Date,
    LunchHours: String,
  },
  TicketInventoryPerDay: String,
  InstructionsForVisitors: String,
  ShortDescription: String,
  LongDescription: String,
  WikiPageLink: String,
  Geolocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  PictureGallery: [String],
  VideoGallery: [String],
});

module.exports = mongoose.model("destination_master", _SchemaDesign);

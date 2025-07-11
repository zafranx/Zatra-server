const mongoose = require("mongoose");

const _SchemaDesign = new mongoose.Schema(
  {
    Event_Id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "event_master",
      required: true,
    },
    Venue_Id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "venue_master",
      required: true,
    },
    SubVenueTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
      required: true,
    },
    SubVenueNo: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sub_venue_master", _SchemaDesign);

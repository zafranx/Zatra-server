const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema({
  CityId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  ProductName: String,
  PictureGallery: [String],
  VideoGallery: [String],
  ShortDescription: String,
  LongDescription: String,
});

module.exports = mongoose.model("ODOP_master", _SchemaDesign);

// Note:
// Create Table City Indicator (City Indicator ID, City Indicator Name, City Indicator Value Unit,
//  City Indicator Value) ,City Indicator Image ,CityId

const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema({
  CityStationId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },

  // CityIndicatorName: String,
  // CityIndicatorValueUnit: String,
  // CityIndicatorValue: String,
  // CityIndicatorImage: String,
  // Destination: String,

  PanchtatvaCategory_Level1_Id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  PanchtatvaCategory_Level2_Id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  PanchtatvaCategory_Level3_Id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  Name: String,
  ShortDescription: String,
  LongDescription: String,
  PictureGallery: [String],
  VideoGallery: [String],

  // WikiPageLink: String,
});

module.exports = mongoose.model("city_indicator", _SchemaDesign);

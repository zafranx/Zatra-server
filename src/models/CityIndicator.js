// Note:
// Create Table City Indicator (City Indicator ID, City Indicator Name, City Indicator Value Unit,
//  City Indicator Value) ,City Indicator Image ,CityId

const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema({
  CityId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "admin_lookups",
  },
  CityIndicatorName: String,
  CityIndicatorValueUnit: String,
  CityIndicatorValue: String,
  CityIndicatorImage: String,
  Destination: String,
  ShortDescription: String,
  WikiPageLink: String,
});

module.exports = mongoose.model("city_indicator", _SchemaDesign);

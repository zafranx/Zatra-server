// Table City Contact Master fields (Contact Type String, Contact Name,
//  Designation, Photo, Phone Number, Email Address, Website) CityId a,addressline1 , addressline2, Postalcode
const mongoose = require("mongoose");
// City Contact master
const _SchemaDesign = new mongoose.Schema(
  {
    CityId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ContactTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ContactName: String,
    Designation: String,
    Image: String,
    Phone: Number,
    Email: String,
    Website: String,
    AddressLine1: String,
    AddressLine2: String,
    PostalCode:String
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("city_contact_master", _SchemaDesign);

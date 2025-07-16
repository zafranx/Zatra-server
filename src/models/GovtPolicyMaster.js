// Government Policy Master (City ID, Policy ID, Policy Title, Short Description,
//  Long Description, Eligibility, Government Authority,  Uploaded Policy Document)
const mongoose = require("mongoose");
// Government Policy Master
const _SchemaDesign = new mongoose.Schema(
  {
    CityId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    PolicyId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    PolicyTitle: String,
    ShortDesc: String,
    LongDesc: String,
    Eligibility: String,
    GovernmentAuthority: String,
    PolicyDocument: String, //document
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("govt_policy_master", _SchemaDesign);

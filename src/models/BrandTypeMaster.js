// Brand Type Master (ID, Brand Type) values Product Brand, Service Brand, Logo, Trademark, GI Brand)
const mongoose = require("mongoose");
// Brand type master
const _SchemaDesign = new mongoose.Schema(
  {
    LegalEntityTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Name: String,
    Registration_Number: String,
    GST: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("brand_type_master", _SchemaDesign);

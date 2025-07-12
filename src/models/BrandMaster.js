// Brand Master (Brand Type ID, Brand ID, Brand Name, Description,
//  Upload Brand Images, Brand Broucher (PDF), Legal Entity ID)
const mongoose = require("mongoose");
// Brand master
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
module.exports = mongoose.model("brand_master", _SchemaDesign);

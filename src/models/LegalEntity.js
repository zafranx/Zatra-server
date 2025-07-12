// Legal Entity (Legal Entity Type, Name, Registration Number, GST Number, PAN Number,
//  Registration Address, Authorised Representative, Phone Number,
//  Email Address, Website, LinkedIn, Instagram Page, Facebook Page, Industry/ Sector, Sub Sector)

const mongoose = require("mongoose");
// Legal Entity
const _SchemaDesign = new mongoose.Schema(
  {
    LegalEntityTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Name: String,
    Registration_Number: { type: String, unique: true, sparse: true },
    GST: { type: String, unique: true, sparse: true },
    PAN: { type: String, unique: true, sparse: true },
    Registration_Address: String,
    Authorised_Representative: String,
    Phone: Number,
    EmailAddress: String,
    Website: String,
    LinkedIn: String,
    Instagram: String,
    Facebook: String,
    Industry_Sector: String,
    SubSector: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("legal_entity", _SchemaDesign);

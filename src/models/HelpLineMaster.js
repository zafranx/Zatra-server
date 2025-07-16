// Help Line Master (City ID, Helpline Number, Email Address, Contact Person Name, Address)

const mongoose = require("mongoose");
// Help Line master
const _SchemaDesign = new mongoose.Schema(
  {
    CityId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ContactPersonName: String,
    HelplineNumber: Number,
    Email: String,
    AddressLine1: String,
    AddressLine2: String,
    PostalCode: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("helpline_master", _SchemaDesign);

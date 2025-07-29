// Table ORGANIZER_SPONSOR_MASTER

// 1.	ZATRA_ID
// 2.	Organizer_Type_ID
// 3.	Organizer_ID
// 4.	Organizer_Name
// 5.	Website
// 6.	Contact Name
// 7.	Contact Number
// 8.	Email Address
// 9.	IsSponsor (Boolean Yes/No)

const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
  {
    ZatraId: { type: mongoose.SchemaTypes.ObjectId, ref: "zatra_master" },
    OrganizerTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    // OrganizerId: { type: mongoose.SchemaTypes.ObjectId, ref: "user_master" },
    OrganizerName: String,
    Website: String,
    ContactName: String,
    ContactNumber: String,
    EmailAddress: String,
    IsSponsor: Boolean,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("organizer_sponser_master", _SchemaDesign);
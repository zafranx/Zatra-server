const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
  {
    FirstName: String,
    LastName: String,
    DOB:  Date ,
    Gender: String,
    PhoneNumber: Number,
    EmailAddress: String,
    KYC_Id: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
    KYC_Number: String,
    KYC_Upload: String,
    Profile_Pic: String,
    User_Bio: String,
    Blood_Group: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
    Pre_Existing_Diseases: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    Pregnancy: Boolean,
    Present_Disability: Boolean,
    Infectious_Diseases: Boolean,
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("user_master", _SchemaDesign);
// Fields given by Gourav sir
// Table USER_MASTER
// 1.	USER_ID
// 2.	First Name
// 3.	Last Name
// 4.	DOB
// 5.	Gender
// 6.	Phone Number
// 7.	Email Address
// 8.	KYC_ID (drop down reference USER_KYC_MASTER)
// 9.	KYC_NUMBER (alphanumeric value)
// 10.	KYC_Upload (Picture)
// 11.	Profile_PIC
// 12.	User_Bio
// 13.	Blood_Group (drop down from BLOOD_GROUP_MASTER)
// 14.	Pre_Existing_Diseases (drop down multiple selection, DISEASE_MASTER)
// 15.	Pregnancy (Boolean Yes/No)
// 16.	Present_Disability (Boolean Yes/No)
// 17.	Infectious_Diseases (Boolean Yes/No)

const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
  {
    UserId: { type: mongoose.SchemaTypes.ObjectId, ref: "user_master" },
    Verification_ChecklistId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    // VerifierId: { type: mongoose.SchemaTypes.ObjectId, ref: "verifier_master" },// Ask how it manage
    VerifierId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" }, // managed by drop down admin_lookups

    VerifierName: String,
    Verification_Status: String, //(Drop Down – Verification Successful, Verification Failed, Pending, Verification Denied)
    // Verification_Status: {
    //   type: String,
    //   enum: [
    //     "Verification Successful",
    //     "Verification Failed",
    //     "Pending",
    //     "Verification Denied",
    //   ],
    //   required: true,
    // },
    Verification_Date: {
      type: Date,
      default: Date.now,
    },
    Verification_Report: String,
    Comments: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("user_verification", _SchemaDesign);

// Table USER_VERIFICATION

// 1.	VERIFICATION_TRANSACTION_ID
// 2.	USER_ID
// 3.	VERIFICATION_CHECKLIST_ID
// 4.	VERIFIER_ID
// 5.	VERIFICATION_STATUS (Drop Down – Verification Successful, Verification Failed, Pending, Verification Denied)
// 6.	VERIFICATION_DATE
// 7.	VERIFICATION_REPORT
// 8.	COMMENTS

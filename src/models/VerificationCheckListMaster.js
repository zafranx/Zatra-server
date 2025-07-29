/*
 * @notes {*} this table is now managed by admin_lookups
 */

// const mongoose = require("mongoose");
// const _SchemaDesign = new mongoose.Schema(
//   {
//     Verification_ChecklistId: {
//       type: mongoose.SchemaTypes.ObjectId,
//       ref: "admin_lookups",
//     },
//     // Verification_Checklist: String,
//     VerifierId: { type: mongoose.SchemaTypes.ObjectId, ref: "verifier_master" },
//     VerifierName: String,
//   },
//   {
//     timestamps: true,
//   }
// );
// module.exports = mongoose.model("verification_checklist_master", _SchemaDesign);

// Table VERIFICATION_CHECKLIST_MASTER

// 1.	VERIFICATION_CHECKLIST_ID
// 2.	VERIFICATION_CHECKLIST (Values – eKYC Check, Criminal Record Check, Business Establishment Check, CIBIL Check, Financial Stability Check, Business Integrity Check)
// Table VERIFIER_MASTER

// 1.	Verifier_ID
// 2.	Verifier_Name

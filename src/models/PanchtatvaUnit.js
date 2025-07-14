// Create another table Panchatatva Unit as per below structure -
// 1. Panchtatva Category ID
// 2. ⁠Panchatatva Sub Category ID
// 3. ⁠Panchatatva Unit ID
// 4. ⁠Panchtatva Unit
const mongoose = require("mongoose");
// Panchtatva Unit
const _SchemaDesign = new mongoose.Schema(
  {
    PanchtatvaCategoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    PanchatatvaSubCategoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    PanchatatvaUnit: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("panchtatva_unit", _SchemaDesign);

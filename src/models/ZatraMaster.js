// Create table ZATRA Master

// 1. ZATRA ID
// 2. ⁠ZATRA Name
// 3. ⁠ZATRA Type (Scheduled/ Ongoing)
// 4. ⁠Start Date
// 5. ⁠End Date
// 6. ⁠ZATRA Organiser
// 7. ⁠Enroute Cities (array)

const mongoose = require("mongoose");
// ZatraMaster
const _SchemaDesign = new mongoose.Schema(
  {
    // ZatraTypeId: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "admin_lookups",
    // },
    ZatraType: String,
    ZatraName: String,
    StartDate: Date,
    EndDate: Date,
    Logo: String,
    Website: String,
    ZatraOrganisers: String,
    // ⁠Enroute Cities (array)
    CityId: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("zatra_master", _SchemaDesign);

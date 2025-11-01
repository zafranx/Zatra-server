const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        ProductSupplierMappingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        AvailableStock: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("n_inverntory_master", _SchemaDesign);

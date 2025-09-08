const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema({
    StationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
    },
    IndicatorType: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
    },
    UnitValue: String,
    Value: String,
});

module.exports = mongoose.model("city_indicator", _SchemaDesign);

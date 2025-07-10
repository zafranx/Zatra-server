const mongoose = require("mongoose");

const _lookupschema = new mongoose.Schema(
    {
        client_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true,
        },
        lookup_type: {
            type: String,
        },
        lookup_value: {
            type: String,
        },
        icon: {
            type: String,
        },
        parent_lookup_type: {
            type: String,
        },
        parent_lookup_id: {
            type: mongoose.SchemaTypes.ObjectId,
        },
        sort_order: {
            type: Number,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        managed_by_ui: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("admin_lookups", _lookupschema);

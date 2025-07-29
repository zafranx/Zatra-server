const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema(
  {
    AssetId: { type: mongoose.SchemaTypes.ObjectId, ref: "asset_master" },
    ZatraId: { type: mongoose.SchemaTypes.ObjectId, ref: "zatra_master" },
    UserId: { type: mongoose.SchemaTypes.ObjectId, ref: "user_master" },
    ReportingUserId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user_master",
    },
    RoleId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
    UserAuthorityLevel: String,
    StationId: { type: mongoose.SchemaTypes.ObjectId, ref: "station_master" },
    DestinationId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "destination_master",
    },
    ServiceId: { type: mongoose.SchemaTypes.ObjectId, ref: "service_master" },
    Password: String,
    ValidFrom: Date,
    ValidUpto: Date,
    Blocked: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ODOP_master", _SchemaDesign);
// Table ZATRA_LOGIN

// 1.	ZATRA_ID
// 2.	USER_ID
// 3.	REPORTING_USER_ID
// 4.	ROLE_ID
// 5.	USER_AUTHORITY_LEVEL (drop down – ZATRA, City, Destination, Asset, Service)
// 6.	STATION_ID
// 7.	DESTINANTION_ID
// 8.	ASSET_ID
// 9.	SERVICE_ID
// 10.	PASSWORD
// 11.	VALID_FROM (Datetime)
// 12.	VALID_UPTO (Datetime)
// 13.	Blocked (boolean Yes/No)

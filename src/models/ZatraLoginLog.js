const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema(
  {
    UserId: { type: mongoose.SchemaTypes.ObjectId, ref: "user_master" },
    LoginDatetime: Date,
    LogoutDatetime: Date,
    ForcedLogout: Boolean,
    Geolocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    Duration: Number, //(Logout_DATETIME- Login_DATETIME)
    SuspiciousActivity: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("login_log", _SchemaDesign);
// Table ZATRA_LOGIN_LOG

// 1.	USER_ID
// 2.	Login_DATETIME
// 3.	Logout_DATETIME
// 4.	Forced_Logout (Boolean Yes/No)
// 5.	Geolocation
// 6.	Duration (Logout_DATETIME- Login_DATETIME)
// 7.	SUSPICIOUS_ACTIVITY (boolean Yes/No)

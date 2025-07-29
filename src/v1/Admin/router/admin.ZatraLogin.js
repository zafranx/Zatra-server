const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const ZatraLogin = require("../../../models/ZatraLogin");
const LoginLog = require("../../../models/ZatraLoginLog");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Add / Edit Zatra Login
router.post("/SaveZatraLogin", async (req, res) => {
  try {
    const {
      _id,
      AssetId,
      ZatraId,
      UserId,
      ReportingUserId,
      RoleId,
      UserAuthorityLevel,
      StationId,
      DestinationId,
      ServiceId,
      Password,
      ValidFrom,
      ValidUpto,
      Blocked,
    } = req.body;

    let saveData = {
      AssetId,
      ZatraId,
      UserId,
      ReportingUserId,
      RoleId,
      UserAuthorityLevel,
      StationId,
      DestinationId,
      ServiceId,
      ValidFrom,
      ValidUpto,
      Blocked,
    };

    // Hash password if provided
    if (Password) {
      const salt = await bcrypt.genSalt(10);
      saveData.Password = await bcrypt.hash(Password, salt);
    }

    if (!_id) {
      // Create new login
      const newRec = await ZatraLogin.create(saveData);

      await __CreateAuditLog(
        "zatra_login_master",
        "ZatraLogin.Add",
        null,
        null,
        newRec,
        newRec._id,
        newRec.UserId,
        null
      );

      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      // Update existing login
      const oldRec = await ZatraLogin.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND, {}));

      await ZatraLogin.updateOne({ _id }, { $set: saveData });
      const updated = await ZatraLogin.findById(_id);

      await __CreateAuditLog(
        "zatra_login_master",
        "ZatraLogin.Edit",
        null,
        oldRec,
        updated,
        _id,
        updated.UserId,
        null
      );

      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error("❌ SaveZatraLogin Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// 🔑 Login API
router.post("/ZatraLogin", async (req, res) => {
  try {
    const { UserId, Password, Geolocation } = req.body;

    const user = await ZatraLogin.findOne({ UserId });
    if (!user) return res.json(__requestResponse("404", "User not found"));

    const isMatch = await bcrypt.compare(Password, user.Password || "");
    if (!isMatch)
      return res.json(__requestResponse("401", "Invalid credentials"));

    // Create Login Log
    const loginLog = await LoginLog.create({
      UserId,
      LoginDatetime: new Date(),
      Geolocation,
      ForcedLogout: false,
      SuspiciousActivity: false,
    });

    return res.json(
      __requestResponse("200", "Login successful", {
        user: __deepClone(user),
        loginLogId: loginLog._id,
      })
    );
  } catch (error) {
    console.error("❌ ZatraLogin Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// 🚪 Logout API
router.post("/ZatraLogout", async (req, res) => {
  try {
    const { loginLogId } = req.body;

    const log = await LoginLog.findById(loginLogId);
    if (!log)
      return res.json(__requestResponse("404", "Login log not found", {}));

    log.LogoutDatetime = new Date();
    log.Duration = (log.LogoutDatetime - log.LoginDatetime) / 1000; // seconds
    await log.save();

    return res.json(__requestResponse("200", "Logout successful", log));
  } catch (error) {
    console.error("❌ ZatraLogout Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;

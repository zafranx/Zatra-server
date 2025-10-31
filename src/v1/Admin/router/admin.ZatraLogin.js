const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const ZatraLogin = require("../../../models/ZatraLogin");
const LoginLog = require("../../../models/ZatraLoginLog");
const {
    __requestResponse,
    __deepClone,
    __generateAuthToken,
} = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const ZatraLoginMaster = require("../../../models/ZatraLoginMaster");
const LookupModel = require("../../../models/lookupmodel");
const AssetMaster2 = require("../../../models/AssetMaster2");

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
                return res.json(
                    __requestResponse("404", __RECORD_NOT_FOUND, {})
                );

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
            return res.json(
                __requestResponse("404", "Login log not found", {})
            );

        log.LogoutDatetime = new Date();
        log.Duration = (log.LogoutDatetime - log.LoginDatetime) / 1000; // seconds
        await log.save();

        return res.json(__requestResponse("200", "Logout successful", log));
    } catch (error) {
        console.error("❌ ZatraLogout Error:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/SaveNewZatraLogin", async (req, res) => {
    try {
        const {
            _id,
            LoginAssetType,
            LoginAssetId,
            LoginAssetRef,
            Name,
            Email,
            Address,
            PhoneNumber,
            Password,
        } = req.body;

        let saveData = {
            LoginAssetType,
            LoginAssetId,
            LoginAssetRef,
            Name,
            Email,
            Address,
            PhoneNumber,
            Password,
        };

        // Hash password if provided
        if (Password) {
            const salt = await bcrypt.genSalt(10);
            saveData.Password = await bcrypt.hash(Password, salt);
        }

        if (!_id) {
            // Create new login
            const newRec = await ZatraLoginMaster.create(saveData);

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
            const oldRec = await ZatraLoginMaster.findById(_id);
            if (!oldRec)
                return res.json(
                    __requestResponse("404", __RECORD_NOT_FOUND, {})
                );

            await ZatraLoginMaster.updateOne({ _id }, { $set: saveData });
            const updated = await ZatraLoginMaster.findById(_id);

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
router.post("/ZatraLoginList", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            LoginAssetType,
            LoginAssetId,
        } = req.body;

        const filter = {};
        if (search) {
            filter.Name = { $regex: search, $options: "i" };
        }
        if (LoginAssetType) filter.LoginAssetType = LoginAssetType;
        if (LoginAssetId) filter.LoginAssetId = LoginAssetId;

        const total = await ZatraLoginMaster.countDocuments(filter);
        const list = await ZatraLoginMaster.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return res.json(
            __requestResponse("200", __SUCCESS, {
                total,
                page,
                limit,
                list: __deepClone(list),
            })
        );
    } catch (error) {
        console.error(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// 🔑 Login API
router.post("/NewZatraLogin", async (req, res) => {
    try {
        const { MobileNumber, Password, LoginAssetRef = [] } = req.body;

        const user = await ZatraLoginMaster.findOne({
            PhoneNumber: MobileNumber,
            LoginAssetRef: { $in: LoginAssetRef || [] },
        }).populate({ path: "LoginAssetType", select: "lookup_value" });
        if (!user) return res.json(__requestResponse("404", "User not found"));

        const isMatch = await bcrypt.compare(Password, user.Password || "");
        if (!isMatch)
            return res.json(__requestResponse("401", "Invalid credentials"));

        const token = __generateAuthToken({
            _id: user._id,
            AdminData: user,
        });

        console.log(user);

        let stationData = null;
        let AssetData = null;
        if (user?.LoginAssetType?.lookup_value == "Station") {
            stationData = await LookupModel.findById(
                user.LoginAssetId,
                "lookup_value parent_lookup_id"
            ).populate("parent_lookup_id", "lookup_value");
        }
        if (user?.LoginAssetType?.lookup_value == "Destination") {
            AssetData = await AssetMaster2.findById(user.LoginAssetId).populate(
                "StationId"
            );
            // StationId
        }
        // console.log(stationData);

        return res.json(
            __requestResponse("200", "Login successful", {
                AssetId: user.LoginAssetId,
                AdminData: {
                    ...__deepClone(user),
                    ...(AssetData && {
                        StationId: AssetData?.StationId?._id,
                        StationName: AssetData?.StationId?.lookup_value,
                    }),
                    ...(stationData && {
                        StationId: stationData?._id,
                        StationName: stationData?.lookup_value,
                        StateId: stationData?.parent_lookup_id?._id || null,
                        StateName:
                            stationData?.parent_lookup_id?.lookup_value || null,
                    }),
                },
                AuthToken: token,
            })
        );
    } catch (error) {
        console.error("❌ ZatraLogin Error:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
module.exports = router;

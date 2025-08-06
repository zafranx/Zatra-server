const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const ZatraMaster = require("../../../models/ZatraMaster");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  validateSaveZatra,
  validateSaveZatraEnrouteStations,
} = require("../Middleware/zatraMaster.validation");
const { createZatraLogin } = require("../../../utils/authHelper");
const UserMaster = require("../../../models/UserMaster");
const AdminLookups = require("../../../models/lookupmodel");

// 🔹 Add/Edit Zatra
router.post("/SaveZatra", validateSaveZatra, async (req, res) => {
  try {
    const payload = req.body;

    let mongoId = null;
    if (payload._id && mongoose.Types.ObjectId.isValid(payload._id)) {
      mongoId = mongoose.Types.ObjectId(payload._id);
    }

    // 🔹 Get RoleId for ZATRA ADMIN
    const zatraRole = await AdminLookups.findOne({
      lookup_type: "role_type",
      lookup_value: "ZATRA ADMIN",
      is_active: true,
    });

    // 🔹 Get RoleId for ORGANISER ADMIN
    const organiserRole = await AdminLookups.findOne({
      lookup_type: "role_type",
      lookup_value: "Organiser ADMIN",
      is_active: true,
    });

    // 🔹 Get RoleId for SPONSOR ADMIN
    const sponsorRole = await AdminLookups.findOne({
      lookup_type: "role_type",
      lookup_value: "Sponsor Admin",
      is_active: true,
    });

    if (!zatraRole || !organiserRole || !sponsorRole) {
      return res.json(
        __requestResponse("400", "Required role lookups not found")
      );
    }

    if (!mongoId) {
      // Create new
      const newRec = await ZatraMaster.create(payload);

      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Save",
        null,
        null,
        newRec,
        newRec._id,
        null,
        null
      );

      // 🔹 Handle ZatraAdmins
      if (
        Array.isArray(payload.ZatraAdmins) &&
        payload.ZatraAdmins.length > 0
      ) {
        const adminUsers = await UserMaster.find({
          _id: { $in: payload.ZatraAdmins },
        });

        for (const user of adminUsers) {
          try {
            // Create login for each ZatraAdmin
            console.log(`Creating Zatra login for UserId: ${user._id}`);
            await createZatraLogin({
              UserId: user._id,
              RoleId: zatraRole._id,
              FullName: user.FullName,
              MobileNumber: user.PhoneNumber,
              Password: String(user.PhoneNumber), // fallback password
              ValidFrom: payload.StartDate,
              ValidUpto: payload.EndDate,
              ZatraId: newRec._id,
            });
          } catch (err) {
            console.error("⚠️ Failed to create ZatraAdmin login:", err.message);
          }
        }
      }

      // 🔹 Handle OrganizerAdmins
      if (
        Array.isArray(payload.OrganizerAdmins) &&
        payload.OrganizerAdmins.length > 0
      ) {
        const orgUsers = await UserMaster.find({
          _id: { $in: payload.OrganizerAdmins },
        });

        for (const user of orgUsers) {
          try {
            await createZatraLogin({
              UserId: user._id,
              RoleId: organiserRole._id,
              FullName: user.FullName,
              MobileNumber: user.PhoneNumber,
              Password: String(user.PhoneNumber),
              ValidFrom: payload.StartDate,
              ValidUpto: payload.EndDate,
              ZatraId: newRec._id,
            });
          } catch (err) {
            console.error(
              "⚠️ Failed to create OrganizerAdmin login:",
              err.message
            );
          }
        }
      }

      // 🔹 Handle SponsorAdmins
      if (
        Array.isArray(payload.SponsorAdmins) &&
        payload.SponsorAdmins.length > 0
      ) {
        const sponsorUsers = await UserMaster.find({
          _id: { $in: payload.SponsorAdmins },
        });

        for (const user of sponsorUsers) {
          try {
            await createZatraLogin({
              UserId: user._id,
              RoleId: sponsorRole._id,
              FullName: user.FullName,
              MobileNumber: user.PhoneNumber,
              Password: String(user.PhoneNumber),
              ValidFrom: payload.StartDate,
              ValidUpto: payload.EndDate,
              ZatraId: newRec._id,
            });
          } catch (err) {
            console.error(
              "⚠️ Failed to create SponsorAdmin login:",
              err.message
            );
          }
        }
      }

      return res.json(
        __requestResponse("200", "Zatra created successfully", newRec)
      );
    } else {
      // Update existing
      const oldRec = await ZatraMaster.findById(mongoId);
      if (!oldRec) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND, {}));
      }

      const updated = await ZatraMaster.findByIdAndUpdate(
        mongoId,
        { ...payload, updatedAt: new Date() },
        { new: true }
      );

      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Edit",
        null,
        oldRec,
        updated,
        mongoId,
        null,
        null
      );

      return res.json(
        __requestResponse("200", "Zatra updated successfully", updated)
      );
    }
  } catch (error) {
    console.error(" SaveZatra Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

router.post(
  "/SaveZatra-EnrouteStations",
  validateSaveZatraEnrouteStations,
  async (req, res) => {
    try {
      const { _id, EnrouteStations } = req.body;

      // 🔹 Find Zatra record
      const oldRec = await ZatraMaster.findById(_id);
      if (!oldRec) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND, {}));
      }

      // 🔹 Update EnrouteStations
      const updated = await ZatraMaster.findByIdAndUpdate(
        _id,
        { $set: { EnrouteStations, updatedAt: new Date() } },
        { new: true }
      );

      // 🔹 Audit Log
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.EnrouteStations.Edit",
        null,
        oldRec,
        updated,
        _id,
        null,
        null
      );

      return res.json(
        __requestResponse(
          "200",
          "EnrouteStations updated successfully",
          updated
        )
      );
    } catch (error) {
      console.error(" SaveZatra-EnrouteStations Error:", error);
      return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
  }
);

// 🔹 Add/Edit Zatra
router.post("/SaveZatra-new", validateSaveZatra, async (req, res) => {
  try {
    const payload = req.body;

    let mongoId = null;
    if (payload._id && mongoose.Types.ObjectId.isValid(payload._id)) {
      mongoId = mongoose.Types.ObjectId(payload._id);
    }

    // 🔹 Fetch required roles in parallel
    const [zatraRole, organiserRole, sponsorRole] = await Promise.all([
      AdminLookups.findOne({
        lookup_type: "role_type",
        lookup_value: "ZATRA ADMIN",
        is_active: true,
      }),
      AdminLookups.findOne({
        lookup_type: "role_type",
        lookup_value: "Organiser ADMIN",
        is_active: true,
      }),
      AdminLookups.findOne({
        lookup_type: "role_type",
        lookup_value: "Sponsor Admin",
        is_active: true,
      }),
    ]);

    if (!zatraRole || !organiserRole || !sponsorRole) {
      return res.json(
        __requestResponse("400", "Required role lookups not found")
      );
    }

    let rec;
    if (!mongoId) {
      // Create new
      rec = await ZatraMaster.create(payload);

      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Save",
        null,
        null,
        rec,
        rec._id,
        null,
        null
      );
    } else {
      // Update existing
      const oldRec = await ZatraMaster.findById(mongoId);
      if (!oldRec) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND, {}));
      }

      rec = await ZatraMaster.findByIdAndUpdate(
        mongoId,
        { ...payload, updatedAt: new Date() },
        { new: true }
      );

      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Edit",
        null,
        oldRec,
        rec,
        mongoId,
        null,
        null
      );
    }

    // Helper to process Admin logins
    const processAdmins = async (ids, role, label) => {
      if (!Array.isArray(ids) || ids.length === 0) return;

      const users = await UserMaster.find({ _id: { $in: ids } });
      const foundIds = users.map((u) => String(u._id));

      // log missing IDs
      ids.forEach((id) => {
        if (!foundIds.includes(String(id))) {
          console.warn(`⚠️ ${label}: No user found for ID ${id}`);
        }
      });

      // create logins in parallel
      const results = await Promise.allSettled(
        users.map((user) =>
          createZatraLogin({
            UserId: user._id,
            RoleId: role._id,
            FullName: user.FullName,
            MobileNumber: user.PhoneNumber,
            Password: String(user.PhoneNumber), // fallback
            ValidFrom: payload.StartDate,
            ValidUpto: payload.EndDate,
            ZatraId: rec._id,
          })
        )
      );

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(
            `❌ Failed to create ${label} login for userId ${users[i]._id}:`,
            r.reason.message
          );
        } else {
          console.log(`✅ ${label} login created for userId ${users[i]._id}`);
        }
      });
    };

    // 🔹 Run all admin handlers in parallel
    await Promise.all([
      processAdmins(payload.ZatraAdmins, zatraRole, "ZatraAdmin"),
      processAdmins(payload.OrganizerAdmins, organiserRole, "OrganizerAdmin"),
      processAdmins(payload.SponsorAdmins, sponsorRole, "SponsorAdmin"),
    ]);

    return res.json(
      __requestResponse(
        "200",
        mongoId ? "Zatra updated successfully" : "Zatra created successfully",
        rec
      )
    );
  } catch (error) {
    console.error(" SaveZatra Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// 🔹 List Zatra
router.post("/ZatraList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { Name: { $regex: search, $options: "i" } },
        { ShortDescription: { $regex: search, $options: "i" } },
      ];
    }

    const [list, total] = await Promise.all([
      ZatraMaster.find(query)
        .populate("ZatraTypeId", "lookup_value")
        .populate("EnrouteStations.StateId", "lookup_value")
        .populate("EnrouteStations.CityId", "lookup_value")
        .populate(
          "Organizers",
          "OrganizerName ContactName EmailAddress IsSponsor"
        )
        .populate(
          "Sponsors",
          "OrganizerName ContactName EmailAddress IsSponsor"
        )
        .populate("OrganizerAdmins", "UserId RoleId")
        .populate("SponsorAdmins", "UserId RoleId")
        .populate("ZatraAdmins", "UserId RoleId")
        .populate("RegistrationFees.FeeCategory", "lookup_value")
        .populate("ZatraSocialMedia.SocialMediaId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ZatraMaster.countDocuments(query),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(" ZatraList Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// Add/Edit Zatra -- SaveZatra
router.post("/SaveZatra-old", async (req, res) => {
  try {
    const {
      _id,
      ZatraType,
      ZatraName,
      Logo,
      Website,
      StartDate,
      EndDate,
      ZatraOrganisers,
      CityId = [],
      ZatraCategoryId,
    } = req.body;

    const saveData = {
      ZatraType,
      ZatraName,
      Logo,
      Website,
      StartDate,
      EndDate,
      ZatraOrganisers,
      CityId,
      ZatraCategoryId,
    };

    let mongoId = null;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      mongoId = mongoose.Types.ObjectId(_id);
    }

    if (!mongoId) {
      const newRec = await ZatraMaster.create(saveData);
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await ZatraMaster.findById(mongoId);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await ZatraMaster.updateOne(
        { _id: mongoId },
        { $set: saveData }
      );
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Edit",
        null,
        oldRec,
        saveData,
        mongoId
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/ZatraList-old", async (req, res) => {
  try {
    const {
      ZatraType,
      ZatraName,
      CityId,
      StartDate,
      EndDate,
      page = 1,
      limit = 10,
      ZatraCategoryId,
    } = req.body;

    const filter = {};

    if (ZatraType) filter.ZatraType = ZatraType;
    if (ZatraName) filter.ZatraName = { $regex: ZatraName, $options: "i" };
    if (StartDate) filter.StartDate = { $gte: new Date(StartDate) };
    if (EndDate) filter.EndDate = { $lte: new Date(EndDate) };
    if (CityId) filter.CityId = { $in: CityId };
    if (ZatraCategoryId) filter.ZatraCategoryId = { $in: ZatraCategoryId };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ZatraMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ZatraCategoryId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ZatraMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;

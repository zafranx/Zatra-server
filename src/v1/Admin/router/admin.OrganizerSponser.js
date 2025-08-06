const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const OrganizerSponser = require("../../../models/OrganizerSponserMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { createZatraLogin } = require("../../../utils/authHelper");
const {
  validateSaveOrganizerSponser,
} = require("../Middleware/orzanizerSponsorMaster.validation");
const ZatraMaster = require("../../../models/ZatraMaster");
const AdminLookups = require("../../../models/lookupmodel");

// * Save (Add/Edit) Organizer or Sponsor
router.post("/SaveOrganizerSponserx", async (req, res) => {
  try {
    const payload = req.body;

    if (payload._id) {
      // 🔹 Edit
      const existing = await OrganizerSponser.findById(payload._id);
      if (!existing) {
        return res.json(
          __requestResponse("404", "Organizer/Sponsor not found", {})
        );
      }

      //   const updated = await OrganizerSponser.findByIdAndUpdate(
      //     payload._id,
      //     { ...payload, updatedAt: new Date() },
      //     { new: true }
      //   );
      const updated = await OrganizerSponser.findByIdAndUpdate(
        payload._id,
        { $set: payload },
        { new: true }
      );

      // Audit log
      await __CreateAuditLog(
        "organizer_sponser_master",
        "OrganizerSponser.Edit",
        null,
        existing,
        updated,
        updated._id,
        // updated.OrganizerId, // user
        null
      );

      return res.json(
        __requestResponse("200", "Updated successfully", updated)
      );
    } else {
      // 🔹 Add new
      const created = await OrganizerSponser.create(payload);

      await __CreateAuditLog(
        "organizer_sponser_master",
        "OrganizerSponser.Save",
        null,
        null,
        created,
        created._id,
        // created.OrganizerId,
        null
      );

      return res.json(
        __requestResponse("200", "Created successfully", created)
      );
    }
  } catch (error) {
    console.error("Error in SaveOrganizerSponser:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// * Save (Add/Edit) Organizer or Sponsor
router.post(
  "/SaveOrganizerSponser",
  validateSaveOrganizerSponser,
  async (req, res) => {
    try {
      const payload = req.body;

      let record;

      if (payload._id) {
        // 🔹 Edit
        const existing = await OrganizerSponser.findById(payload._id);
        if (!existing) {
          return res.json(
            __requestResponse("404", "Organizer/Sponsor not found", {})
          );
        }

        record = await OrganizerSponser.findByIdAndUpdate(
          payload._id,
          { $set: payload },
          { new: true }
        );

        // Audit log
        await __CreateAuditLog(
          "organizer_sponser_master",
          "OrganizerSponser.Edit",
          null,
          existing,
          record,
          record._id,
          null
        );
      } else {
        // 🔹 Add new
        record = await OrganizerSponser.create(payload);

        await __CreateAuditLog(
          "organizer_sponser_master",
          "OrganizerSponser.Save",
          null,
          null,
          record,
          record._id,
          null
        );
      }

      // 🔹 If marked as Organiser Admin → create login & update ZatraMaster
      if (payload.IsOrganiserAdmin && payload.ZatraId) {
        // Find related Zatra record
        const zatraRec = await ZatraMaster.findById(payload.ZatraId);
        if (zatraRec) {
          try {
            // Create Login
            console.log(
              `Creating OrganizerAdmin login for UserId: ${payload.UserId}`
            );
            await createZatraLogin({
              UserId: record._id,
              RoleId: (
                await AdminLookups.findOne({
                  lookup_type: "role_type",
                  lookup_value: "Organiser ADMIN",
                  is_active: true,
                })
              )?._id,
              FullName: payload.ContactName,
              MobileNumber: payload.ContactNumber,
              // Password: String(payload.PhoneNumber), // fallback password
              Password: payload.Password,
              ValidFrom: zatraRec.StartDate,
              ValidUpto: zatraRec.EndDate,
              ZatraId: zatraRec._id,
            });

            // Push Organizer to ZatraMaster.OrganizerAdmins
            await ZatraMaster.findByIdAndUpdate(
              zatraRec._id,
              { $addToSet: { OrganizerAdmins: record._id } }, // prevent duplicates
              { new: true }
            );
          } catch (err) {
            console.error(
              "⚠️ Failed to create OrganizerAdmin login:",
              err.message
            );
          }
        } else {
          console.warn("⚠️ No Zatra record found for OrganizerAdmin linking");
        }
      }

      return res.json(
        __requestResponse(
          "200",
          payload._id ? "Updated successfully" : "Created successfully",
          record
        )
      );
    } catch (error) {
      console.error("Error in SaveOrganizerSponser:", error);
      return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
  }
);


//*  List Organizers/Sponsors (with filters + pagination)
router.post("/ListOrganizerSponser", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      ZatraId,
      OrganizerTypeId,
      IsSponsor,
    } = req.body;

    const filter = {};
    if (ZatraId) filter.ZatraId = ZatraId;
    if (OrganizerTypeId) filter.OrganizerTypeId = OrganizerTypeId;
    if (typeof IsSponsor === "boolean") filter.IsSponsor = IsSponsor;

    if (search) {
      filter.$or = [
        { OrganizerName: { $regex: search, $options: "i" } },
        { ContactName: { $regex: search, $options: "i" } },
        { EmailAddress: { $regex: search, $options: "i" } },
      ];
    }

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [list, total] = await Promise.all([
      OrganizerSponser.find(filter)
        .populate("ZatraId", "ZatraName")
        .populate("OrganizerTypeId", "lookup_value")
        // .populate("OrganizerId", "FirstName LastName EmailAddress")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      OrganizerSponser.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page: parsedPage,
        limit: parsedLimit,
      })
    );
  } catch (error) {
    console.error("❌ Error in ListOrganizerSponser:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

module.exports = router;

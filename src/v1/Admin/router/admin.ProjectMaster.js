const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ProjectMaster = require("../../../models/ProjectMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");

const { __CreateAuditLog } = require("../../../utils/auditlog");

const {
  validateSaveProduct,
} = require("../Middleware/projectMaster.validation");
const {
  __SUCCESS,
  __RECORD_NOT_FOUND,
  __SOME_ERROR,
} = require("../../../utils/variable");

// Add / Edit Project
router.post("/SaveProject", validateSaveProduct, async (req, res) => {
  try {
    const {
      _id,
      CityId,
      ProjectType,
      ProjectName,
      ProjectLocation,
      PictureGallery,
      VideoGallery,
      MinimumInvestment,
      AssuredROI,
      LockinPeriod,
      ProjectStartDate,
      CompletionDeadline,
      AvailableSizes,
      ApprovalStatus,
      ContactName,
      PhoneNumber,
      EmailAddress,
      ProjectDeveloper,
      BankingPartner,
      DistancefromCity,
      DistancefromAirport,
      DistancefromRailwayStation,
      Amenities,
      Comments,
    } = req.body;

    const saveData = {
      CityId,
      ProjectType,
      ProjectName,
      ProjectLocation,
      PictureGallery,
      VideoGallery,
      MinimumInvestment,
      AssuredROI,
      LockinPeriod,
      ProjectStartDate,
      CompletionDeadline,
      AvailableSizes,
      ApprovalStatus,
      ContactName,
      PhoneNumber,
      EmailAddress,
      ProjectDeveloper,
      BankingPartner,
      DistancefromCity,
      DistancefromAirport,
      DistancefromRailwayStation,
      Amenities,
      Comments,
    };

    if (!_id) {
      const newRec = await ProjectMaster.create(saveData);
      await __CreateAuditLog(
        "project_master",
        "Project.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await ProjectMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      await ProjectMaster.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "project_master",
        "Project.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, saveData));
    }
  } catch (error) {
    console.error("Error in SaveProject:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// 🔹 List Projects (with pagination and optional filters)
router.post("/listProjects", async (req, res) => {
  try {
    const {
      CityId,
      ProjectType,
      ApprovalStatus,
      Amenities,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};

    if (CityId) filter.CityId = CityId;
    if (ProjectType) filter.ProjectType = ProjectType;
    if (ApprovalStatus) filter.ApprovalStatus = ApprovalStatus;
    if (Amenities && Array.isArray(Amenities) && Amenities.length > 0) {
      filter.Amenities = { $in: Amenities };
    }

    if (search) {
      filter.ProjectName = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      ProjectMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ProjectType", "lookup_value")
        .populate("AvailableSizes.Unit", "lookup_value")
        .populate("ApprovalStatus", "lookup_value")
        .populate("Amenities", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      ProjectMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: parsedPage,
        limit: parsedLimit,
        list: __deepClone(data),
      })
    );
  } catch (error) {
    console.error("❌ Error in listProjects:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// 🔹 Add / Edit Project
router.post(
  "/addOrEditProjectx-no-use",
  validateSaveProduct,
  async (req, res) => {
    try {
      let payload = { ...req.body };

      let data;
      if (payload._id) {
        data = await ProjectMaster.findByIdAndUpdate(payload._id, payload, {
          new: true,
        });
        await __CreateAuditLog("Edit", "project_master", payload._id, req);
      } else {
        data = await new ProjectMaster(payload).save();
        await __CreateAuditLog("Save", "project_master", data._id, req);
      }

      res
        .status(200)
        .json(__requestResponse("200", "Project saved successfully", data));
    } catch (err) {
      console.error("Error in addOrEditProject:", err);
      res.status(500).json(__requestResponse("500", "Server Error", err));
    }
  }
);

module.exports = router;

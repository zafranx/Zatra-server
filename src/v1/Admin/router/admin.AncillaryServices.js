const express = require("express");
const router = express.Router();

const AncillaryServiceMaster = require("../../../models/AncillaryServicesMaster");
const {
  validateSaveAncillaryService,
} = require("../Middleware/ancillaryService.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// 🔹 Add / Edit Ancillary Service
router.post(
  "/SaveAncillaryService",
  validateSaveAncillaryService,
  async (req, res) => {
    try {
      const {
        _id,
        ServiceType,
        ServiceProvider,
        PhoneNumber,
        IdNumber,
        IdCardPicture,
        PictureGallery,
        VideoGallery,
        IsVerified,
        VerificationReport,
        IsActive,
      } = req.body;

      const saveData = {
        ServiceType,
        ServiceProvider,
        PhoneNumber,
        IdNumber,
        IdCardPicture,
        PictureGallery,
        VideoGallery,
        IsVerified,
        VerificationReport,
        IsActive,
      };

      if (!_id) {
        const newRec = await AncillaryServiceMaster.create(saveData);
        await __CreateAuditLog(
          "ancillary_services_master",
          "Ancillary.Add",
          null,
          null,
          saveData,
          newRec._id
        );
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await AncillaryServiceMaster.findById(_id);
        if (!oldRec)
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await AncillaryServiceMaster.updateOne({ _id }, { $set: saveData });
        await __CreateAuditLog(
          "ancillary_services_master",
          "Ancillary.Edit",
          null,
          oldRec,
          saveData,
          _id
        );
        return res.json(__requestResponse("200", __SUCCESS, saveData));
      }
    } catch (error) {
      console.error(error);
      return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
  }
);

// 🔹 List Ancillary Services
router.post("/AncillaryServiceList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", ServiceType } = req.body;

    const filter = {};
    if (search) {
      filter.ServiceProvider = { $regex: search, $options: "i" };
    }
    if (ServiceType) filter.ServiceType = ServiceType;

    const total = await AncillaryServiceMaster.countDocuments(filter);
    const list = await AncillaryServiceMaster.find(filter)
      .populate("ServiceType", "lookup_value")
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

module.exports = router;

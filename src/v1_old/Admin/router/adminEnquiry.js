const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Enquiry = require("../../../models/Enquiry");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

router.post("/SaveEnquiry", async (req, res) => {
  try {
    const {
      enquiry_id,
      exhibitorId,
      assetId,
      fromExhibition,
      userId,
      enquiryDate,
      productId,
      qty,
      statusId,
      enquiryValue,
      deliveryAddress,
    } = req.body;

    const enquiryData = {
      ExhibitorID: exhibitorId,
      AssetID: assetId,
      FromExhibition: fromExhibition,
      UserID: userId,
      EnquiryDate: enquiryDate,
      ProductID: productId,
      Qty: qty,
      StatusID: statusId,
      EnquiryValue: enquiryValue,
      DeliveryAddress: deliveryAddress,
    };

    if (!enquiry_id) {
      const newRec = await Enquiry.create(enquiryData);
      await __CreateAuditLog(
        "enquiry",
        "Enquiry.Add",
        null,
        null,
        enquiryData,
        newRec._id,
        assetId,
        null
      );
      return res.status(200).json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await Enquiry.findById(enquiry_id);
      if (!oldRec)
        return res
          .status(404)
          .json(__requestResponse("404", __RECORD_NOT_FOUND));

      await Enquiry.updateOne({ _id: enquiry_id }, { $set: enquiryData });
      await __CreateAuditLog(
        "enquiry",
        "Enquiry.Edit",
        null,
        oldRec,
        enquiryData,
        enquiry_id,
        assetId,
        null
      );
      return res.status(200).json(__requestResponse("200", __SUCCESS));
    }
  } catch (error) {
    return res.status(500).json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/EnquiryList", async (req, res) => {
  try {
    const { assetId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json(__requestResponse("400", "Invalid Asset ID"));
    }

    const list = await Enquiry.find({ AssetID: assetId })
      // .populate("ExhibitorID", "ExhibitorName")
      .populate("UserID", "FullName")
      // .populate("ProductID", "ProductName")
      .populate("StatusID", "lookup_value");

    return res.status(200).json(__requestResponse("200", __SUCCESS, list));
  } catch (error) {
    return res
      .status(500)
      .json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

module.exports = router;

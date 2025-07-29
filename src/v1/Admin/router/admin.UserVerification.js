const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const UserVerification = require("../../../models/UserVerification");
const UserMaster = require("../../../models/UserMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Joi middleware for UserVerification
const Joi = require("joi");

// *************  UserMaster Validation *************
const validateSaveUser = (req, res, next) => {
  const schema = Joi.object({
    _id: Joi.string().optional().allow(null, ""), // For edit
    FirstName: Joi.string().allow("", null),
    LastName: Joi.string().allow("", null),
    DOB: Joi.date().allow(null, ""),
    Gender: Joi.string().valid("Male", "Female", "Other").allow("", null),
    PhoneNumber: Joi.number().allow(null),
    EmailAddress: Joi.string().email().allow("", null),
    KYC_Id: Joi.string().allow("", null), // ObjectId reference
    KYC_Number: Joi.string().allow("", null),
    KYC_Upload: Joi.string().allow("", null),
    Profile_Pic: Joi.string().allow("", null),
    User_Bio: Joi.string().allow("", null),
    Blood_Group: Joi.string().allow("", null), // ObjectId reference
    Pre_Existing_Diseases: Joi.string().allow("", null), // ObjectId reference
    Pregnancy: Joi.boolean().allow(null),
    Present_Disability: Joi.boolean().allow(null),
    Infectious_Diseases: Joi.boolean().allow(null),
    IsActive: Joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        errors: error.details.map((d) => d.message),
      })
    );
  }

  next();
};

// *************  UserVerification Validation *************
const validateUserVerification = (req, res, next) => {
  const schema = Joi.object({
    _id: Joi.string().optional(),
    UserId: Joi.string().allow("", null).optional(),
    // Verification_ChecklistId: Joi.string().allow("", null).optional(),
    Verification_ChecklistId: Joi.array()
      .items(Joi.string().allow("", null))
      .optional(),
    VerifierId: Joi.string().allow("", null).optional(),
    VerifierName: Joi.string().allow("", null).optional(),
    Verification_Status: Joi.string()
      .valid(
        "Verification Successful",
        "Verification Failed",
        "Pending",
        "Verification Denied"
      )
      .allow("", null)
      .optional(),
    Verification_Date: Joi.date().allow(null).optional(),
    Verification_Report: Joi.string().allow("", null).optional(),
    Comments: Joi.string().allow("", null).optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  next();
};

//******* ================= SAVE (Add / Edit User) =================
router.post("/SaveUser", validateSaveUser, async (req, res) => {
  try {
    const payload = req.body;

    if (payload._id) {
      // Check existing
      const existing = await UserMaster.findById(payload._id);
      if (!existing) {
        return res.json(__requestResponse("404", "User not found", {}));
      }

      // Update
      const updated = await UserMaster.findByIdAndUpdate(
        payload._id,
        { ...payload, updatedAt: new Date() },
        { new: true }
      );

      // Audit Log
      await __CreateAuditLog(
        "user_master", // CollectionName
        "User.Edit", // AuditType
        null, // AuditSubType
        existing, // OldValue
        updated, // NewValue
        updated._id, // RefId
        updated._id, // ClientId (User itself)
        null // LoginLogId
      );

      return res.json(
        __requestResponse("200", "User updated successfully", updated)
      );
    } else {
      // Create
      const created = await UserMaster.create(payload);

      // Audit Log
      await __CreateAuditLog(
        "user_master", // CollectionName
        "User.Save", // AuditType
        null, // AuditSubType
        null, // OldValue
        created, // NewValue
        created._id, // RefId
        created._id, // ClientId
        null // LoginLogId
      );

      return res.json(
        __requestResponse("200", "User created successfully", created)
      );
    }
  } catch (error) {
    console.error("❌ Error in SaveUser:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

//**** */ ================= LIST USERS =================
router.post("/ListUser", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;

    const query = {};

    if (search) {
      query.$or = [
        { FirstName: { $regex: search, $options: "i" } },
        { LastName: { $regex: search, $options: "i" } },
        { EmailAddress: { $regex: search, $options: "i" } },
        { PhoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserMaster.countDocuments(query);
    const list = await UserMaster.find(query)
      .populate("KYC_Id", "lookup_value")
      .populate("Blood_Group", "lookup_value")
      .populate("Pre_Existing_Diseases", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error("❌ Error in ListUser:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// *************  Add or Edit UserVerification *************
router.post(
  "/SaveUserVerification",
  validateUserVerification,
  async (req, res) => {
    try {
      const payload = req.body;

      if (payload._id) {
        const existing = await UserVerification.findById(payload._id);
        if (!existing) {
          return res.json(
            __requestResponse("404", "User verification not found", {})
          );
        }
        // const updated = await UserVerification.updateOne(
        //   { _id: payload._id },
        //   { ...payload, updatedAt: new Date() }
        // );
        const updated = await UserVerification.findByIdAndUpdate(
          payload._id,
          { ...payload, updatedAt: new Date() },
          { new: true }
        );

        await __CreateAuditLog(
          "user_verification", // CollectionName
          "UserVerification.Edit", // AuditType
          null, // AuditSubType
          existing, // OldValue
          updated, // NewValue
          updated._id, // RefId
          updated.UserId, // ClientId
          null // LoginLogId
        );

        return res.json(
          __requestResponse("200", "Verification updated", updated)
        );
      } else {
        const created = await UserVerification.create(payload);

        await __CreateAuditLog(
          "user_verification", // CollectionName
          "UserVerification.Save", // AuditType
          null, // AuditSubType
          null, // OldValue
          created, // NewValue
          created._id, // RefId
          created.UserId, // ClientId
          null // LoginLogId
        );

        return res.json(
          __requestResponse("200", "Verification created", created)
        );
      }
    } catch (error) {
      console.error("❌ Error in SaveUserVerification:", error);
      return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
  }
);
//***  not in use
router.post("/SaveUserVerification-not-in-use", async (req, res) => {
  try {
    const {
      _id,
      UserId,
      Verification_ChecklistId,
      VerifierId,
      VerifierName,
      Verification_Status,
      Verification_Date,
      Verification_Report,
      Comments,
    } = req.body;

    const dataPayload = {
      UserId,
      Verification_ChecklistId,
      VerifierId,
      VerifierName,
      Verification_Status,
      Verification_Date,
      Verification_Report,
      Comments,
    };

    let result;

    if (_id) {
      const existing = await UserVerification.findById(_id);
      if (!existing) {
        return res.json(
          __requestResponse("404", "User verification not found", {})
        );
      }

      await UserVerification.findByIdAndUpdate(_id, dataPayload, { new: true });
      result = await UserVerification.findById(_id).populate(
        "UserId Verification_ChecklistId VerifierId"
      );

      await __CreateAuditLog(
        "user_verification", // CollectionName
        "UserVerification.Edit", // AuditType
        null, // AuditSubType
        existing, // OldValue
        result, // NewValue
        _id, // RefId
        result.UserId, // ClientId (safe, comes from DB)
        null // LoginLogId
      );

      return res.json(__requestResponse("200", "Updated successfully", result));
    } else {
      const newEntry = await UserVerification.create(dataPayload);
      result = await UserVerification.findById(newEntry._id).populate(
        "UserId Verification_ChecklistId VerifierId"
      );

      await __CreateAuditLog(
        "user_verification", // CollectionName
        "UserVerification.Save", // AuditType
        null, // AuditSubType
        null, // OldValue
        result, // NewValue
        newEntry._id, // RefId
        result.UserId, // ClientId (safe, comes from DB)
        null // LoginLogId
      );

      return res.json(__requestResponse("200", "Saved successfully", result));
    }
  } catch (error) {
    console.error("Save User Verification Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// ***  List UserVerification
router.post("/ListUserVerification", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;

    const query = {
      $or: [
        { VerifierName: { $regex: search, $options: "i" } },
        { Verification_Status: { $regex: search, $options: "i" } },
      ],
    };

    const total = await UserVerification.countDocuments(query);
    const list = await UserVerification.find(query)
      .populate("UserId", "FirstName LastName Email")
      .populate("Verification_ChecklistId", "lookup_value")
      .populate("VerifierId", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
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

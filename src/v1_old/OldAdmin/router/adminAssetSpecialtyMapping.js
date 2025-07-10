const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const tlbAssetSpecialtyMapping = require("../../../models/AssetSpecialtyMapping");

const {
  checkAssetSpecialty,
} = require("../Middleware/middleAssetSpecialtyMapping");
// const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
// const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");
// const AdminEnvSetting = require("../../../models/AdminEnvSetting");
let APIEndPointNo = "";

router.post("/SaveAssetSpecialty", checkAssetSpecialty, async (req, res) => {
  APIEndPointNo = "#KCC0004";
  try {
    let { AssetId, IsActive, assetSpecialty_id } = req.body;
    let SpecialtyId =
      req.body.SpecialtyId && req.body.SpecialtyId != ""
        ? mongoose.Types.ObjectId(req.body.SpecialtyId)
        : null;
    let SubSpecialityId = req.body.SubSpecialityId
      ? req.body.SubSpecialityId.map((id) => mongoose.Types.ObjectId(id))
      : [];
    let SuperSpecializationId = req.body.SuperSpecializationId
      ? req.body.SuperSpecializationId.map((id) => mongoose.Types.ObjectId(id))
      : [];
    if (assetSpecialty_id == null || assetSpecialty_id == "") {
      const _AssetSpecialty = {
        AssetId: AssetId,
        SpecialtyId: SpecialtyId,
        SubSpeciality: SubSpecialityId,
        SuperSpecialization: SuperSpecializationId,
        IsActive: IsActive,
      };
      await tlbAssetSpecialtyMapping.create(_AssetSpecialty).then((x) => {
        __CreateAuditLog(
          "asset_specialty_mappings",
          "Asset_specialty.Add",
          null,
          null,
          _AssetSpecialty,
          x._id, // assetSpecialty_id
          AssetId,
          null
        );
        return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
      });
    } else {
      const _oldrec = await tlbAssetSpecialtyMapping.findOne({
        _id: assetSpecialty_id,
      });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "Asset_specialty not found"));
      }
      const _AssetSpecialty = {
        AssetId: AssetId,
        SpecialtyId: SpecialtyId,
        SubSpeciality: SubSpecialityId,
        SuperSpecialization: SuperSpecializationId,
        IsActive: IsActive,
      };

      const _UpdateAssetSpecialty = await tlbAssetSpecialtyMapping.updateOne(
        { _id: assetSpecialty_id },
        {
          $set: _AssetSpecialty,
        }
      );

      if (_UpdateAssetSpecialty) {
        __CreateAuditLog(
          "asset_specialty_mappings",
          "Asset_specialty.Edit",
          null,
          _oldrec ? _oldrec : null,
          _AssetSpecialty,
          assetSpecialty_id,
          AssetId,
          null
        );
        return res
          .json(__requestResponse("200", __SUCCESS, _UpdateAssetSpecialty))
          .status(200);
      }
    }
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

// router.post("/AssetSpecialtyMapList2_old", async (req, res) => {
//   try {
//     const _assetId = mongoose.Types.ObjectId.isValid(req.body.AssetId)
//       ? mongoose?.Types?.ObjectId(req.body.AssetId)
//       : null;

//     if (!_assetId) {
//       return res.json(__requestResponse("400", "Invalid Id"));
//     }

//     const _AssetSpecialtyMapList = await tlbAssetSpecialtyMapping
//       .find({
//         AssetId: mongoose.Types.ObjectId(_assetId),
//       })
//       .populate({
//         path: "SpecialtyId",
//         select: "lookup_value",
//       });
//     // .populate({
//     //   path: "AssetId",
//     //   select: "lookup_value",
//     // });
//     //   .populate({
//     //     path: "CreatedBy UpdatedBy",
//     //   });

//     const _AssetName = await AssetMaster.find({
//       AssetId: mongoose.Types.ObjectId(_assetId),
//     }).populate({
//       path: "Doctor",
//       select: "FirstName",
//     });

//     return res.json(
//       __requestResponse("200", __SUCCESS, _AssetSpecialtyMapList, _AssetName)
//     );
//   } catch (error) {
//     return res.json(__requestResponse("500", __SOME_ERROR, error));
//   }
// });

router.post("/AssetSpecialtyMapList", async (req, res) => {
  try {
    const _assetId = mongoose.Types.ObjectId.isValid(req.body.AssetId)
      ? mongoose.Types.ObjectId(req.body.AssetId)
      : null;

    if (!_assetId) {
      return res.json(__requestResponse("400", "Invalid Id"));
    }

    // Fetch specialty mappings for the asset
    const _AssetSpecialtyMapList = await tlbAssetSpecialtyMapping
      .find({
        AssetId: _assetId,
      })
      .populate({
        path: "SpecialtyId SubSpeciality SuperSpecialization",
        select: "lookup_value",
      });

    // Fetch the doctor name associated with this asset
    const assetWithDoctor = await AssetMaster.findOne({ _id: _assetId })
      .populate({
        path: "Doctor",
        select: "FirstName LastName",
      })
      .select("Doctor");

    const doctorName = assetWithDoctor?.Doctor
      ? `${assetWithDoctor.Doctor.FirstName} ${assetWithDoctor.Doctor.LastName}`
      : null;

    // Append doctor name to each specialty item
    const specialtiesWithDoctor = _AssetSpecialtyMapList.map((specialty) => ({
      ...specialty.toObject(),
      doctorName,
    }));

    return res.json(__requestResponse("200", __SUCCESS, specialtiesWithDoctor));
  } catch (error) {
    console.log(error, "error");
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;


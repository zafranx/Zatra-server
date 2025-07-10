const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __CLIENT_SAVE_ERROR,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const Joi = require("joi");
const tlbAssetMetaData = require("../../../models/AssetMetaData");

const { checkMetaData } = require("../Middleware/middlemetadata");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
let APIEndPointNo = "";
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

router.post("/SaveMetadata", checkMetaData, async (req, res) => {
  APIEndPointNo = "#KCC0004";
  try {
    let { metaData_id, assetId, dataTypeId, metaDataValue, isActive } =
      req.body;

    if (metaData_id == null || metaData_id == "") {
      const _MetaData = {
        AssetId: assetId,
        DataTypeId: dataTypeId,
        MetaDataValue: metaDataValue,
        IsActive: isActive,
      };
      await tlbAssetMetaData.create(_MetaData).then((x) => {
        __CreateAuditLog(
          "asset_meta_data",
          "Metadata.Add",
          null,
          null,
          _MetaData,
          x._id,
          assetId,
          null
        );
        return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
      });
    } else {
      const _oldrec = await tlbAssetMetaData.findOne({ _id: metaData_id });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "MetaData not found"));
      }
      const _MetaData = {
        AssetId: assetId,
        DataTypeId: dataTypeId,
        MetaDataValue: metaDataValue,
        IsActive: isActive,
      };

      const _UpdateMetaData = await tlbAssetMetaData.updateOne(
        { _id: metaData_id },
        {
          $set: _MetaData,
        }
      );
      if (_UpdateMetaData) {
        __CreateAuditLog(
          "asset_meta_data",
          "Metadata.Edit",
          null,
          _oldrec ? _oldrec : null,
          _MetaData,
          metaData_id,
          assetId,
          null
        );
        return res
          .json(__requestResponse("200", __SUCCESS, _UpdateMetaData))
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

router.post("/MetadataList", async (req, res) => {
  try {
    const _assetId = mongoose.Types.ObjectId.isValid(req.body.AssetId)
      ? mongoose?.Types?.ObjectId(req.body.AssetId)
      : null;

    if (!_assetId) {
      return res.json(__requestResponse("400", "Invalid Id"));
    }

    const _metaDataList = await tlbAssetMetaData
      .find({
        AssetId: mongoose.Types.ObjectId(_assetId),
      })
      .populate({
        path: "DataTypeId",
        select: "lookup_value",
      });
    // .populate({
    //   path: "AssetId",
    //   select: "AssetName",
    // });
    //   .populate({
    //     path: "CreatedBy UpdatedBy",
    //   });

    return res.json(__requestResponse("200", __SUCCESS, _metaDataList));
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;

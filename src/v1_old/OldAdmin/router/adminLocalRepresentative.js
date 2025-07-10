const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  checkLocalRepresentativeData,
} = require("../Middleware/middleLocalRepresentative");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// **Save Local Representative**
router.post(
  "/SaveLocalRepresentative",
  checkLocalRepresentativeData,
  async (req, res) => {
    const APIEndPointNo = "#LOCALREP001";
    try {
      const {
        local_representative_id,
        asset_type_id,
        parent_id,
        entry_by,
        name,
        profile_pic,
        title,
        phone,
        email,
        picture_gallery,
        videos,
      } = req.body;

      const _assetCode = await __AssetCode("LOCAL_REPRESENTATIVE");

      const _localRepresentativeData = {
        AssetCode: _assetCode,
        AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
        ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
        AssetName: name,
        EntryBy: mongoose.Types.ObjectId(entry_by),
        UpdateBy: null,
        LocalRepresentatives: {
          Name: name,
          ProfilePic: profile_pic,
          Title: title,
          Phone: phone,
          Email: email,
          PictureGallery: picture_gallery || [],
          Videos: videos || [],
        },
      };

      if (!local_representative_id) {
        const newLocalRepresentative = await AssetMaster.create(
          _localRepresentativeData
        );
        __CreateAuditLog(
          "asset_master",
          "LocalRepresentatives.Add",
          null,
          null,
          _localRepresentativeData,
          newLocalRepresentative._id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Local Representative added successfully.",
            newLocalRepresentative
          )
        );
      } else {
        const existingLocalRepresentative = await AssetMaster.findOne({
          _id: local_representative_id,
        });
        if (!existingLocalRepresentative) {
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
        }

        const updatedLocalRepresentative = await AssetMaster.updateOne(
          { _id: local_representative_id },
          { $set: _localRepresentativeData }
        );

        __CreateAuditLog(
          "asset_master",
          "LocalRepresentatives.Edit",
          null,
          existingLocalRepresentative,
          _localRepresentativeData,
          local_representative_id,
          null,
          null
        );
        return res.json(
          __requestResponse(
            "200",
            "Local Representative updated successfully.",
            updatedLocalRepresentative
          )
        );
      }
    } catch (error) {
      return res.json(
        __requestResponse(
          "500",
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
          error
        )
      );
    }
  }
);

// **Get Local Representative List**
router.get("/GetLocalRepresentativeList", async (req, res) => {
  const APIEndPointNo = "#LOCALREP002";
  try {
    // Get Local Representative Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_LOCAL_REPRESENTATIVE",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Local Representative Asset Type not found.")
      );
    }

    const localRepresentativeList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName");

    if (!localRepresentativeList || localRepresentativeList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        localRepresentativeList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          name: data.LocalRepresentatives?.Name,
          profilePic: data.LocalRepresentatives?.ProfilePic
            ? (process.env.NODE_ENV == "development"
                ? process.env.LOCAL_IMAGE_URL
                : __ImagePathDetails?.EnvSettingTextValue) +
              data.LocalRepresentatives?.ProfilePic
            : "",
          title: data.LocalRepresentatives?.Title,
          phone: data.LocalRepresentatives?.Phone,
          email: data.LocalRepresentatives?.Email,
          pictureGallery: data.LocalRepresentatives?.PictureGallery || [],
          videos: data.LocalRepresentatives?.Videos || [],
        }))
      )
    );
  } catch (error) {
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

module.exports = router;

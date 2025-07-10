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
const { checkArtisanData } = require("../Middleware/middleArtisan");
const AssetMaster = require("../../../models/AssetMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// **Save Artisan**
router.post("/SaveArtisan", checkArtisanData, async (req, res) => {
  const APIEndPointNo = "#ARTISAN001";
  try {
    const {
      artisan_id,
      asset_type_id,
      parent_id,
      entry_by,
      destination_id,
      art_and_craft_id,
      name,
      profile_pic,
      phone,
      email,
      address_id,
      certificates,
      picture_gallery,
      videos,
    } = req.body;

    const _assetCode = await __AssetCode("ARTISAN");

    const _artisanData = {
      AssetCode: _assetCode,
      AssetTypeID: mongoose.Types.ObjectId(asset_type_id),
      ParentID: parent_id ? mongoose.Types.ObjectId(parent_id) : null,
      AssetName: name,
      EntryBy: mongoose.Types.ObjectId(entry_by),
      UpdateBy: null,
      Artisan: {
        DestinationID: mongoose.Types.ObjectId(destination_id),
        ArtandCraftID: mongoose.Types.ObjectId(art_and_craft_id),
        Name: name,
        ProfilePic: profile_pic || "",
        Phone: phone,
        Email: email,
        AddressID: mongoose.Types.ObjectId(address_id),
        Certificates: certificates || [],
        PictureGallery: picture_gallery || [],
        Videos: videos || [],
      },
    };

    if (!artisan_id) {
      const newArtisan = await AssetMaster.create(_artisanData);
      __CreateAuditLog(
        "asset_master",
        "Artisan.Add",
        null,
        null,
        _artisanData,
        newArtisan._id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Artisan added successfully.", newArtisan)
      );
    } else {
      const existingArtisan = await AssetMaster.findOne({
        _id: artisan_id,
      });
      if (!existingArtisan) {
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));
      }

      const updatedArtisan = await AssetMaster.updateOne(
        { _id: artisan_id },
        { $set: _artisanData }
      );

      __CreateAuditLog(
        "asset_master",
        "Artisan.Edit",
        null,
        existingArtisan,
        _artisanData,
        artisan_id,
        null,
        null
      );
      return res.json(
        __requestResponse(
          "200",
          "Artisan updated successfully.",
          updatedArtisan
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
});

// **Get Artisan List**
router.get("/GetArtisanList", async (req, res) => {
  const APIEndPointNo = "#ARTISAN002";
  try {
    // Get Artisan Asset Type from Env settings
    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_ARTISAN",
    });

    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Artisan Asset Type not found.")
      );
    }

    const artisanList = await AssetMaster.find({
      AssetTypeID: _AssetType.EnvSettingValue,
    })
      .populate("AssetTypeID", "lookup_value")
      .populate("ParentID", "AssetName")
      .populate("Artisan.DestinationID", "lookup_value")
      .populate("Artisan.ArtandCraftID", "lookup_value")
      .populate({
        path: "Artisan.AddressID",
        model: "address_master",
        populate: [
          { path: "CountryId", select: "lookup_value" },
          { path: "StateId", select: "lookup_value" },
          { path: "CityId", select: "lookup_value" },
          { path: "AddressTypeId", select: "lookup_value" },
        ],
        select: "AddressLine1 AddressLine2 PIN geolocation",
      });

    if (!artisanList || artisanList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        artisanList.map((data) => ({
          _id: data._id,
          assetTypeId: data.AssetTypeID?._id,
          assetTypeName: data.AssetTypeID?.lookup_value,
          parentId: data.ParentID?._id,
          parentName: data.ParentID?.AssetName,
          name: data.Artisan?.Name,
          profilePic: data.Artisan?.ProfilePic
            ? (process.env.NODE_ENV == "development"
                ? process.env.LOCAL_IMAGE_URL
                : process.env.IMAGE_PATH) + data.Artisan.ProfilePic
            : "",
          phone: data.Artisan?.Phone,
          email: data.Artisan?.Email,
          destinationName: data.Artisan?.DestinationID?.lookup_value,
          artAndCraftName: data.Artisan?.ArtandCraftID?.lookup_value,
          certificates: data.Artisan?.Certificates || [],
          pictureGallery: data.Artisan?.PictureGallery || [],
          videos: data.Artisan?.Videos || [],
          address: data.Artisan?.AddressID
            ? {
                _id: data.Artisan.AddressID._id,
                address_type:
                  data.Artisan.AddressID.AddressTypeId?.lookup_value,
                line1: data.Artisan.AddressID.AddressLine1,
                line2: data.Artisan.AddressID.AddressLine2,
                city: data.Artisan.AddressID.CityId?.lookup_value,
                state: data.Artisan.AddressID.StateId?.lookup_value,
                country: data.Artisan.AddressID.CountryId?.lookup_value,
                pin: data.Artisan.AddressID.PIN,
                full_address: `${data.Artisan.AddressID.AddressLine1}, ${data.Artisan.AddressID.AddressLine2}, ${data.Artisan.AddressID.CityId?.lookup_value}, ${data.Artisan.AddressID.StateId?.lookup_value}, ${data.Artisan.AddressID.CountryId?.lookup_value} - ${data.Artisan.AddressID.PIN}`,
              }
            : null,
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

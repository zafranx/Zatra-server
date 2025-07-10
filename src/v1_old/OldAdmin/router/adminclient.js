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
const tlbClient = require("../../../models/AssetMaster");

const {
  checkClientData,
  checkClientUser,
} = require("../Middleware/middleclient");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const { __GetPassportNumber } = require("../../../utils/passportnumber");
let APIEndPointNo = "";

router.get("/shortclientlist", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0001";
    const { parent_client_id } = req.body;
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_CLIENT",
    });
    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Client Type Id not found in  Env Settings")
      );
    } else {
      //console.log("Asset Type:", _AssetType.EnvSettingValue);
    }

    const clientList = await tlbClient.aggregate([
      {
        $match: {
          AssetTypeID: mongoose.Types.ObjectId(_AssetType.EnvSettingValue),
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,

          __v: 0,
          ParentAssetID: 0,
          ReferralID: 0,
          EntryBy: 0,
          UpdateBy: 0,
          Hospital: 0,
          User: 0,
          Doctor: 0,
        },
      },
    ]);
    console.log(clientList);
    return res.json(__requestResponse("200", __SUCCESS, clientList));
  } catch (error) {
    return res.json(
      __requestResponse(
        "500",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1"
      )
    );
  }
});
router.post("/Clientlist", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0001";
    const { parent_client_id } = req.body;

    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_CLIENT",
    });
    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "Client Type Id not found in  Env Settings")
      );
    }

    const clientList = await tlbClient
      .find(
        {
          ...(parent_client_id && { ParentID: parent_client_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        "_id ParentID AssetName AssetCode ReferralID EntryBy UpdateBy createdAt updatedAt Client"
      )
      .populate({
        path: "ParentID Client.ClientTypeID Client.IndustryID Client.LegalStatusID",
        select: "lookup_value AssetName",
      });

    return res.json(__requestResponse("200", __SUCCESS, clientList));
  } catch (error) {
    console.log(error);
    return res.json(
      __requestResponse(
        "500",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1"
      )
    );
  }
});

router.post("/SaveClient", checkClientData, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0002";
    let _client_id = req.body.client_id;
    let _referUserId =
      req.body.referring_user_id && req.body.referring_user_id != ""
        ? mongoose.Types.ObjectId(req.body.referring_user_id)
        : null;
    let _parentClientId =
      req.body.parent_client_id && req.body.parent_client_id != ""
        ? mongoose.Types.ObjectId(req.body.parent_client_id)
        : null;
    let _clientName = req.body.client_name;
    let _legal_Status_Id =
      req.body.legal_status_id && req.body.legal_status_id != ""
        ? mongoose.Types.ObjectId(req.body.legal_status_id)
        : null;
    let _client_Type_Id =
      req.body.client_type_id && req.body.client_type_id != ""
        ? mongoose.Types.ObjectId(req.body.client_type_id)
        : null;
    let _industryId =
      req.body.industry_id && req.body.industry_id != ""
        ? mongoose.Types.ObjectId(req.body.industry_id)
        : null;
    let _website = req.body.website;
    let _entryBy = req.body.entryBy;
    let _assetCode = "";
    let _asset_type_id =
      req.body.asset_type_id && req.body.asset_type_id != ""
        ? mongoose.Types.ObjectId(req.body.asset_type_id)
        : null;
    let _local_client_id = null;

    if (_client_id == null || _client_id == "") {
      _assetCode = await __AssetCode("CLIENT");

      let _clientData = {
        AssetCode: _assetCode,
        AssetTypeID: _asset_type_id,
        ReferralID: _referUserId,
        ParentID: _parentClientId,
        AssetName: _clientName,
        EntryBy: _entryBy,
        UpdateBy: null,
        Client: {
          ClientTypeID: _client_Type_Id,
          IndustryID: _industryId,
          Website: _website,
          LegalStatusID: _legal_Status_Id,
        },
      };

      await tlbClient
        .create(_clientData)
        .then((x) => {
          _local_client_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __CLIENT_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _clientData,
        _local_client_id,
        _local_client_id,
        null
      );
    } else {
      //get the Old Record to save in Audit log
      const _oldrec = await tlbClient.findOne({ _id: _client_id });
      let _clientData = {
        AssetTypeID: _asset_type_id,
        ReferralID: _referUserId,
        ParentID: _parentClientId,
        AssetName: _clientName,
        UpdateBy: _entryBy,
        Client: {
          ClientTypeID: _client_Type_Id,
          IndustryID: _industryId,
          Website: _website,
          LegalStatusID: _legal_Status_Id,
        },
      };
      const _clientgUpdate = await tlbClient.updateOne(
        { _id: _client_id },
        {
          $set: {
            AssetTypeID: _asset_type_id,
            ReferralID: _referUserId,
            ParentAssetID: _parentClientId,
            AssetName: _clientName,
            UpdateBy: _entryBy,
            Client: {
              ClientTypeID: _client_Type_Id,
              IndustryID: _industryId,
              Website: _website,
              LegalStatusID: _legal_Status_Id,
            },
          },
        }
      );

      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _clientData,
        _local_client_id,
        _local_client_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _clientgUpdate));
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

router.get("/ClientList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0003";
    const _clientList = await tlbClient.aggregate([
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Client.IndustryID",
          foreignField: "_id",
          as: "Industry",
        },
      },
      {
        $unwind: "$Industry",
      },
      {
        $project: {
          "Industry._id": 0,
          "Industry.lookup_type": 0,
          "Industry.parent_lookup_type": 0,
          "Industry.parent_lookup_value": 0,
          "Industry.is_active": 0,
          "Industry.managed_by_ui": 0,
          "Industry.client_id": 0,
          "Industry.__v": 0,
          "Industry.createdAt": 0,
          "Industry.updatedAt": 0,
          "Industry.sort_order": 0,
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Client.ClientTypeID",
          foreignField: "_id",
          as: "ClientType",
        },
      },
      {
        $unwind: "$ClientType",
      },
      {
        $project: {
          "ClientType._id": 0,
          "ClientType.lookup_type": 0,
          "ClientType.parent_lookup_type": 0,
          "ClientType.parent_lookup_value": 0,
          "ClientType.is_active": 0,
          "ClientType.managed_by_ui": 0,
          "ClientType.client_id": 0,
          "ClientType.__v": 0,
          "ClientType.createdAt": 0,
          "ClientType.updatedAt": 0,
          "ClientType.sort_order": 0,
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "Client.LegalStatusID",
          foreignField: "_id",
          as: "LegalStatus",
        },
      },
      {
        $unwind: "$LegalStatus",
      },
      {
        $project: {
          "LegalStatus._id": 0,
          "LegalStatus.lookup_type": 0,
          "LegalStatus.parent_lookup_type": 0,
          "LegalStatus.parent_lookup_value": 0,
          "LegalStatus.is_active": 0,
          "LegalStatus.managed_by_ui": 0,
          "LegalStatus.client_id": 0,
          "LegalStatus.__v": 0,
          "LegalStatus.createdAt": 0,
          "LegalStatus.updatedAt": 0,
          "LegalStatus.sort_order": 0,
        },
      },
      {
        $project: {
          // _id: 0,
          createdAt: 0,
          updatedAt: 0,
          "Client.ClientTypeID": 0,
          "Client.IndustryID": 0,
          "Client.LegalStatusID": 0,
          __v: 0,
        },
      },
    ]);

    return res
      .json(__requestResponse("200", __SUCCESS, _clientList))
      .status(200);
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

router.post("/SaveClientUser", checkClientUser, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0002";
    const {
      client_user_id, //for edit
      first_name,
      last_name,
      client_id,
      gender,
      mobile_no,
      email_address,
      designation_id,
      parent_user_id,
      profile_pic,
    } = req.body;

    let _local_client_user_id = null;
    let _assetCode = await __AssetCode("CLIENT_USER");

    if (!client_user_id) {
      const AssetTypeDetails = await tlbEnvSetting.findOne({
        EnvSettingCode: "ASSET_TYPE_CLIENT_USER",
      });

      if (!AssetTypeDetails) {
        return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
      }

      let _clientUserData = {
        AssetCode: _assetCode,
        AssetTypeID: AssetTypeDetails?.EnvSettingValue,
        ParentID: parent_user_id,
        AssetName: [first_name, last_name].join(" "),
        ClientUser: {
          FirstName: first_name,
          LastName: last_name,
          Gender: gender,
          MobileNo: mobile_no,
          EmailAddress: email_address,
          DesignationID: designation_id,
          ProfilePic: profile_pic,
        },
      };

      await tlbClient
        .create(_clientUserData)
        .then((x) => {
          _local_client_user_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __CLIENT_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _clientUserData,
        _local_client_user_id,
        client_id,
        null
      );
    } else {
      //get the Old Record to save in Audit log
      const _oldrec = await tlbClient.findOne({ _id: client_user_id });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "Client User not found"));
      }
      let _clientUserData = {
        AssetTypeID: _oldrec?.AssetTypeID,
        ReferralID: _oldrec?.ReferralID || null,
        ParentID: parent_user_id,
        AssetName: [first_name, last_name].join(" "),
        // UpdateBy: _entryBy,
        ClientUser: {
          FirstName: first_name,
          LastName: last_name,
          Gender: gender,
          MobileNo: mobile_no,
          EmailAddress: email_address,
          DesignationID: designation_id,
          ProfilePic: profile_pic,
        },
      };
      const _clientgUpdate = await tlbClient.updateOne(
        { _id: client_user_id },
        {
          $set: _clientUserData,
        }
      );

      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _clientUserData,
        client_user_id,
        client_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _clientgUpdate));
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

router.post("/GetClientUserListing", async (req, res) => {
  try {
    const { parent_client_id } = req.body;

    const AssetTypeDetails = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_CLIENT_USER",
    });
    if (!AssetTypeDetails) {
      return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
    }
    const __parentId = mongoose.Types.ObjectId.isValid(parent_client_id)
      ? mongoose?.Types?.ObjectId(parent_client_id)
      : null;
    if (!__parentId) {
      return res.json(__requestResponse("400", "Invalid parent Id"));
    }
    const __assetTypeId = mongoose.Types.ObjectId.isValid(
      AssetTypeDetails?.EnvSettingValue
    )
      ? mongoose?.Types?.ObjectId(AssetTypeDetails?.EnvSettingValue)
      : null;
    if (!__assetTypeId) {
      return res.json(__requestResponse("400", "Invalid Asset Type Id"));
    }

    const populateData = new Array();
    populateData.push({
      path: "ClientUser.DesignationID",
      select: "lookup_value",
    });
    // "AssetName AssetCode ParentID User User.FirstName User.LastName User.MobileNo User.EmailAddress User.ProfilePic User.Designation"
    const list = await AssetMaster.find(
      {
        AssetTypeID: __assetTypeId,
        ParentID: __parentId,
      },
      "AssetName AssetCode ParentID ClientUser"
    ).populate(populateData);

    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          ...item,
          ClientUser: {
            ...item.ClientUser,
            ...(item?.ClientUser?.ProfilePic
              ? {
                  // ProfilePic:
                  //   __ImagePathDetails?.EnvSettingTextValue +
                  //   item?.ClientUser?.ProfilePic,
                  ProfilePic: item.ClientUser?.ProfilePic
                    ? (process.env.NODE_ENV == "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue) +
                      item.ClientUser?.ProfilePic
                    : "",
                }
              : { ProfilePic: "" }),
          },
        }))
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// router.post("/GetPassportNumber", async (req, res) => {
//   const { countryid, blood_group, dob, gender } = req.body;
//   const _Passport_Number = await __GetPassportNumber(
//     countryid,
//     dob,
//     blood_group,
//     gender
//   );
//   if (_Passport_Number) {
//     return res.json(__requestResponse("200", __SUCCESS, _Passport_Number));
//   }
// });

module.exports = router;

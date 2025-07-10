const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");

const tlbPathology = require("../../../models/AssetMaster");

const { checkPathologyData } = require("../Middleware/middlepathology");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");

let APIEndPointNo = "";

/**
 * Handles the saving and updating of pathology data.
 *
 * @param {Object} req - The request object containing the body data.
 * @param {Object} res - The response object to send back the API response.
 * @param {string} req.body.pathology_id - The ID of the pathology to update. If null or empty, a new pathology will be created.
 * @param {string} req.body.name - The name of the pathology.
 * @param {string} req.body.contact_no - The contact number of the pathology.
 * @param {string} req.body.postal_code - The postal code of the pathology.
 * @param {string} req.body.email_address - The email address of the pathology.
 * @param {string} req.body.location_id - The ID of the location associated with the pathology.
 * @param {string} req.body.registration_no - The registration number of the pathology.
 * @param {string} req.body.website - The website of the pathology.
 * @param {string} req.body.parent_client_id - The ID of the parent client.
 * @param {string} req.body.entryBy - The user ID of the person entering the data.
 * @param {string} req.body.asset_type_id - The ID of the asset type for pathology.
 *
 * @returns {Object} - The API response object containing the status code, message, and data.
 */

router.post("/SavePathology", checkPathologyData, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0004";
    // req.body
    let _pathology_id = req.body.pathology_id;
    let _referUserId =
      req.body.referring_user_id && req.body.referring_user_id != ""
        ? mongoose.Types.ObjectId(req.body.referring_user_id)
        : null;
    let _name = req.body.name;
    let _contactNo = req.body.contact_no;
    let _postalCode = req.body.postal_code;
    let _emailAddress = req.body.email_address;
    let _locationID =
      req.body.location_id && req.body.location_id != ""
        ? mongoose.Types.ObjectId(req.body.location_id)
        : null;
    let _registrationNo = req.body.registration_no;
    let _website = req.body.website;

    //for  asset master
    let _parentClientId =
      req.body.parent_client_id && req.body.parent_client_id != ""
        ? mongoose.Types.ObjectId(req.body.parent_client_id)
        : null;
    let _entryBy = req.body.entryBy;
    let _assetCode = "";
    let _asset_type_id =
      req.body.asset_type_id && req.body.asset_type_id != ""
        ? mongoose.Types.ObjectId(req.body.asset_type_id)
        : null;
    let _local_pathology_id = null;

    if (_pathology_id == null || _pathology_id == "") {
      _assetCode = await __AssetCode("PATHOLOGY");

      let _pathologyData = {
        AssetCode: _assetCode,
        AssetTypeID: _asset_type_id, // getting from env settings - req.body.asset_type_id = _AssetType.EnvSettingValue;
        ReferralID: _referUserId,
        AssetName: _name,
        ParentID: _parentClientId,
        EntryBy: _entryBy,
        UpdateBy: null,
        Pathology: {
          Name: _name,
          ContactNo: _contactNo,
          PostalCode: _postalCode,
          EmailAddress: _emailAddress,
          LocationID: _locationID,
          RegistrationNo: _registrationNo,
          Website: _website,
        },
      };

      await tlbPathology
        .create(_pathologyData)
        .then((x) => {
          _local_pathology_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __PATHOLOGY_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _pathologyData,
        _local_pathology_id,
        _local_pathology_id,
        null
      );
    } else {
      // Get the old record to save in Audit log
      const _oldrec = await tlbPathology.findOne({ _id: _pathology_id });
      let _pathologyData = {
        ReferralID: _referUserId,
        AssetName: _name,
        ParentID: _parentClientId,
        EntryBy: _entryBy,
        UpdateBy: null,
        ParentID: _parentClientId,
        UpdateBy: _entryBy,
        Pathology: {
          Name: _name,
          ContactNo: _contactNo,
          PostalCode: _postalCode,
          EmailAddress: _emailAddress,
          LocationID: _locationID,
          RegistrationNo: _registrationNo,
          Website: _website,
        },
      };

      const _pathologyUpdate = await tlbPathology.updateOne(
        { _id: _pathology_id },
        { $set: _pathologyData }
      );

      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _pathologyData,
        _pathology_id,
        _pathology_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _pathologyUpdate));
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

router.post("/PathologyList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0004";
    const { parent_client_id } = req.body;
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PATHOLOGY",
    });
    const pathologyList = await tlbPathology
      .find(
        {
          ...(parent_client_id && { ParentID: parent_client_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        "ParentID EntryBy UpdateBy createdAt updatedAt Pathology"
      )
      .populate({
        path: "ParentID Pathology.LocationID",
        select: "lookup_value AddressLine1",
      });

    return res.json(__requestResponse("200", __SUCCESS, pathologyList));
  } catch (error) {
    console.log(error);
    return res.json(
      __requestResponse(
        "500",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

module.exports = router;

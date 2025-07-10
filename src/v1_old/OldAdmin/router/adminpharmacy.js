const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");

const tlbPharmacy = require("../../../models/AssetMaster");

const { checkPharmacyData } = require("../Middleware/middlepharmacy");
const { __AssetCode } = require("../../../utils/assetcode");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
let APIEndPointNo = "";

router.post("/SavePharmacy", checkPharmacyData, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0005";
    let _pharmacy_id = req.body.pharmacy_id;
    let _referUserId =
      req.body.referring_user_id && req.body.referring_user_id != ""
        ? mongoose.Types.ObjectId(req.body.referring_user_id)
        : null;

    let _parentClientId =
      req.body.parent_client_id && req.body.parent_client_id != ""
        ? mongoose.Types.ObjectId(req.body.parent_client_id)
        : null;
    let _entryBy = req.body.entryBy;
    // from body
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

    let _assetCode = "";
    let _asset_type_id =
      req.body.asset_type_id && req.body.asset_type_id != ""
        ? mongoose.Types.ObjectId(req.body.asset_type_id)
        : null;
    let _local_pharmacy_id = null;

    if (_pharmacy_id == null || _pharmacy_id == "") {
      _assetCode = await __AssetCode("PHARMACY");

      let _pharmacyData = {
        AssetCode: _assetCode,
        AssetTypeID: _asset_type_id, // getting from env settings
        ReferralID: _referUserId,
        AssetName: _name,
        ParentID: _parentClientId,
        EntryBy: _entryBy,
        UpdateBy: null,
        Pharmacy: {
          Name: _name,
          ContactNo: _contactNo,
          PostalCode: _postalCode,
          EmailAddress: _emailAddress,
          LocationID: _locationID,
          RegistrationNo: _registrationNo,
          Website: _website,
        },
      };

      await tlbPharmacy
        .create(_pharmacyData)
        .then((x) => {
          _local_pharmacy_id = x._id;
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __PHARMACY_SAVE_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });

      __CreateAuditLog(
        "asset_master",
        "Asset.Add",
        null,
        null,
        _pharmacyData,
        _local_pharmacy_id,
        _local_pharmacy_id,
        null
      );
    } else {
      // Get the old record to save in Audit log
      const _oldrec = await tlbPharmacy.findOne({ _id: _pharmacy_id });
      let _pharmacyData = {
        ReferralID: _referUserId,
        AssetName: _name,
        ParentID: _parentClientId,
        EntryBy: _entryBy,
        UpdateBy: null,
        Pharmacy: {
          Name: _name,
          ContactNo: _contactNo,
          PostalCode: _postalCode,
          EmailAddress: _emailAddress,
          LocationID: _locationID,
          RegistrationNo: _registrationNo,
          Website: _website,
        },
      };

      const _pharmacyUpdate = await tlbPharmacy.updateOne(
        { _id: _pharmacy_id },
        { $set: _pharmacyData }
      );

      __CreateAuditLog(
        "asset_master",
        "Asset.Edit",
        null,
        _oldrec ? _oldrec : null,
        _pharmacyData,
        _pharmacy_id,
        _pharmacy_id,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, _pharmacyUpdate));
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

router.post("/PharmacyList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0005";
    const { parent_client_id } = req.body;
    const _AssetType = await tlbEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_PHARMACY",
    });
    if (!_AssetType) {
      return res.json(
        __requestResponse("400", "PHARMACY Type Id not found in  Env Settings")
      );
    }
    const pharmacyList = await tlbPharmacy
      .find(
        {
          ...(parent_client_id && { ParentID: parent_client_id }),
          AssetTypeID: _AssetType?.EnvSettingValue || null,
        },
        "ParentID EntryBy UpdateBy createdAt updatedAt Pharmacy"
      )
      .populate([
        {
          path: "ParentID",
          select: "lookup_value",
        },
        {
          path: "Pharmacy.LocationID",
          model: "address_master", // Refers to address_master schema
          populate: [
            { path: "CountryId", select: "lookup_value" },
            { path: "StateId", select: "lookup_value" },
            { path: "CityId", select: "lookup_value" },
            { path: "AddressTypeId", select: "lookup_value" },
          ],
          select: "AddressLine1 AddressLine2 PIN geolocation", // Select fields from address_master
        },
      ]);

    return res.json(__requestResponse("200", __SUCCESS, pharmacyList));
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


// POST API to add/update environment settings
router.post("/updateEnvSettingx", async (req, res) => {
  try {
    const { EnvSettingCode, EnvSettingValue } = req.body;

    // Validate required fields
    if (!EnvSettingCode || !EnvSettingValue) {
      return res.status(400).json({
        success: false,
        message: "EnvSettingCode and EnvSettingValue are required.",
      });
    }

    // Check if the EnvSettingValue already exists for the same EnvSettingCode
    const existingSetting = await tlbEnvSetting.findOne({
      EnvSettingCode,
      EnvSettingValue,
    });

    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: Asset ID ${EnvSettingValue} is already registered for ${EnvSettingCode}.`,
      });
    }

    // Create a new record if no duplicate is found
    const envSetting = new tlbEnvSetting({
      EnvSettingCode,
      EnvSettingDesc: "", // Optional description field
      EnvSettingValue, // Value is directly passed as a string
      // EnvSettingTextValue: "", // Optional, leave empty
      EnvCategory: "pharmacy_service_provider", // Default category
    });

    await envSetting.save();

    return res.status(201).json({
      success: true,
      message: "Environment setting created successfully.",
      data: envSetting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
});


// API Endpoint to update environment settings
router.post("/UpdateEnvSetting", async (req, res) => {
  try {
    const { EnvSettingCode, EnvSettingValue } = req.body;

    // Validate input
    if (!EnvSettingCode || !EnvSettingValue) {
      return res
        .json(__requestResponse("400", "Missing required fields."));
    }

    // Check for duplicate EnvSettingValue for the given EnvSettingCode
    const existingSetting = await tlbEnvSetting.findOne({
      EnvSettingCode,
      EnvSettingValue,
    });

    if (existingSetting) {
      return res
        .json(
          __requestResponse("409", "Duplicate entry detected for this asset.")
        );
    }

    // Create a new environment setting
    const envSettingData = {
      EnvSettingCode,
      // EnvSettingDesc: "", // Optional description field
      EnvSettingValue: mongoose.Types.ObjectId(EnvSettingValue), // Value is directly passed as a string
      // EnvSettingTextValue: "", // Optional, leave empty
      EnvCategory: "pharmacy_service_provider", // Default category
    };

    const newEnvSetting = await tlbEnvSetting.create(envSettingData);

    return res
      .json(
        __requestResponse(
          "200",
          "Environment setting updated successfully.",
          newEnvSetting
        )
      );
  } catch (error) {
    console.error("Error updating environment setting:", error);
    return res
      .json(
        __requestResponse(
          "500",
          "An error occurred while updating the environment setting."
        )
      );
  }
});



module.exports = router;

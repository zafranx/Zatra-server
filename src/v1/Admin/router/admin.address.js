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
} = require("../../../utils/variable");
const tlbAddress = require("../../../models/AddressMaster");
const { checkAddress } = require("../Middleware/middleaddress");
const { __CreateAuditLog } = require("../../../utils/auditlog");


// new api
router.post("/SaveAddress", checkAddress, async (req, res) => {
  const APIEndPointNo = "#KCC0004";
  try {
    const {
      address_id,
      addressLine1,
      addressLine2,
      countryId,
      stateId,
      cityId,
      Pin,
      addressTypeId,
      isCurrent,
      createdBy,
      updateBy,
      assetId,
      addressLabel,
      clientId,
      geolocation, // for latitude and longitude
    } = req.body;

    if (
      !geolocation ||
      !Array.isArray(geolocation.coordinates) ||
      geolocation.coordinates.length !== 2
    ) {
      return res.json(__requestResponse("400", "Invalid geolocation data."));
    }

    const addressData = {
      AddressLine1: addressLine1,
      AddressLine2: addressLine2,
      CountryId: countryId,
      StateId: stateId,
      CityId: cityId,
      PIN: Pin,
      AddressTypeId: addressTypeId,
      IsCurrent: isCurrent,
      CreatedBy: createdBy,
      UpdatedBy: updateBy,
      AssetId: assetId,
      AddressLabel: addressLabel,
      geolocation,
    };

    // ** If `isCurrent: true`, update other addresses to `false`**
    if (isCurrent) {
      await tlbAddress.updateMany(
        { AssetId: assetId, IsCurrent: true },
        { $set: { IsCurrent: false } }
      );
    }

    if (!address_id) {
      // **Create new address**
      const newAddress = await tlbAddress.create(addressData);
      __CreateAuditLog(
        "address_master",
        "Address.Add",
        null,
        null,
        addressData,
        newAddress._id,
        assetId,
        null
      );
      return res
        .json(
          __requestResponse("200", "Address added successfully.", newAddress)
        )
        .status(200);
    } else {
      // ** Update existing address**
      const oldRecord = await tlbAddress.findOne({ _id: address_id });
      if (!oldRecord) {
        return res.json(__requestResponse("400", "Address not found"));
      }

      await tlbAddress.updateOne({ _id: address_id }, { $set: addressData });
      __CreateAuditLog(
        "address_master",
        "Address.Edit",
        null,
        oldRecord,
        addressData,
        address_id,
        assetId,
        null
      );
      return res.json(
        __requestResponse("200", "Address updated successfully.")
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        `Error Code: ${APIEndPointNo}_0.1: ${error}`
      )
    );
  }
});

router.post("/AddressList", async (req, res) => {
  try {
    const _assetId = mongoose.Types.ObjectId.isValid(req.body.AssetId)
      ? mongoose?.Types?.ObjectId(req.body.AssetId)
      : null;

    if (!_assetId) {
      return res.json(__requestResponse("400", "Invalid Id"));
    }

    const _addressList = await tlbAddress
      .find({
        AssetId: mongoose.Types.ObjectId(_assetId),
      })
      .populate({
        path: "CountryId StateId CityId AddressTypeId",
        select: "lookup_value",
      })
      .populate({
        path: "CreatedBy UpdatedBy",
      });
    // return res.json(__requestResponse("200", __SUCCESS, _addressList));
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(_addressList).map((item) => ({
          _id: item?._id,
          AddressLine1: item?.AddressLine1,
          AddressLine2: item?.AddressLine2,
          CountryId: item?.CountryId,
          StateId: item?.StateId,
          CityId: item?.CityId,
          PIN: item?.PIN,
          AddressTypeId: item?.AddressTypeId,
          IsCurrent: item?.IsCurrent,
          CreatedBy: item?.CreatedBy,
          UpdatedBy: item?.UpdatedBy,
          AssetId: item?.AssetId,
          AddressLabel: item?.AddressLabel,
          geolocation: item?.geolocation
            ? {
                type: item?.geolocation?.type,
                coordinates: item?.geolocation?.coordinates,
              }
            : null,
          fullAddress: `${item?.AddressLine1}, ${item?.AddressLine2}, ${item?.CityId?.lookup_value}, ${item?.StateId?.lookup_value}, ${item?.CountryId?.lookup_value}, ${item?.PIN}`,
          // createdAt: item?.createdAt,
          // updatedAt: item?.updatedAt,
          createdAt: item?.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : null,
          updatedAt: item?.updatedAt
            ? new Date(item.updatedAt).toLocaleString()
            : null,
        }))
      )
    );
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});


// router.post("/SaveAddress_no_use", checkAddress, async (req, res) => {
//   APIEndPointNo = "#KCC0004";
//   try {
//     let {
//       address_id,
//       addressLine1,
//       addressLine2,
//       countryId,
//       stateId,
//       cityId,
//       Pin,
//       addressTypeId,
//       isCurrent,
//       createdBy,
//       updateBy,
//       assetId,
//       addressLabel,
//       clientId,
//     } = req.body;

//     // If isCurrent is set to true, mark other addresses for the same asset as isCurrent: false
//     if (isCurrent) {
//       await tlbAddress.updateMany(
//         { AssetId: assetId, IsCurrent: true },
//         { $set: { IsCurrent: false } }
//       );
//     }

//     if (!address_id) {
//       // Creating a new address
//       const _AddressData = {
//         AddressLine1: addressLine1,
//         AddressLine2: addressLine2,
//         CountryId: countryId,
//         StateId: stateId,
//         CityId: cityId,
//         PIN: Pin,
//         AddressTypeId: addressTypeId,
//         IsCurrent: isCurrent,
//         CreatedBy: createdBy,
//         UpdatedBy: updateBy,
//         AssetId: assetId,
//         AddressLabel: addressLabel,
//       };

//       const newAddress = await tlbAddress.create(_AddressData);
//       __CreateAuditLog(
//         "address_master",
//         "Address.Add",
//         null,
//         null,
//         _AddressData,
//         newAddress._id,
//         assetId,
//         null
//       );
//       return res
//         .status(200)
//         .json(__requestResponse("200", __SUCCESS, newAddress));
//     } else {
//       // Updating an existing address
//       const _oldrec = await tlbAddress.findOne({ _id: address_id });
//       if (!_oldrec) {
//         return res.json(__requestResponse("400", "Address not found"));
//       }

//       const _AddressData = {
//         AddressLine1: addressLine1,
//         AddressLine2: addressLine2,
//         CountryId: countryId,
//         StateId: stateId,
//         CityId: cityId,
//         PIN: Pin,
//         AddressTypeId: addressTypeId,
//         IsCurrent: isCurrent,
//         CreatedBy: createdBy,
//         UpdatedBy: updateBy,
//         AssetId: assetId,
//         AddressLabel: addressLabel,
//       };

//       const _UpdateAddress = await tlbAddress.updateOne(
//         { _id: address_id },
//         { $set: _AddressData }
//       );

//       if (_UpdateAddress.nModified > 0) {
//         __CreateAuditLog(
//           "address_master",
//           "Address.Edit",
//           null,
//           _oldrec,
//           _AddressData,
//           address_id,
//           assetId,
//           null
//         );
//         return res
//           .status(200)
//           .json(__requestResponse("200", __SUCCESS, _UpdateAddress));
//       } else {
//         return res.status(400).json(__requestResponse("400", "Update failed"));
//       }
//     }
//   } catch (error) {
//     return res
//       .status(500)
//       .json(
//         __requestResponse(
//           "400",
//           __SOME_ERROR,
//           "Error Code: " + APIEndPointNo + "_0.1:" + error
//         )
//       );
//   }
// });

router.post("/SaveAddressx", checkAddress, async (req, res) => {
  APIEndPointNo = "#KCC0004";
  try {
    let {
      address_id,
      addressLine1,
      addressLine2,
      countryId,
      stateId,
      cityId,
      Pin,
      addressTypeId,
      isCurrent,
      createdBy,
      updateBy,
      assetId,
      addressLabel,
      clientId,
    } = req.body;

    if (address_id == null || address_id == "") {
      const _AddressData = {
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        CountryId: countryId,
        StateId: stateId,
        CityId: cityId,
        PIN: Pin,
        AddressTypeId: addressTypeId,
        IsCurrent: isCurrent,
        CreatedBy: createdBy,
        UpdatedBy: updateBy,
        AssetId: assetId,
        AddressLabel: addressLabel,
      };
      await tlbAddress.create(_AddressData).then((x) => {
        __CreateAuditLog(
          "address_master",
          "Address.Add",
          null,
          null,
          _AddressData,
          x._id,
          assetId,
          null
        );
        return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
      });
    } else {
      const _oldrec = await tlbAddress.findOne({ _id: address_id });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "Address not found"));
      }
      const _AddressData = {
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        CountryId: countryId,
        StateId: stateId,
        CityId: cityId,
        PIN: Pin,
        AddressTypeId: addressTypeId,
        IsCurrent: isCurrent,
        CreatedBy: createdBy,
        UpdatedBy: updateBy,
        AssetId: assetId,
        AddressLabel: addressLabel,
      };

      const _UpdateAddress = await tlbAddress.updateOne(
        { _id: address_id },
        {
          $set: _AddressData,
        }
      );

      if (_UpdateAddress) {
        __CreateAuditLog(
          "address_master",
          "Address.Edit",
          null,
          _oldrec ? _oldrec : null,
          _AddressData,
          address_id,
          assetId,
          null
        );
        _UpdateAddress;
        return res.json(__requestResponse("200", __SUCCESS)).status(200);
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

// old api
router.post("/SaveAddress2_old", checkAddress, async (req, res) => {
  const APIEndPointNo = "#KCC0004";
  try {
    const {
      address_id,
      addressLine1,
      addressLine2,
      countryId,
      stateId,
      cityId,
      Pin,
      addressTypeId,
      isCurrent,
      createdBy,
      updateBy,
      assetId,
      addressLabel,
      clientId,
      geolocation, // for latitude and longitude
    } = req.body;

    if (
      !geolocation ||
      !Array.isArray(geolocation.coordinates) ||
      geolocation.coordinates.length !== 2
    ) {
      return res.json(__requestResponse("400", "Invalid geolocation data."));
    }

    const addressData = {
      AddressLine1: addressLine1,
      AddressLine2: addressLine2,
      CountryId: countryId,
      StateId: stateId,
      CityId: cityId,
      PIN: Pin,
      AddressTypeId: addressTypeId,
      IsCurrent: isCurrent,
      CreatedBy: createdBy,
      UpdatedBy: updateBy,
      AssetId: assetId,
      AddressLabel: addressLabel,
      geolocation,
    };

    if (!address_id) {
      // Create new address
      const newAddress = await tlbAddress.create(addressData);
      __CreateAuditLog(
        "address_master",
        "Address.Add",
        null,
        null,
        addressData,
        newAddress._id,
        assetId,
        null
      );
      return res
        .json(__requestResponse("200", __SUCCESS, newAddress))
        .status(200);
    } else {
      // Update existing address
      const oldRecord = await tlbAddress.findOne({ _id: address_id });
      if (!oldRecord) {
        return res.json(__requestResponse("400", "Address not found"));
      }

      await tlbAddress.updateOne({ _id: address_id }, { $set: addressData });
      __CreateAuditLog(
        "address_master",
        "Address.Edit",
        null,
        oldRecord,
        addressData,
        address_id,
        assetId,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS)).status(200);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        `Error Code: ${APIEndPointNo}_0.1: ${error}`
      )
    );
  }
});

module.exports = router;

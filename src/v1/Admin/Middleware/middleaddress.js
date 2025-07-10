const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const {
    __VALIDATION_ERROR,
    __SOME_ERROR,
    __DUPLICATE_ADDRESS,
    __ADDRESS_LABEL_MISSING,
} = require("../../../utils/variable");
const tlbAddress = require("../../../models/AddressMaster");
const tlbEnvSetting = require("../../../models/AdminEnvSetting");
const fetch = require("node-fetch");

const _SaveAddress = Joi.object({
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().allow(null, ""),
  countryId: Joi.string().required(),
  stateId: Joi.string().required(),
  cityId: Joi.string().required(),
  Pin: Joi.string().required(),
  addressTypeId: Joi.string().required(),
  assetId: Joi.string().required(),
  // updateBy: Joi.string().allow(null, ""),
  // createdBy: Joi.string().required(),
  addressLabel: Joi.string().allow(null, ""),
  isCurrent: Joi.boolean().allow(true, false, null),
  // clientId: Joi.string().required(),
  address_id: Joi.string().allow(null, ""),
  // geolocation: Joi.object({
  //   type: Joi.string().valid("Point").required(), // Ensures the type is always 'Point'
  //   coordinates: Joi.array()
  //     .items(Joi.number().required()) // Longitude and Latitude as numbers
  //     .length(2) // Exactly two elements: [longitude, latitude]
  //     .required(),
  // }).optional(), // Optional
  geolocation: Joi.object({
    type: Joi.string().valid("Point").required(),
    coordinates: Joi.array()
      .items(Joi.number().required())
      .length(2)
      .required(),
  }).optional(), //make it optional
});

const checkAddress = async (req, res, next) => {
  try {
    const { error, value } = _SaveAddress.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    let {
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
      address_id,
      geolocation,
    } = req.body;

    //check duplicate address types, it is not allowed to have multiple addresses
    //of same address type except "Other" address type
    let _OtherAddressType = "";
    const _EnvSetting = await tlbEnvSetting.findOne({
      EnvSettingCode: "ADDRESS_TYPE_OTHER",
    });

    if (_EnvSetting) {
      _OtherAddressType = _EnvSetting.EnvSettingValue;
    }
    // do not check duplicate address in edit mode
    if (req.body.address_id == null || req.body.address_id == "") {
      if (_OtherAddressType != addressTypeId) {
        const _addressList = await tlbAddress.findOne({
          AddressTypeId: addressTypeId,
          AssetId: assetId,
        });
        if (_addressList) {
          return res
            .json(__requestResponse("400", __DUPLICATE_ADDRESS))
            .status(400);
        }
      } else {
        if (addressLabel == null || addressLabel == "") {
          return res
            .json(__requestResponse("400", __ADDRESS_LABEL_MISSING))
            .status(400);
        }
      }
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("400", __SOME_ERROR)).status(400);
  }
};

const checkAddressx = async (req, res, next) => {
  try {
    const { error, value } = _SaveAddress.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    let {
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
      address_id,
    } = req.body;

    // Check duplicate address types
    let _OtherAddressType = "";
    const _EnvSetting = await tlbEnvSetting.findOne({
      EnvSettingCode: "ADDRESS_TYPE_OTHER",
    });

    if (_EnvSetting) {
      _OtherAddressType = _EnvSetting.EnvSettingValue;
    }

    // Duplicate address check (except in edit mode)
    if (!address_id) {
      if (_OtherAddressType !== addressTypeId) {
        const _addressList = await tlbAddress.findOne({
          AddressTypeId: addressTypeId,
          AssetId: assetId,
        });
        if (_addressList) {
          return res
            .json(__requestResponse("400", __DUPLICATE_ADDRESS))
            .status(400);
        }
      } else {
        if (!addressLabel) {
          return res
            .json(__requestResponse("400", __ADDRESS_LABEL_MISSING))
            .status(400);
        }
      }
    }

    // Fetch geolocation
    if (!addressLine1) {
      return res
        .json(__requestResponse("400", "Address line is required"))
        .status(400);
    }

    const fullAddress = `${addressLine1}, ${
      addressLine2 || ""
    }, ${cityId}, ${stateId}, ${countryId}`;
    const geoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=YOUR_GOOGLE_MAPS_API_KEY`
    );
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      const { lat, lng } = geoData.results[0].geometry.location;

      // Attach geolocation to request body
      req.body.geolocation = {
        type: "Point",
        coordinates: [lng, lat], // Longitude first, then latitude
      };
    } else {
      return res
        .json(
          __requestResponse(
            "400",
            "Geolocation not found for the given address"
          )
        )
        .status(400);
    }

    next();
  } catch (error) {
    console.error("Error in checkAddress middleware:", error);
    return res
      .json(__requestResponse("400", __SOME_ERROR, error.message || error))
      .status(400);
  }
};


module.exports = { checkAddress };

const mongoose = require("mongoose");
const { __randomNumber } = require("./constent");
const tlbEnvSetting = require("../models/AdminEnvSetting");
const tlbAssetMaster = require("../models/AssetMaster");

async function __AssetCode(AssetType) {
  let _SettingCode;
  let _SettingCodeType;
  let _AssetCode = "";
  let _AssetType;
  let _Prefix = "";
  let _recCount = 0;
  let AssetCode = "";

  switch (AssetType) {
    case "CLIENT":
      _SettingCode = "ASSET_CODE_CLIENT";
      _SettingCodeType = "ASSET_TYPE_CLIENT";
      break;
    case "DOCTOR":
      _SettingCode = "ASSET_CODE_DOCTOR";
      _SettingCodeType = "ASSET_TYPE_DOCTOR";
      break;
    case "ATTENDANT":
      _SettingCode = "ASSET_CODE_ATTENDANT";
      _SettingCodeType = "ASSET_TYPE_ATTENDANT";
      break;
    case "PATHOLOGY":
      _SettingCode = "ASSET_CODE_PATHOLOGY";
      _SettingCodeType = "ASSET_TYPE_PATHOLOGY";
      break;
    case "PHARMACY":
      _SettingCode = "ASSET_CODE_PHARMACY";
      _SettingCodeType = "ASSET_TYPE_PHARMACY";
      break;
    case "HOSPITAL":
      _SettingCode = "ASSET_CODE_HOSPITAL";
      _SettingCodeType = "ASSET_TYPE_HOSPITAL";
      break;
    case "CLIENT_USER":
      _SettingCode = "ASSET_CODE_CLIENT_USER";
      _SettingCodeType = "ASSET_TYPE_CLIENT_USER";
      break;
    case "PRIMARY_USER":
      _SettingCode = "ASSET_CODE_PRIMARY_USER";
      _SettingCodeType = "ASSET_TYPE_PRIMARY_PATIENT";
      break;
    case "SECONDARY_USER":
      _SettingCode = "ASSET_CODE_SECONDARY_USER";
      _SettingCodeType = "ASSET_TYPE_SECONDARY_PATIENT";
      break;
    case "AYUSH_CENTER":
      _SettingCode = "ASSET_CODE_AYUSH_CENTER";
      _SettingCodeType = "ASSET_TYPE_AYUSH_CENTER";
      break;
    case "PLANT_FACTORY":
      _SettingCode = "ASSET_CODE_PLANT_FACTORY";
      _SettingCodeType = "ASSET_TYPE_PLANT_FACTORY";
      break;
    case "MARKET":
      _SettingCode = "ASSET_CODE_MARKET";
      _SettingCodeType = "ASSET_TYPE_MARKET";
      break;
    case "SHOP":
      _SettingCode = "ASSET_CODE_SHOP";
      _SettingCodeType = "ASSET_TYPE_SHOP";
      break;
    case "SERVICE_ENTITIES":
      _SettingCode = "ASSET_CODE_SERVICE_ENTITIES";
      _SettingCodeType = "ASSET_TYPE_SERVICE_ENTITIES";
      break;
    case "INDUSTRY_ASSOCIATION":
      _SettingCode = "ASSET_CODE_INDUSTRY_ASSOCIATION";
      _SettingCodeType = "ASSET_TYPE_INDUSTRY_ASSOCIATION";
      break;
    case "INDUSTRY_ASSOCIATION_OFFICE_BEARERS":
      _SettingCode = "ASSET_CODE_INDUSTRY_ASSOCIATION_OFFICE_BEARERS";
      _SettingCodeType = "ASSET_TYPE_INDUSTRY_ASSOCIATION_OFFICE_BEARERS";
      break;
    case "GOVERNMENT_OFFICE":
      _SettingCode = "ASSET_CODE_GOVERNMENT_OFFICE";
      _SettingCodeType = "ASSET_TYPE_GOVERNMENT_OFFICE";
      break;
    case "GOVERNMENT_OFFICIALS":
      _SettingCode = "ASSET_CODE_GOVERNMENT_OFFICIALS";
      _SettingCodeType = "ASSET_TYPE_GOVERNMENT_OFFICIALS";
      break;
    case "GOVERNMENT_SCHEME":
      _SettingCode = "ASSET_CODE_GOVERNMENT_SCHEME";
      _SettingCodeType = "ASSET_TYPE_GOVERNMENT_SCHEME";
      break;
    case "GOVERNMENT_ARTISAN":
      _SettingCode = "ASSET_CODE_GOVERNMENT_OFFICE";
      _SettingCodeType = "ASSET_TYPE_GOVERNMENT_OFFICE";
      break;
    case "LOCAL_REPRESENTATIVES":
      _SettingCode = "ASSET_CODE_LOCAL_REPRESENTATIVES";
      _SettingCodeType = "ASSET_TYPE_LOCAL_REPRESENTATIVES";
      break;
    case "REAL_ESTATE_PROJECTS":
      _SettingCode = "ASSET_CODE_REAL_ESTATE_PROJECTS";
      _SettingCodeType = "ASSET_TYPE_REAL_ESTATE_PROJECTS";
      break;
    // case "SUPER_ADMIN":
    //   _SettingCode = "ASSET_CODE_SUPER_ADMIN";
    //   _SettingCodeType = "ASSET_TYPE_SUPER_ADMIN";
    //   break;
    // case "ADMIN":
    //   _SettingCode = "ASSET_CODE_ADMIN";
    //   _SettingCodeType = "ASSET_TYPE_ADMIN";
    //   break;
  }

  //Get Asset Code Prefix
  const _envSetting = await tlbEnvSetting.findOne({
    EnvSettingCode: _SettingCode,
  });
  if (_envSetting) {
    _Prefix = _envSetting.EnvSettingValue;
  }

  //Get the Asset Type
  const _envSetting1 = await tlbEnvSetting.findOne({
    EnvSettingCode: _SettingCodeType,
  });

  if (_envSetting1) {
    _AssetType = mongoose.Types.ObjectId(_envSetting1.EnvSettingValue);
  }

  //Get Last Asset count of asset Type
  const _clientCount = await tlbAssetMaster.count({
    AssetTypeID: _AssetType,
  });
  if (_clientCount) {
    _recCount = _clientCount;
  }

  _AssetCode = _Prefix + (_recCount + 1).toString().padStart(5, "0");

  return _AssetCode;
}

module.exports = { __AssetCode };

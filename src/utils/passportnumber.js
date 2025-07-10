// const mongoose = require("mongoose");

// const tlbPassport = require("../models/PassportNumberMaster");
// const tlbAssetMaster = require("../models/AssetMaster");
// const tlbEnvSetting = require("../models/AdminEnvSetting");
// const { __deepClone } = require("../utils/constent");

// /**
//  * Generates a passport number based on country, date of birth, blood group, and gender.
//  * The format of the passport number will be:
//  * {CENTURY_PART}{YEAR}{COUNTRY}-{BLOOD GROUP}{GENDER}{AGE GROUP}-{MONTH}{MONTH RUNNING NUMBER}
//  *
//  * @param {string} country_id - The country identifier.
//  * @param {Date} dob - The date of birth.
//  * @param {string} blood_group_id - The blood group identifier.
//  * @param {string} gender - The gender identifier [M,F,O].
//  * @returns {Promise<string>} - The generated passport number.
//  */
// async function __GetPassportNumber(country_id, dob, blood_group_id, gender) {
//     //Passport Number will be like
//     // {CENTURY_PART}{YEAR}{COUNTRY}-{BLOOD GROUP}{GENDER}{AGE GROUP}-{MONTH}{MONTH RUNNING NUMBER}

//     let _Passport_Number = "";
//     const Today = new Date();
//     const _Year = Today.getFullYear().toString().trim().substring(2, 4);
//     const _CenturyPart = Today.getFullYear().toString().trim().substring(0, 2);
//     const _Month = Today.getMonth() + 1;
//     const age_group = await GetAgeGroup(dob);

//     let mCenturyPart = "";
//     let mYear = _Year;
//     let mCountry = "";
//     let mBloodGroup = "";
//     let mGender = "";
//     let mAgeGroup = "";
//     let mMonthSegment = "";
//     let mRunningNumber = "";

//     //Get Century Part
//     const _CENTURY_PART = await tlbPassport.findOne({
//         segment_id: _CenturyPart,
//     });

//     if (_CENTURY_PART) {
//         mCenturyPart = _CENTURY_PART.segment_value;
//     }

//     //Get the Country
//     const __COUNTRY = await tlbPassport.findOne({ segment_id: country_id });
//     if (__COUNTRY) {
//         mCountry = __COUNTRY.segment_value;
//     }

//     //Get the Blood Group
//     const __BLOOD_GROUP = await tlbPassport.findOne({
//         segment_id: blood_group_id,
//     });
//     if (__BLOOD_GROUP) {
//         mBloodGroup = __BLOOD_GROUP.segment_value;
//     }

//     //Get the Gender
//     const __GENDER = await tlbPassport.findOne({
//         segment_id: gender,
//     });
//     if (__GENDER) {
//         mGender = __GENDER.segment_value;
//     }

//     //Get the Age Group
//     const __AGE_GROUP = await tlbPassport.findOne({
//         segment_id: age_group,
//     });
//     if (__AGE_GROUP) {
//         mAgeGroup = __AGE_GROUP.segment_value;
//     }

//     //Get the Month Segment
//     const _MonthName = await GetMonthName(_Month);
//     const __MONTH_SEGMENT = await tlbPassport.findOne({
//         segment_id: _MonthName,
//     });
//     if (__MONTH_SEGMENT) {
//         mMonthSegment = __MONTH_SEGMENT.segment_value;
//     }

//     //Get the running number for the month

//     //Get the Asset Type ID for Primary and Secondary Patients
//     let _PrimaryUserType;
//     let _SecondaryUserType;
//     const _env = await tlbEnvSetting.find({
//         $or: [
//             { EnvSettingCode: "ASSET_TYPE_PRIMARY_PATIENT" },
//             { EnvSettingCode: "ASSET_TYPE_SECONDARY_PATIENT" },
//         ],
//     });

//     if (_env) {
//         __deepClone(_env).map((item) => {
//             if (item.EnvSettingCode == "ASSET_TYPE_PRIMARY_PATIENT")
//                 _PrimaryUserType = item.EnvSettingValue;
//             if (item.EnvSettingCode == "ASSET_TYPE_SECONDARY_PATIENT")
//                 _SecondaryUserType = item.EnvSettingValue;
//         });
//     }

//     const _today = new Date();
//     const __RUNNING_NUM = await tlbAssetMaster.countDocuments({
//         createdAt: { $exists: true },
//         $or: [
//             { AssetTypeID: _PrimaryUserType },
//             { AssetTypeID: _SecondaryUserType },
//         ],
//         $expr: {
//             $and: [
//                 { $eq: [{ $month: "$createdAt" }, _today.getMonth() + 1] }, // Current month (1-based in MongoDB)
//                 { $eq: [{ $year: "$createdAt" }, _today.getFullYear()] }, // Current year
//             ],
//         },
//     });

//     let _RowCounter = __RUNNING_NUM || 0;

//     if (__RUNNING_NUM) {
//         //Increment it by 1 to have a new number always
//         let RunningNumber = _RowCounter + 1;

//         //Get the zero replacement indicator
//         let _Representer = "";
//         let _Counter = 1;
//         let _CompNumber = 9999;
//         while (_CompNumber - RunningNumber < 0) {
//             _Counter += 1;
//             _CompNumber += 10000;
//         }
//         //Get JUst previous number last value
//         if (_Counter > 1) {
//             _Counter -= 1;
//             _CompNumber -= 10000;
//         }
//         _Representer = GetAlphaRepresenter(_Counter, _CompNumber);
//         // console.log(_CompNumber);
//         // console.log(_Counter);
//         // console.log(_Representer);
//         mRunningNumber =
//             _Representer +
//             (RunningNumber - (_CompNumber > 9999 ? _CompNumber : 0))
//                 .toString()
//                 .padStart(5, "0");
//     }

//     // {CENTURY_PART}{YEAR}{COUNTRY}-{BLOOD GROUP}{GENDER}{AGE GROUP}-{MONTH}{MONTH RUNNING NUMBER}
//     _Passport_Number =
//         mCenturyPart +
//         mYear +
//         mCountry +
//         "-" +
//         mBloodGroup +
//         mGender +
//         mAgeGroup +
//         "-" +
//         mMonthSegment +
//         mRunningNumber;
//     return _Passport_Number;
// }
// function GetAlphaRepresenter(counter, compNumber) {
//     let _CharCode = "";
//     if (counter < 26) {
//         _CharCode = String.fromCharCode(64 + counter).padStart(2, "0");
//     } else if (counter >= 26 && counter <= 52) {
//         if (compNumber > 259999 && compNumber <= 519999) {
//             _CharCode = String.fromCharCode(64 + (counter - 26)).padStart(
//                 2,
//                 "A"
//             );
//         } else {
//             _CharCode = String.fromCharCode(64 + 26).padStart(2, "0");
//         }
//     } else if (counter > 52 && counter <= 79) {
//         if (compNumber > 519999 && compNumber <= 779999) {
//             _CharCode = String.fromCharCode(64 + (counter - 26 * 2)).padStart(
//                 2,
//                 "B"
//             );
//         }
//     }
//     return _CharCode;
// }
// function checkDate(x) {
//     let _tDate = new Date(x.createdAt);
//     const _today = new Date();

//     return (
//         _tDate.getMonth() == _today.getMonth() &&
//         _tDate.getFullYear() == _today.getFullYear()
//     );
// }

// /**
//  * Calculates the age group based on the given date of birth.
//  *
//  * @param {Date} dob - The date of birth.
//  * @returns {Promise<string>} - The age group as a string (e.g., "0-12", "18-24").
//  */
// async function GetAgeGroup(dob) {
//     let _ageGroup = "";
//     const _dob = new Date(dob);
//     const _today = new Date();

//     var d1Y = _dob.getFullYear();
//     var d2Y = _today.getFullYear();
//     var d1M = _dob.getMonth();
//     var d2M = _today.getMonth();

//     var _diff = parseInt((d2M + 12 * d2Y - (d1M + 12 * d1Y)) / 12);

//     if (_diff >= 0 && _diff <= 12) {
//         _ageGroup = "0-12";
//     }
//     if (_diff > 12 && _diff <= 17) {
//         _ageGroup = "12-17";
//     }
//     if (_diff > 17 && _diff <= 24) {
//         _ageGroup = "18-24";
//     }
//     if (_diff > 24 && _diff <= 34) {
//         _ageGroup = "25-34";
//     }
//     if (_diff > 34 && _diff <= 44) {
//         _ageGroup = "35-44";
//     }
//     if (_diff > 44 && _diff <= 54) {
//         _ageGroup = "45-54";
//     }
//     if (_diff > 54 && _diff <= 64) {
//         _ageGroup = "55-64";
//     }
//     if (_diff > 64 && _diff <= 74) {
//         _ageGroup = "65-74";
//     }
//     if (_diff > 74) {
//         _ageGroup = "75-130";
//     }
//     return _ageGroup;
// }
// /**
//  * Retrieves the abbreviated name of the month for a given month number.
//  *
//  * @param {number} month - The month number (1-12).
//  * @returns {Promise<string>} - The abbreviated month name (e.g., "Jan", "Feb").
//  */
// async function GetMonthName(month) {
//     let _MonthName = "";
//     switch (month) {
//         case 1:
//             _MonthName = "Jan";
//             break;
//         case 2:
//             _MonthName = "Feb";
//             break;
//         case 3:
//             _MonthName = "Mar";
//             break;
//         case 4:
//             _MonthName = "Apr";
//             break;
//         case 5:
//             _MonthName = "May";
//             break;
//         case 6:
//             _MonthName = "Jun";
//             break;
//         case 7:
//             _MonthName = "Jul";
//             break;
//         case 8:
//             _MonthName = "Aug";
//             break;
//         case 9:
//             _MonthName = "Sep";
//             break;
//         case 10:
//             _MonthName = "Oct";
//             break;
//         case 11:
//             _MonthName = "Nov";
//             break;
//         case 12:
//             _MonthName = "Dec";
//             break;
//     }
//     return _MonthName;
// }

// module.exports = { __GetPassportNumber };

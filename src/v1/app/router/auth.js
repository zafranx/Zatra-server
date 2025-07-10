const express = require("express");
const router = express.Router();

const {
    __requestResponse,
    __generateAuthToken,
    __deepClone,
} = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __SERVICE_NOTAVAILABLE,
    __USER_EXIST,
} = require("../../../utils/variable");

const AssetMaster = require("../../../models/AssetMaster");
const OTPTransaction = require("../../../models/OTPTransaction");
const Signup = require("../../../models/Signup");
const SignupCoverage = require("../../../models/SignupCoverage");
const LoginMaster = require("../../../models/LoginMaster");
const { __AssetCode } = require("../../../utils/assetcode");
const lookupmodel = require("../../../models/lookupmodel");
// const { __generatePassportNumber } = require("../middleware/familymiddleware");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const UserMaster = require("../../../models/UserMaster");
const { GetENV } = require("../constant");

router.post("/ShortSignUp", async (req, res) => {
    try {
        const {
            PostalCode,
            MobileNo,
            FirstName,
            LastName,
            DOB,
            Gender,
            EmailAddress,
            NatioalityID,
            isSecondaryUser = false,
            CountryCode,
        } = req.body;

        const isServiceAvailable = await SignupCoverage.findOne({
            PostalCode,
            IsActive: true,
        });

        if (!isServiceAvailable) {
            await Signup.create({
                FirstName,
                LastName,
                MobileNo,
                DOB,
                Gender,
                EmailAddress,
                PostalCode,
                Pwd: "12345",
                NatioalityID,
                CountryCode,
            });
            return res.json(__requestResponse("400", __SERVICE_NOTAVAILABLE));
        }

        const isUserAvailable = await AssetMaster.findOne({
            "User.MobileNo": MobileNo,
        });

        if (!isSecondaryUser && isUserAvailable) {
            return res.json(__requestResponse("400", __USER_EXIST));
        }

        const newUser = await Signup.create({
            FirstName,
            LastName,
            MobileNo,
            DOB,
            Gender,
            EmailAddress,
            PostalCode,
            Pwd: "12345",
            NatioalityID,
            CountryCode,
        });

        return res.json(
            __requestResponse(
                "200",
                "Thankyou for registering your account successfully with us",
                newUser
            )
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
// router.post("/FullUserSignup", async (req, res) => {
//     try {
//         const {
//             signup_id,
//             InsurancePartners,
//             PreExistingDisease,
//             pleadge_blood_donation,
//             pleadge_organ_donation,
//             AbhaNo,
//             ProfilePic,
//             BloodGroupID,
//         } = req.body;

//         const user = await Signup.findById(signup_id);
//         if (!user) {
//             return res.json(__requestResponse("400", "inValid User"));
//         }
//         user.InsurancePartners = InsurancePartners;
//         user.PreExistingDisease = PreExistingDisease;
//         user.PledgeForBlood = pleadge_blood_donation;
//         user.PledgeForOrgan = pleadge_organ_donation;
//         user.BloodGroup = BloodGroupID;
//         user.IsFirstTime = false;
//         await user.save();

//         const checkSecondary = await AssetMaster.findOne({
//             "User.MobileNo": user.MobileNo,
//         });
//         let isSecondaryUser = false;

//         if (checkSecondary) {
//             const __secondaryUser = await AdminEnvSetting.findOne({
//                 EnvSettingCode: "ASSET_TYPE_SECONDARY_PATIENT",
//             });

//             if (
//                 __deepClone(__secondaryUser)?.EnvSettingValue ==
//                 __deepClone(checkSecondary)?.AssetTypeID
//             )
//                 isSecondaryUser = true;
//         }

//         const _passportNumber = await __generatePassportNumber(
//             {
//                 CountryCodeID: user.CountryCode,
//                 DOB: user.DOB,
//                 BloodGroupID: user.BloodGroup,
//                 Gender: user.Gender,
//             },
//             res
//         );
//         if (!_passportNumber) {
//             return;
//         }
//         const newCode = await __AssetCode("PRIMARY_USER");
//         const AssetType = await lookupmodel.findOne({
//             lookup_type: "asset_type",
//             lookup_value: "Primary Patient",
//         });
//         if (!AssetType) {
//             return res.json(__requestResponse("400", "Asset Type Not Found"));
//         }
//         const dataObject = {
//             AssetTypeID: AssetType._id,
//             AssetName: [user.FirstName, user.LastName].join(" "),
//             AssetCode: newCode,
//             User: {
//                 FirstName: user.FirstName,
//                 LastName: user.LastName,
//                 AbhaNo: AbhaNo,
//                 ProfilePic: ProfilePic,
//                 DOB: user.DOB,
//                 Gender: user.Gender,
//                 BloodGroupID: user.BloodGroup,
//                 MobileNo: user.MobileNo,
//                 EmailAddress: user.EmailAddress,
//                 NationalityID: user.NatioalityID,
//                 CountryCode: user.CountryCode,
//                 pleadgeblooddonation: pleadge_blood_donation,
//                 pleadgeorgandonation: pleadge_organ_donation,
//                 PostalCode: user.PostalCode,
//             },
//         };

//         const newUser = isSecondaryUser
//             ? await AssetMaster.findByIdAndUpdate(
//                   checkSecondary._id,

//                   dataObject
//               )
//             : await AssetMaster.create(dataObject);

//         user.AssetID = newUser._id;
//         await user.save();
//         await LoginMaster.create({
//             AssetId: newUser._id,
//             AssetTypeId: newUser.AssetTypeID,
//             UserName: [user.FirstName, user.LastName].join(" "),
//             LoginId: user.MobileNo,
//             Pwd: user.Pwd,
//             IsFirstLogin: false,
//         });

//         const authToken = await __generateAuthToken(newUser);

//         return res.json(
//             __requestResponse("200", __SUCCESS, {
//                 newUser,
//                 authToken,
//             })
//         );
//     } catch (error) {
//         console.log(error);
//         return res.json(__requestResponse("500", __SOME_ERROR, error));
//     }
// });

router.post("/login", async (req, res) => {
    try {
        const { MobileNo, Password } = req.body;
        if (!MobileNo.trim()) {
            return res.json(
                __requestResponse("400", "Please Enter Mobile Number")
            );
        }
        if (!Password.trim()) {
            return res.json(
                __requestResponse("400", "Please Enter Mobile Number")
            );
        }

        const UserAssetTypeId = await GetENV("ASSET_TYPE_USER");

        const CheckUser = await LoginMaster.findOne({
            AssetTypeId: UserAssetTypeId?.EnvSettingValue,
            LoginId: MobileNo,
        }).populate({ path: "UserId" });
        console.log("CheckUser", CheckUser);
        if (CheckUser) {
            if (CheckUser.Pwd != Password) {
                return res.json(__requestResponse("400", "Invalid password"));
            }
            return res.json(
                __requestResponse("200", __SUCCESS, {
                    user: CheckUser?.UserId,
                    authToken: await __generateAuthToken(CheckUser?.UserId),
                    IsFirstTime: false,
                })
            );
        }
        return res.json(__requestResponse("400", "Invalid Phone Number"));

        // const user = await Signup.findOne(
        //     {
        //         MobileNo,
        //     },
        //     "FirstName LastName Gender MobileNo PostalCode Pwd createdAt IsFirstTime NatioalityID DOB AssetID"
        // ).populate({ path: "NatioalityID", select: "lookup_value" });

        // if (!user) {
        //     return res.json(__requestResponse("400", "User not found"));
        // }
        // const isServiceAvailable = await SignupCoverage.findOne({
        //     PostalCode: user?.PostalCode,
        //     IsActive: true,
        // });
        // if (!isServiceAvailable) {
        //     return res.json(__requestResponse("400", __SERVICE_NOTAVAILABLE));
        // }

        // if (user.Pwd != Password) {
        //     return res.json(__requestResponse("400", "Invalid password"));
        // }
        // const authToken = await __generateAuthToken(user);

        // return res.json(
        //     __requestResponse("201", __SUCCESS, {
        //         user,
        //         authToken,
        //         IsFirstTime: true,
        //     })
        // );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/check_user", async (req, res) => {
    try {
        const { LoginValue, CheckType } = req.body;
        if (CheckType == "Mobile" && !LoginValue.trim()) {
            return res.json(
                __requestResponse("400", "Please Enter Mobile Number")
            );
        } else if (CheckType == "Email" && !LoginValue.trim()) {
            return res.json(
                __requestResponse("400", "Please Enter Email Address")
            );
        }

        const user = await AssetMaster.findOne(
            CheckType == "Mobile"
                ? {
                      "User.MobileNo": LoginValue,
                  }
                : {
                      "User.EmailAddress": LoginValue,
                  },
            "-User.BloodGroupID -User.RelationshipID -User.PreExistingDisease -User.PastIllness -User.InsurancePanel"
        ).populate({ path: "ParentID" });

        if (user && user?.AssetName == "Primary User") {
            return res.json(__requestResponse("400", "User already exists"));
        }
        if (user && user?.AssetName == "Secondary Patient") {
            // Send Otp to Parent Id
        }
        await OTPTransaction.updateMany(
            { RefLogin: LoginValue },
            { IsExpired: true }
        );
        await OTPTransaction.create({
            RefLogin: LoginValue,
            // OTP: __randomNumber(),
            OTP: 1234,
        });

        const UserDetails = user ? __deepClone(user) : null;
        if (UserDetails) {
            delete UserDetails.ParentID;
        }
        return res.json(
            __requestResponse("200", __SUCCESS, {
                isSecondaryUser: UserDetails ? true : false,
                details: UserDetails,
            })
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});
router.post("/verify_user", async (req, res) => {
    try {
        const { LoginValue, OTP } = req.body;

        if (!OTP.trim()) {
            return res.json(__requestResponse("400", "Please Enter OTP"));
        }

        const checkOTP = await OTPTransaction.findOne({
            RefLogin: LoginValue,
            IsUsed: false,
            IsExpired: false,
        });
        console.log("checkOTP", checkOTP);

        if (!checkOTP) {
            return res.json(
                __requestResponse(
                    "400",
                    "Your Otp is expired. Please resend again"
                )
            );
        }
        if (checkOTP?.OTP != OTP.trim()) {
            return res.json(
                __requestResponse(
                    "400",
                    "Your Otp is invalid. Please try again"
                )
            );
        }
        await OTPTransaction.findByIdAndUpdate(checkOTP?._id, {
            IsUsed: true,
            IsExpired: true,
        });
        return res.json(__requestResponse("200", __SUCCESS));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;

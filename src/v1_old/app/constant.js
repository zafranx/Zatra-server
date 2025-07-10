const AdminEnvSetting = require("../../models/AdminEnvSetting");
// const AssetHPQuestion = require("../../models/AssetHPQuestion");
// const Favourites = require("../../models/Favourites");
// const PatientDigitalLocker = require("../../models/PatientDigitalLocker");
// const PatientMedicine = require("../../models/PatientMedicine");
// const PatientPrescription = require("../../models/PatientPrescription");

const GetENV = async (code, type) => {
    if (type == "multi") {
        const __ENV = await AdminEnvSetting.find({
            EnvSettingCode: code,
        });

        return __ENV;
    }

    const __ENV = await AdminEnvSetting.findOne({
        EnvSettingCode: code,
    });

    return __ENV;
};
// const AddFavoriteAsset = async (dataObject) => {
//     const check = await Favourites.findOne(dataObject);
//     if (check) {
//         return;
//     }
//     await Favourites.create(dataObject);
//     return;
// };
// const AddHPAnswers = async (dataObject, AH_Profile) => {
//     try {
//         const {
//             Question_ID,
//             HP_Category_ID,
//             Answers = [],
//             StringAnswers = [],
//             Options = {},
//             Index,
//         } = dataObject;
//         const { _id } = AH_Profile;

//         const check = await AssetHPQuestion.findOne({
//             HealthProfileID: _id,
//             HealthProfileCategoryID: HP_Category_ID,
//             HPQuesID: Question_ID,
//         });
//         if (check) {
//             await AssetHPQuestion.findByIdAndUpdate(check?._id, {
//                 Answers,
//                 StringAnswers,
//                 Options,
//                 Index,
//             });
//         } else {
//             await AssetHPQuestion.create({
//                 HealthProfileID: _id,
//                 HealthProfileCategoryID: HP_Category_ID,
//                 HPQuesID: Question_ID,
//                 Answers,
//                 StringAnswers,
//                 Options,
//                 Index,
//             });
//         }
//         return;
//     } catch (error) {
//         console.log(error);
//         return;
//     }
// };
// const DeleteHPAnswers = async (Question_ID, { _id }) => {
//     try {
//         const check = await AssetHPQuestion.findOne({
//             HealthProfileID: _id,
//             HPQuesID: Question_ID,
//         });
//         if (check) {
//             await AssetHPQuestion.findByIdAndDelete(check?._id);
//         }
//         return;
//     } catch (error) {
//         console.log(error);
//         return;
//     }
// };

// const AddMedicine = async (AssetID, details) => {
//     const med = await PatientMedicine.create({
//         AssetId: AssetID,
//         MedicineName: details.MedicineName,
//         ConsumptionDuration: Number(details.ConsumptionDuration),
//         ConsumptionPeriod: details.ConsumptionPeriod,
//     });
//     return med;
// };

// const AddPrescription = async (AssetID, details) => {
//     const pre = await PatientPrescription.create({
//         AssetId: AssetID,
//         PrescriptionFile: [
//             {
//                 FrontPage: details?.FrontPage || "",
//                 BackPage: details?.BackPage || "",
//             },
//         ],
//         ...(details?.PrescriptioDate && {
//             PrescriptioDate: details?.PrescriptioDate,
//         }),
//         ...(details?.HospitalId && {
//             HospitalId: details?.HospitalId,
//         }),
//         ...(details?.DoctorId && {
//             DoctorId: details?.DoctorId,
//         }),
//         ...(details?.PrescriptionSource && {
//             PrescriptionSource: details?.PrescriptionSource,
//         }),
//     });

//     const __DocTypeID = await AdminEnvSetting.findOne({
//         EnvSettingCode: "DIGI_LOCKER_PRESCRIPTION",
//     });

//     await PatientDigitalLocker.create({
//         AssetId: AssetID,
//         DigiLockerDocTypeId: __DocTypeID?.EnvSettingValue,
//         DocId: pre?._id,
//     });
//     return pre;
// };

// const Razorpay = require("razorpay");
// const Payments = require("../../models/Payments");
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const NewPaymentOrder = async (data) => {
//     try {
//         const OrderId = data?.OrderId || null;
//         const Amount = data?.Amount || null;
//         const __EnvPS = await GetENV("PAYMENT_STATUS_PROCESSING");

//         const options = {
//             amount: 100, // amount in smallest currency unit (paise for INR)
//             currency: "INR",
//             receipt: OrderId || "",
//             payment_capture: true,
//         };

//         const order = await razorpay.orders.create(options);
//         console.log(order);

//         await Payments.create({
//             OrderId,
//             TranscationId: order.id,
//             Amount,
//             PaymentStatusId: __EnvPS?.EnvSettingValue,
//         });
//         return {
//             status: 200,
//             message: "Success",
//             data: order,
//         };
//     } catch (error) {
//         return {
//             status: 500,
//             message: error.message,
//         };
//     }
// };

module.exports = {
    // AddFavoriteAsset,
    // AddHPAnswers,
    // DeleteHPAnswers,
    // AddMedicine,
    // AddPrescription,
    GetENV,
    // NewPaymentOrder,
};

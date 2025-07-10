const jwt = require("jsonwebtoken");
const { __requestResponse } = require("../../../utils/constent");
const { __TOKEN_EXPIRED } = require("../../../utils/variable");

const _jwtSecret = process.env.JWT_SECRET;

const __fetchToken = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.send(__requestResponse("401", __TOKEN_EXPIRED));
    }

    const data = jwt.verify(token, _jwtSecret);
    req.user = data.user;

    next();
  } catch (error) {
    return res.send(__requestResponse("401", __TOKEN_EXPIRED));
  }
};

// const __userValidation = async (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.json(
//             __requestResponse("406", __FIELD_ERROR, {
//                 error: errors.array(),
//             })
//         );
//     }
//     const { email, phone } = req.body;
//     try {
//         let user = await AdminUser.findOne({
//             $or: [{ email }, { phone }],
//         });
//         if (user) {
//             let error = [];
//             if (user.email == email) {
//                 error.push({
//                     value: email,
//                     msg: "Email already exist",
//                     param: "email",
//                     location: "body",
//                 });
//                 return res.json(
//                     __requestResponse("406", "Email already exist", { error })
//                 );
//             }

//             if (user.phone == phone) {
//                 error.push({
//                     value: phone,
//                     msg: "phone already exist",
//                     param: "phone",
//                     location: "body",
//                 });
//                 return res.json(
//                     __requestResponse("406", "Phone already exist", { error })
//                 );
//             }

//             return res.json(__requestResponse("406", __FIELD_ERROR, { error }));
//         }
//         next();
//     } catch (error) {
//         console.log(error);
//         res.json(__requestResponse("500", __SOME_ERROR));
//     }
// };

// const __userVerification = async (req, res, next) => {
//     try {
//         const token = req.header("auth-token");
//         if (!token) {
//             return res.send(__requestResponse("401", __TOKEN_EXPIRED));
//         }

//         const data = jwt.verify(token, _jwtSecret);

//         const user = await AdminUser.findById(data.user.id).populate({
//             path: "limit",
//         });
//         if (!user || !user.isActive) {
//             return res.send(__requestResponse("401", __NOT_AUTHORIZE));
//         }
//         if (user?.last_token != token) {
//             return res.send(__requestResponse("401", __NOT_AUTHORIZE));
//         }
//         const owner = await OwnerUser.findOne({
//             _id: user.limit.owner,
//             plan_end: { $gte: new Date() },
//         });

//         if (!owner) {
//             return res.send(__requestResponse("401", "Plan Expired"));
//         }
//         req.user = data.user;
//         next();
//     } catch (error) {
//         return res.send(__requestResponse("401", __TOKEN_EXPIRED));
//     }
// };

module.exports = {
  __fetchToken,
};

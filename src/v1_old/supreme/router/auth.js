const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const SupremeUser = require("../models/SupremeUser");

const {
    __requestResponse,
    __generateAuthToken,
} = require("../../../utils/constent");
const {
    __SOME_ERROR,
    __LOGIN_MISSMATCH,
    __SUCCESS,
} = require("../../../utils/variable");

router.get("/", (req, res) => {
    return res.json(__requestResponse("200", __SUCCESS, "v1 api working...."));
});

// router.post(
//     "/c_admin_user",
//     [__createAdminFiled, __userValidation],
//     async (req, res) => {
//         try {
//             const user = await SupremeUser.create({ ...req.body });
//             return res.json(__requestResponse("200", __CODE_SEND, user));
//         } catch (error) {
//             return res.json(__requestResponse("500", __SOME_ERROR));
//         }
//     }
// );

router.post("/l_supreme_user", async (req, res) => {
    try {
        const { user_id, password } = req.body;
        const user = await SupremeUser.findOne({
            email: user_id,
        });

        if (!user) {
            return res.json(__requestResponse("400", __LOGIN_MISSMATCH));
        }

        const passComare = await bcrypt.compare(password, user.password);
        if (!passComare) {
            return res.json(__requestResponse("400", __LOGIN_MISSMATCH));
        }

        const authtoken = await __generateAuthToken(user);

        return res.json(
            __requestResponse("200", __SUCCESS, {
                authtoken,
                user,
            })
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

module.exports = router;

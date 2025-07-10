const express = require("express");
const router = express.Router();

const { __requestResponse } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const UserMaster = require("../../../models/UserMaster");

router.post("/SaveUser", async (req, res) => {
    try {
        const {
            UserID,
            UserName,
            Gender,
            MobileNo,
            EmailAddress,
            Address,
            CityID,
            IsActive,
            UserTypeID,
        } = req.body;

        if (!UserID) {
            const newRec = await UserMaster.create({
                UserName,
                Gender,
                MobileNo,
                EmailAddress,
                Address,
                CityID,
                IsActive,
                UserTypeID,
            });
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await UserMaster.findById(UserID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await UserMaster.updateOne(
                { _id: UserID },
                {
                    $set: {
                        UserName,
                        Gender,
                        MobileNo,
                        EmailAddress,
                        Address,
                        CityID,
                        IsActive,
                        UserTypeID,
                    },
                }
            );
            return res.json(__requestResponse("200", __SUCCESS));
        }
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/UserList", async (req, res) => {
    try {
        const list = await UserMaster.find().populate([
            {
                path: "UserTypeID CityID",
                select: "lookup_value",
            },
        ]);
        return res.json(__requestResponse("200", __SUCCESS, list));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;

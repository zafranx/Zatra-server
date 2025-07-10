const jwt = require("jsonwebtoken");
const { __requestResponse } = require("../../../utils/constent");
const { __SOME_ERROR } = require("../../../utils/variable");

const __checkValidFileds = async (req, res, next) => {
    try {
        const { UserId, FromDate, ToDate, TotalAdultsPassangers, Halts } =
            req.body;

        const errorfileds = [];
        if (!FromDate) errorfileds.push("Start Date");
        if (!ToDate) errorfileds.push("To Date");
        if (!TotalAdultsPassangers) errorfileds.push("No. Adult(s) passangers");
        if (!Halts || Halts?.length == 0)
            errorfileds.push("Halts (length should by greater then 0)");

        if (errorfileds.length > 0) {
            return res.json(
                __requestResponse(
                    "400",
                    "Please (Add/Fill) " + errorfileds.join(", ")
                )
            );
        }
        next();
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
};

module.exports = {
    __checkValidFileds,
};

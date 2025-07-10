const express = require("express");
const router = express.Router();

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __NO_LOOKUP_LIST,
    __SUCCESS,
    __SOME_ERROR,
    __VALIDATION_ERROR,
} = require("../../../utils/variable");

router.post("/GenrateAbhaNumber", async (req, res) => {
    try {
        return res.json(__requestResponse("200", __SUCCESS));
    } catch (error) {
        console.log(error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

module.exports = router;

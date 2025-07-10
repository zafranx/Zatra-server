const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");

const {
    __SUCCESS,
    __SOME_ERROR,
    __DATA_404,
} = require("../../../utils/variable");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __fetchToken } = require("../middleware/authentication");

module.exports = router;

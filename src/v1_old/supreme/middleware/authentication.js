const jwt = require("jsonwebtoken");

const SupremeUser = require("../models/SupremeUser");

const { __requestResponse } = require("../../../utils/constent");
const { validationResult } = require("express-validator");
const {
  __TOKEN_EXPIRED,
  __FIELD_ERROR,
  __SOME_ERROR,
  __NOT_AUTHORIZE,
} = require("../../../utils/variable");

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

const __userValidation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(
      __requestResponse("406", __FIELD_ERROR, {
        error: errors.array(),
      })
    );
  }
  const { email } = req.body;
  try {
    let user = await SupremeUser.findOne({ email });

    if (user) {
      let error = [];
      if (user.email === email) {
        error.push({
          value: email,
          msg: "Email already exist",
          param: "email",
          location: "body",
        });
      }

      return res.json(__requestResponse("406", __FIELD_ERROR, { error }));
    }
    next();
  } catch (error) {
    console.log(error);
    res.json(__requestResponse("500", __SOME_ERROR));
  }
};

const __userVerification = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.send(__requestResponse("401", __TOKEN_EXPIRED));
    }

    const data = jwt.verify(token, _jwtSecret);

    const user = await SupremeUser.findById(data.user.id);
    if (!user) {
      return res.send(__requestResponse("400", __NOT_AUTHORIZE));
    }
    req.user = data.user;
    next();
  } catch (error) {
    return res.send(__requestResponse("401", __TOKEN_EXPIRED));
  }
};

module.exports = {
  __fetchToken,
  __userValidation,
  __userVerification,
};

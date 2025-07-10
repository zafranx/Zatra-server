const { body } = require("express-validator");

const __createAdminFiled = [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password").isLength({ min: 4 }),
];

module.exports = { __createAdminFiled };

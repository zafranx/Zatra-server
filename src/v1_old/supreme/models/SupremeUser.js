const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const CreateSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            index: 1,
        },
        password: {
            type: String,
            required: true,
            set: (password) =>
                bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        },
        profile: {
            type: String,
        },

        buff: Buffer,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("supremeDetails", CreateSchema);

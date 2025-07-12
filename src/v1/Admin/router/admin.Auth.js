const express = require("express");
const router = express.Router();

const {
  __requestResponse,
  __generateAuthToken,
  __deepClone,
} = require("../../../utils/constent");
// const {
//     __SUCCESS,
//     __SOME_ERROR,
//     __SERVICE_NOTAVAILABLE,
//     __USER_EXIST,
// } = require("../../../utils/variable");

// const AssetMaster = require("../../../models/AssetMaster");
const LoginMaster = require("../../../models/LoginMaster");
// const { __AssetCode } = require("../../../utils/assetcode");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// new login API
router.post("/login", async (req, res) => {
  try {
    const { LoginId, Password } = req.body;

    if (!LoginId?.trim()) {
      return res.json(
        __requestResponse("400", "Please provide an email or mobile number.")
      );
    }

    if (!Password?.trim()) {
      return res.json(__requestResponse("400", "Please provide a password."));
    }

    // Check in `login_master`
    const CheckUser = await LoginMaster.findOne({ LoginId }).populate({
      path: "AssetId",
      // select: "AssetName AssetTypeID Client Doctor Hospital Pharmacy Pathology",
      select: "AssetName ",
      // populate: { path: "AssetTypeID", select: "lookup_value" },
    });

    if (!CheckUser) {
      return res.json(__requestResponse("404", "User not found."));
    }

    if (CheckUser.Pwd !== Password) {
      return res.json(__requestResponse("400", "Invalid password."));
    }

    // Generate auth token
    const authToken = await __generateAuthToken(CheckUser);

    // Fetch IMAGE_PATH setting
    const __ImagePathDetails = await AdminEnvSetting.findOne({
      EnvSettingCode: "IMAGE_PATH",
    });

    const imageBasePath =
      process.env.NODE_ENV === "development"
        ? process.env.LOCAL_IMAGE_URL
        : __ImagePathDetails?.EnvSettingTextValue;

    // Check if Super Admin
    const isAdmin = CheckUser.IsAdmin === true;

    // Determine the asset type
    const assetType = isAdmin
      ? "SuperAdmin"
      : CheckUser?.AssetId?.AssetTypeID?.lookup_value || "Unknown";

    // Dynamically construct response
    const user = isAdmin
      ? {
          Role: "SuperAdmin",
          ...(CheckUser.AssetId
            ? {
                _id: CheckUser.AssetId?._id,
                AssetName: CheckUser.AssetId?.AssetName,
                AssetTypeID: CheckUser.AssetId?.AssetTypeID,
                ProfilePic: CheckUser.AssetId?.[
                  CheckUser.AssetId?.AssetTypeID?.lookup_value
                ]?.ProfilePic
                  ? `${imageBasePath}${
                      CheckUser.AssetId?.[
                        CheckUser.AssetId?.AssetTypeID?.lookup_value
                      ]?.ProfilePic
                    }`
                  : "",
                [CheckUser.AssetId?.AssetTypeID?.lookup_value]: {
                  ...CheckUser.AssetId?.[
                    CheckUser.AssetId?.AssetTypeID?.lookup_value
                  ],
                  ProfilePic: CheckUser.AssetId?.[
                    CheckUser.AssetId?.AssetTypeID?.lookup_value
                  ]?.ProfilePic
                    ? `${imageBasePath}${
                        CheckUser.AssetId?.[
                          CheckUser.AssetId?.AssetTypeID?.lookup_value
                        ]?.ProfilePic
                      }`
                    : "",
                },
              }
            : {}),
        }
      : CheckUser.AssetId
      ? {
          _id: CheckUser.AssetId?._id,
          AssetName: CheckUser.AssetId?.AssetName,
          AssetTypeID: CheckUser.AssetId?.AssetTypeID,
          ProfilePic: CheckUser.AssetId?.[
            CheckUser.AssetId?.AssetTypeID?.lookup_value
          ]?.ProfilePic
            ? `${imageBasePath}${
                CheckUser.AssetId?.[
                  CheckUser.AssetId?.AssetTypeID?.lookup_value
                ]?.ProfilePic
              }`
            : "",
          [assetType]: {
            ...CheckUser.AssetId?.[assetType],
            ProfilePic: CheckUser.AssetId?.[assetType]?.ProfilePic
              ? `${imageBasePath}${CheckUser.AssetId?.[assetType]?.ProfilePic}`
              : "",
          },
        }
      : null;

    // Prepare final response
    const response = {
      user,
      assetType,
      authToken,
      isAdmin,
    };

    return res.json(__requestResponse("200", "Login successful.", response));
  } catch (error) {
    console.error("Error in login:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

router.post("/createLogin", async (req, res) => {
  try {
    const { AssetId, AssetTypeId, LoginId, Password } = req.body;

    if (!AssetId || !AssetTypeId || !LoginId || !Password) {
      return res.json(
        __requestResponse(
          "400",
          "All fields (AssetId, AssetTypeId, LoginId, Password) are required."
        )
      );
    }

    // Check if the user already exists
    const existingLogin = await LoginMaster.findOne({ LoginId });

    if (existingLogin) {
      return res.json(__requestResponse("400", "Login ID already exists."));
    }

    // Create a new login record
    const newLogin = await LoginMaster.create({
      AssetId,
      AssetTypeId,
      LoginId,
      Pwd: Password,
      //   IsFirstLogin: true, // Mark as first login
    });

    return res.json(
      __requestResponse("200", "Login details created successfully.", newLogin)
    );
  } catch (error) {
    console.error("Error creating login details:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

router.post("/resetPassword", async (req, res) => {
  try {
    const { LoginId, NewPassword } = req.body;

    if (!LoginId || !NewPassword) {
      return res.json(
        __requestResponse("400", "LoginId and New Password are required.")
      );
    }

    // Find the user in `login_master`
    const user = await LoginMaster.findOne({ LoginId });

    if (!user) {
      return res.json(__requestResponse("404", "User not found."));
    }

    // Update password
    user.Pwd = NewPassword;
    await user.save();

    return res.json(__requestResponse("200", "Password reset successfully."));
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

router.get("/listUsers", async (req, res) => {
  try {
    const users = await LoginMaster.find()
      .populate({
        path: "AssetId",
        select:
          "AssetName AssetTypeID Client Doctor Hospital Pharmacy Pathology",
        populate: { path: "AssetTypeID", select: "lookup_value" },
      })
      .select("LoginId AssetId IsFirstLogin");

    const response = users.map((user) => ({
      LoginId: user.LoginId,
      AssetName: user.AssetId?.AssetName || "N/A",
      AssetType: user.AssetId?.AssetTypeID?.lookup_value || "Unknown",
      IsFirstLogin: user.IsFirstLogin,
    }));

    return res.json(
      __requestResponse("200", "Users fetched successfully.", response)
    );
  } catch (error) {
    console.error("Error listing users:", error);
    return res.json(__requestResponse("500", "Internal server error.", error));
  }
});

module.exports = router;

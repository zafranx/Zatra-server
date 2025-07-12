const V1 = {
  APP_ROUTE: [],
  ADMIN_ROUTE: [
    require("./v1/Admin/router/admin.lookup"),
    require("./v1/Admin/router/admin.address"),
    require("./v1/Admin/router/admin.EventMaster"),
    require("./v1/Admin/router/admin.LegalEntity"),
  ],
  COMMON_ROUTE: [
    require("./v1/Common/router/lookup"),
    require("./v1/Common/router/imageUpload"),
  ],
  // WEBSITE_ROUTE: [
  //     // require("./v1/web/router/AssetList"),
  // ],
};
module.exports = { V1 };

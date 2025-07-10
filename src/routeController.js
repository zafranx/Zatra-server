const V1 = {
  APP_ROUTE: [],
  ADMIN_ROUTE: [
    require("./v1/Admin/router/adminlookup"),
    require("./v1/Admin/router/adminEventMaster"),
    require("./v1/Admin/router/adminaddress"),
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

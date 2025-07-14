const V1 = {
  APP_ROUTE: [],
  ADMIN_ROUTE: [
    require("./v1/Admin/router/admin.lookup"),
    require("./v1/Admin/router/admin.address"),
    require("./v1/Admin/router/admin.EventMaster"),
    require("./v1/Admin/router/admin.AssetMaster"),
    require("./v1/Admin/router/admin.brandMaster"),
    require("./v1/Admin/router/admin.productMaster"),
    require("./v1/Admin/router/admin.ZatraMaster"),
    require("./v1/Admin/router/admin.DestinationMaster"),
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

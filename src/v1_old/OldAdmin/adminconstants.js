const AdminEnvSetting = require("../../models/AdminEnvSetting");
const Favourites = require("../../models/Favourites");

const GetENV = async (code, type) => {
  if (type == "multi") {
    const __ENV = await AdminEnvSetting.find({
      EnvSettingCode: code,
    });

    return __ENV;
  }

  const __ENV = await AdminEnvSetting.findOne({
    EnvSettingCode: code,
  });

  return __ENV;
};
const AddFavoriteAsset = async (dataObject) => {
  const check = await Favourites.findOne(dataObject);
  if (check) {
    return;
  }
  await Favourites.create(dataObject);
  return;
};

const NewPaymentOrder = async (data) => {
  try {
    const OrderId = data?.OrderId || null;
    const Amount = data?.Amount || null;
    const __EnvPS = await GetENV("PAYMENT_STATUS_PROCESSING");

    const options = {
      amount: 100, // amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: OrderId || "",
      payment_capture: true,
    };

    const order = await razorpay.orders.create(options);
    console.log(order);

    await Payments.create({
      OrderId,
      TranscationId: order.id,
      Amount,
      PaymentStatusId: __EnvPS?.EnvSettingValue,
    });
    return {
      status: 200,
      message: "Success",
      data: order,
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    };
  }
};

module.exports = {
  AddFavoriteAsset,
  GetENV,
  NewPaymentOrder,
};

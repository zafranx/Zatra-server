const express = require("express");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");

const Offers = require("../../../models/Offers");

router.post("/SaveOffer", async (req, res) => {
    console.log(req.body, "b");
    try {
      const {
        OffersID,
        ProductID,
        OfferBanner,
        OfferPrice,
        DiscountPercent,
        ValidTill,
        ProductMRP,
        OfferDesc,
        NeverExpire,
      } = req.body;

      if (!OffersID) {
        const newRec = await Offers.create({
          ProductID,
          OfferBanner,
          OfferPrice,
          DiscountPercent,
          ValidTill,
          ProductMRP,
          OfferDesc,
          NeverExpire,
        });
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await Offers.findById(OffersID);
        if (!oldRec)
          return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

        await Offers.updateOne(
          { _id: OffersID },
          {
            $set: {
              ProductID,
              OfferBanner,
              OfferPrice,
              DiscountPercent,
              ValidTill,
              ProductMRP,
              OfferDesc,
              NeverExpire,
            },
          }
        );
        return res.json(__requestResponse("200", __SUCCESS));
      }
    } catch (error) {
      console.log(error.message, "error message");
      return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

router.post("/OfferList", async (req, res) => {
    try {
        const list = await Offers.find().populate([
            {
                path: "ProductID",
                select: "ProductDesc",
            },
        ]);
        return res.json(__requestResponse("200", __SUCCESS, list));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;

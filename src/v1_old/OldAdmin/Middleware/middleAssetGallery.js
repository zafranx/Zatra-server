// middleware/validateAssetGallery.js
const Joi = require("joi");
const mongoose = require("mongoose");
const tlbAssetGallery = require("../../../models/AssetGallery");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");

const _SaveAssetGallery = Joi.object({
  AssetId: Joi.string().required(),
  GalleryName: Joi.string().required(),
  Data: Joi.array()
    .items(
      Joi.object({
        Content: Joi.string().required(),
        MIMEType: Joi.string().required(),
        SortOrder: Joi.number().optional(),
        ContentType: Joi.string().required(),
        ContentDesc: Joi.string().allow(null, ""),
        // PosterImage: Joi.string().allow(null, ""),
        // PosterImage: Joi.when("ContentType", {
        //   is: "Video",
        //   then: Joi.string().allow(null, "").optional(),
        //   otherwise: Joi.string().allow(null, "").optional(),
        // }),
        PosterImage: Joi.when("ContentType", {
          is: "Video",
          then: Joi.string().required(),
          otherwise: Joi.string().allow(null, ""),
        }),
      })
    )
    .optional(),
  assetGallery_id: Joi.string().allow(null, ""), //for edit
});

const checkAssetGallery = async (req, res, next) => {
  try {
    const { error } = _SaveAssetGallery.validate(req.body);
    if (error) {
      //   return res.json(
      //     __requestResponse("400", __VALIDATION_ERROR, error.details[0].message)
      //   );

      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const { AssetId, GalleryName, assetGallery_id } = req.body;

    // Check for duplicates if in add mode (not editing)
    if (!assetGallery_id) {
      const existingGallery = await tlbAssetGallery.findOne({
        AssetId: mongoose.Types.ObjectId(AssetId),
        GalleryName,
      });
      if (existingGallery) {
        return res.json(
          __requestResponse(
            "400",
            "This gallery name already exists for the given asset."
          )
        );
      }
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("400", __SOME_ERROR)).status(400);
  }
};

module.exports = { checkAssetGallery };

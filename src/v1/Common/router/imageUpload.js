const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;
const { __uploadImage, __uploadMedia } = require("../../../utils/multer");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const { __requestResponse, __deleteFile } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const { default: axios } = require("axios");

// for multiple images -old
router.post("/AddImagexxxxx", __uploadImage, async (req, res) => {
    // console.log(req.files, "files");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    try {
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.json(__requestResponse("400", "No files uploaded"));
        }

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        const uploadedImages = [];

        for (const file of req.files.file) {
            const filePath = path.resolve("./uploads/" + file.filename);

            const result = await cloudinary.uploader.upload(filePath, {
                folder: "event_images",
            });

            __deleteFile(filePath);

            uploadedImages.push({
                filename: file.filename,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            });
        }

        return res.json(__requestResponse("200", __SUCCESS, uploadedImages));
    } catch (error) {
        console.log("Cloudinary Upload Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// for image and pdf both - for pdf it will save pdf in server folder /uploads --- working API
router.post("/AddImage", __uploadImage, async (req, res) => {
    try {
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.json(__requestResponse("400", "No files uploaded"));
        }

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        const uploadedFiles = [];

        for (const file of req.files.file) {
            const filePath = path.resolve("./uploads/" + file.filename);
            const ext = path.extname(file.originalname).toLowerCase();

            if (ext === ".pdf") {
                //  Store PDF locally
                uploadedFiles.push({
                    filename: file.filename,
                    file_type: "pdf",
                    full_URL:
                        process.env.NODE_ENV === "development"
                            ? `${process.env.LOCAL_IMAGE_URL}/uploads/${file.filename}`
                            : `${__ImagePathDetails?.EnvSettingTextValue}/uploads/${file.filename}`,
                    base_URL:
                        process.env.NODE_ENV === "development"
                            ? process.env.LOCAL_IMAGE_URL
                            : __ImagePathDetails?.EnvSettingTextValue,
                });
            } else {
                // Upload image/video to Cloudinary
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: "event_assets", // You can change to "event_images" or "event_videos" based on `file.mimetype`
                    resource_type: "auto",
                });

                __deleteFile(filePath); // cleanup local copy

                uploadedFiles.push({
                    filename: file.filename,
                    file_type: file.mimetype.startsWith("video/")
                        ? "video"
                        : "image",
                    public_id: result.public_id,
                    full_URL: result.secure_url,
                    base_URL:
                        process.env.NODE_ENV === "development"
                            ? process.env.LOCAL_IMAGE_URL
                            : __ImagePathDetails?.EnvSettingTextValue,
                });
            }
        }

        return res.json(__requestResponse("200", __SUCCESS, uploadedFiles));
    } catch (error) {
        console.error("Upload Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// not working
router.post("/AddImage2", __uploadMedia, async (req, res) => {
    try {
        const files = req.files?.file;

        if (!files || files.length === 0) {
            return res.json(__requestResponse("400", "No files uploaded"));
        }

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        const uploadedMedia = [];

        for (const file of req.files.file) {
            const filePath = path.resolve("./uploads/" + file.filename);

            // Detect resource type
            let resourceType = "auto";
            if (file.mimetype === "application/pdf") {
                resourceType = "raw";
            }

            const result = await cloudinary.uploader.upload(filePath, {
                folder: "tripexplore_docs",
                resource_type: "auto",
            });

            __deleteFile(filePath);

            uploadedMedia.push({
                filename: file.originalname,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            });
        }

        return res.json(__requestResponse("200", __SUCCESS, uploadedMedia));
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// for image and pdf both --not working
router.post("/AddImage_Or_Doc", __uploadImage, async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    try {
        // Check if files are uploaded
        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.json(__requestResponse("400", "No files uploaded"));
        }

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        const uploadedImages = [];

        for (const file of req.files.file) {
            const filePath = path.resolve("./uploads/" + file.filename);

            // Determine resource_type based on MIME type
            let resourceType = "image"; // default to image

            if (file.mimetype === "application/pdf") {
                resourceType = "raw"; // use raw for PDFs
            }

            const result = await cloudinary.uploader.upload(filePath, {
                folder: "tripexplore_docs",
                resource_type: resourceType,
            });

            // Delete local uploaded file
            __deleteFile(filePath);

            uploadedImages.push({
                filename: file.filename,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            });
        }

        return res.json(
            __requestResponse("200", "Upload successful", uploadedImages)
        );
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        return res.json(
            __requestResponse("500", "Internal server error during upload")
        );
    }
});
// no use
router.post("/AddImage_with_limit", __uploadImage, async (req, res) => {
    console.log(req.files, "files");

    try {
        const MAX_FILES = 5;
        const ALLOWED_TYPES = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        const MAX_SIZE_MB = 5;

        if (!req.files || !req.files.file || req.files.file.length === 0) {
            return res.json(__requestResponse("400", "No files uploaded"));
        }

        // Limit number of files
        if (req.files.file.length > MAX_FILES) {
            return res.json(
                __requestResponse(
                    "400",
                    `Only ${MAX_FILES} images allowed at a time`
                )
            );
        }

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        const uploadedImages = [];

        for (const file of req.files.file) {
            // File type validation
            if (!ALLOWED_TYPES.includes(file.mimetype)) {
                return res.json(
                    __requestResponse(
                        "400",
                        `Invalid file type: ${file.originalname}`
                    )
                );
            }

            // File size validation (in bytes)
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_SIZE_MB) {
                return res.json(
                    __requestResponse(
                        "400",
                        `File size exceeds ${MAX_SIZE_MB}MB limit: ${file.originalname}`
                    )
                );
            }

            const filePath = path.resolve("./uploads/" + file.filename);

            const result = await cloudinary.uploader.upload(filePath, {
                folder: "product_images",
            });

            __deleteFile(filePath);

            uploadedImages.push({
                filename: file.filename,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            });
        }

        return res.json(__requestResponse("200", __SUCCESS, uploadedImages));
    } catch (error) {
        console.log("Cloudinary Upload Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// Upload Image to Cloudinary --no use
router.post("/AddImage_single", __uploadImage, async (req, res) => {
    try {
        const filePath = path.resolve(
            "./" + "uploads/" + req.files.file[0].filename
        );

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "kccbucket",
        });

        __deleteFile(filePath);

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });

        return res.json(
            __requestResponse("200", __SUCCESS, {
                filename: req.files.file[0].filename,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            })
        );
    } catch (error) {
        console.log(error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// Upload Contract File to Cloudinary
router.post("/AddContract", __uploadImage, async (req, res) => {
    try {
        const filePath = path.resolve(
            "./" + "uploads/" + req.files.file[0].filename
        );

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "kcc-contract",
        });

        __deleteFile(filePath);

        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "FILE_PATH",
        });

        return res.json(
            __requestResponse("200", __SUCCESS, {
                filename: req.files.file[0].filename,
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL: __ImagePathDetails?.EnvSettingTextValue,
            })
        );
    } catch (error) {
        console.log(error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// not working
router.get("/RenderDocx/:filename", async (req, res) => {
    const { filename } = req.params;

    // Cloudinary base URL (adjust as per your actual path structure)
    const fullURL = `https://res.cloudinary.com/dirwzvugj/raw/upload/tripexplore_docs/${filename}`;

    try {
        const response = await axios({
            url: fullURL,
            method: "GET",
            responseType: "stream",
        });

        // Set appropriate headers to display the PDF inline
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=" + filename);
        console.warn(response);
        // Pipe the Cloudinary PDF stream to the response
        response.data.pipe(res);
    } catch (error) {
        console.error("Cloudinary Fetch Error:", error?.message || error);
        return res.json({
            response: {
                response_code: "500",
                response_message: "Failed to fetch PDF from Cloudinary",
            },
        });
    }
});

// for pdf rendering from /uploads folder
router.get("/RenderDoc/uploads/:filename", async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.resolve("./uploads", filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                response: {
                    response_code: "404",
                    response_message: "File not found",
                },
            });
        }

        // Set content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".pdf": "application/pdf",
            ".mp4": "video/mp4",
        };

        res.setHeader(
            "Content-Type",
            mimeTypes[ext] || "application/octet-stream"
        );
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error("Render Error:", error);
        res.status(500).json({
            response: {
                response_code: "500",
                response_message: "Failed to render file",
            },
        });
    }
});
const QRCode = require("qrcode");
const Jimp = require("jimp");
router.get("/GenrateQrCode/:id", async (req, res) => {
    try {
        // http://localhost:8012/api/v1/common/GenrateQrCode/68a83ee3544ccaa184bc2d18
        const { id } = req.params;
        const qrBuffer = await QRCode.toBuffer(id, {
            errorCorrectionLevel: "H",
            type: "png",
            width: 400,
            margin: 1,
            color: {
                dark: "#ffffffff", // QR code color
                light: "#d60d2f", // transparent background
            },
        });
        const baseImagePath = path.resolve("./uploads/qrbg.jpeg");
        const outputPath = "uploads/qr_" + id + ".png";

        // 2. Load base image & QR image
        const baseImage = await Jimp.read(baseImagePath);
        const qrImage = await Jimp.read(qrBuffer);

        // 3. Resize QR code to fit (adjust size as per template)
        qrImage.resize(490, 490); // set size as needed

        // 4. Composite QR code on top of base image
        // Example coordinates → (x, y) adjust until it aligns
        baseImage.composite(qrImage, 320, 555);

        // 5. Save output
        await baseImage.writeAsync(outputPath);

        console.log(
            "✅ QR code generated and placed successfully:",
            outputPath
        );
        const __ImagePathDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: "IMAGE_PATH",
        });
        const filePath = path.resolve("./" + outputPath);

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "qr",
            resource_type: "auto",
        });
        __deleteFile(filePath);
        return res.json(
            __requestResponse("200", __SUCCESS, {
                public_id: result.public_id,
                full_URL: result.secure_url,
                base_URL:
                    process.env.NODE_ENV === "development"
                        ? process.env.LOCAL_IMAGE_URL
                        : __ImagePathDetails?.EnvSettingTextValue,
            })
        );
    } catch (error) {
        console.error("Upload Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();

// const { __requestResponse, __deleteFile } = require("../../../utils/constent");
// const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");

// const {
//     S3Client,
//     GetObjectCommand,
//     PutObjectCommand,
// } = require("@aws-sdk/client-s3");

// const s3Client = new S3Client({
//     region: "ap-south-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY,
//         secretAccessKey: process.env.AWS_SECRET_KEY,
//     },
// });
// const path = require("path");

// const fs = require("fs");
// const { __uploadImage } = require("../../../utils/multer");

// async function putObjectUrl(filename, contentType, file, bucket) {
//     return new Promise((resolve, reject) => {
//         fs.readFile(file, async (err, data) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             const command = new PutObjectCommand({
//                 Bucket: bucket,
//                 Key: filename,
//                 Body: data,
//                 ContentType: contentType,
//             });
//             try {
//                 const response = await s3Client.send(command);
//                 resolve(response);
//             } catch (error) {
//                 reject(error);
//             }
//         });
//     });
// }
// async function getObjectUrl(key, bucket) {
//     const command = new GetObjectCommand({
//         Bucket: bucket,
//         Key: key,
//     });
//     const url = await s3Client.send(command);
//     return url.Body;
// }
// const { Readable } = require("stream");
// const AdminEnvSetting = require("../../../models/AdminEnvSetting");

// router.post("/AddImage", __uploadImage, async (req, res) => {
//     try {
//         console.log("req.files", req.files);
//         const filePath = path.resolve(
//             "./" + "uploads/" + req.files.file[0].filename
//         );
//         await putObjectUrl(
//             req.files.file[0].filename,
//             req.files.file[0].mimetype,
//             filePath,
//             "kccbucket"
//         );
//         __deleteFile(filePath);

//         const __ImagePathDetails = await AdminEnvSetting.findOne({
//             EnvSettingCode: "IMAGE_PATH",
//         });
//         return res.json(
//             __requestResponse("200", __SUCCESS, {
//                 filename: req.files.file[0].filename,
//                 full_URL:
//                     (process.env.NODE_ENV == "development"
//                         ? process.env.LOCAL_IMAGE_URL
//                         : __ImagePathDetails?.EnvSettingTextValue) +
//                     req.files.file[0].filename,
//                 base_URL: __ImagePathDetails?.EnvSettingTextValue,
//             })
//         );
//     } catch (error) {
//         console.log(error.message);
//         return res.json(__requestResponse("500", __SOME_ERROR));
//     }
// });
// router.get("/RenderImage/:filename", async (req, res) => {
//     const filename = req.params.filename;

//     try {
//         let url = await getObjectUrl(filename, "kccbucket");
//         const pdfStream = Readable.from(url);
//         pdfStream.pipe(res);
//     } catch (error) {
//         if (error.Code == "NoSuchKey") {
//             return res.json(__requestResponse("500", "File not found"));
//         }
//         return res.json(__requestResponse("500", "Failed to download file"));
//     }
// });
// router.post("/AddContract", __uploadImage, async (req, res) => {
//     try {
//         const filePath = path.resolve(
//             "./" + "uploads/" + req.files.file[0].filename
//         );
//         await putObjectUrl(
//             req.files.file[0].filename,
//             req.files.file[0].mimetype,
//             filePath,
//             "kcc-contract"
//         );
//         __deleteFile(filePath);

//         const __ImagePathDetails = await AdminEnvSetting.findOne({
//             EnvSettingCode: "FILE_PATH",
//         });
//         return res.json(
//             __requestResponse("200", __SUCCESS, {
//                 filename: req.files.file[0].filename,
//                 full_URL:
//                     __ImagePathDetails?.EnvSettingTextValue +
//                     req.files.file[0].filename,
//                 base_URL: __ImagePathDetails?.EnvSettingTextValue,
//             })
//         );
//     } catch (error) {
//         console.log(error.message);
//         return res.json(__requestResponse("500", __SOME_ERROR));
//     }
// });
// router.get("/RenderContract/:filename", async (req, res) => {
//     const filename = req.params.filename;

//     try {
//         let url = await getObjectUrl(filename, "kcc-contract");
//         const pdfStream = Readable.from(url);
//         pdfStream.pipe(res);
//     } catch (error) {
//         console.log(error);
//         if (error.Code == "NoSuchKey") {
//             return res.json(__requestResponse("500", "File not found"));
//         }
//         return res.json(__requestResponse("500", "Failed to download file"));
//     }
// });

// module.exports = router;

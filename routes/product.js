const { Product } = require("../models/product");
const mongoose = require("mongoose");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// var upload = multer({ storage: storage }).array("file");

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `shopper-product-image-${Date.now()}.jpeg`);
      },
      ContentType: "image/jpeg",
    }),
  });

router.get("/", async (req, res) => {
  try {
    let products = await Product.find().select([
      "-createdAt",
      "-updatedAt",
      "-__v",
    ]);
    if (products) {
      res.status(200).json({ success: true, products });
    }
  } catch (error) {
    // res.status(400).json({ success: false, err });
  }
});

router.post("/newproduct", async (req, res) => {
  const product = new Product({
    pname: req.body.pname,
    description: req.body.description,
    price: req.body.price,
    numberInStock: req.body.numberInStock,
    tag: req.body.tag,
    category: req.body.category,
    images: req.body.images,
    promotions: req.body.promotions,
    top: req.body.top,
  });

  product.save();

  let products = await Product.find();
  if (products) {
    res.status(200).json({ success: true, products });
  }
});

router.get("/deals", async (req, res) => {
  const deals = await Product.find({ promotions: true }).select([
    "-createdAt",
    "-updatedAt",
    "-__v",
  ]);
  res.status(200).json({ success: true, deals });
});

router.get("/couples", async (req, res) => {
  const couples = await Product.find({ category: "Couples" });
  res.status(200).json({ success: true, couples });
});
router.get("/scriptures", async (req, res) => {
  const scriptures = await Product.find({ category: "Scriptures" });
  res.status(200).json({ success: true, scriptures });
});
router.get("/ladies", async (req, res) => {
  const ladies = await Product.find({ category: "Ladies" });
  res.status(200).json({ success: true, ladies });
});
router.get("/men", async (req, res) => {
  const men = await Product.find({ category: "" });
  res.status(200).json({ success: true, men });
});
router.get("/vogue", async (req, res) => {
  const vogue = await Product.find({ category: "Vogue" });
  res.status(200).json({ success: true, vogue });
});
router.get("/best", async (req, res) => {
  const best = await Product.find({ top: true });
  res.status(200).json({ success: true, best });
});

// if (!req.body) return res.status(402).send("Enter valid details");
// if (!req.file) return res.status(402).send("Enter valid details");
// const pname = req.body.pname;
// const description = req.body.description;
// const price = req.body.price;
// const tag = req.body.tag;
// const category = req.body.category;
// const images = req.file;

// try {
//   const user = await new Product({
//     pname: pname,
//     description: description,
//     price: price,
//     tag: tag,
//     category: category,
//     images: images,
//   });
//   user.save();
// } catch (error) {
//   res.status(400).send("error occured");
// }

// res.send(user).status(200).json();
// });

router.get("/product_number", (req, res) => {
  let type = req.query.type;
  let productIds = req.query.id;

  //we need to find the product information that belong to product Id
  Product.find({ _id: { $in: productIds } }).exec((err, product) => {
    if (err) return; // res.status(400).send(err);
    return res.status(200).send(product);
  });
});

router.post("/uploadImage", (req, res) => {
  const uploadSingle = upload("shopper-io-bucket").array("file");

  // upload(req, res, (err) => {
  //   if (err) {
  //     return res.json({ success: false, err });
  //   }

  //   let image = [];
  //   res.req.files.map((item) => {
  //     image.push(item.path);
  //   });

  //   return res.json(image);
  // });

  uploadSingle(req, res, async (err) => {
    if (err) return res.json({ success: false, err });

    let images = [];
    req.files.map(item => {
      images.push(item.location)
    })
    res.status(200).send(images);
  });
});

module.exports = router;

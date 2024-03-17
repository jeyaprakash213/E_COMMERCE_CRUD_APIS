const { Product, userModel } = require('./model');
const securePin = require("secure-pin");
const userController = require('./users');

module.exports = {
    getById: function (req, res, next) {
        let productQuery = {};
        productQuery._id = req.body._id;
        Product.findOne(productQuery, function (err, productInfo) {
            if (!productInfo) {
                res.status(200).send({
                    message: "No product detail found!!!",
                });
            } else {
                res.status(200).send({
                    message: "product detail found!!!",
                    data: { product: productInfo },
                });
            }
        });
    },
    getAll: function (req, res, next) {
        let productQuery = {};
        productQuery.createBy = req.body.createBy;
        Product.find(productQuery, function (err, Products) {
            console.log("jjjjjjjjj", Products)
            if (err) {
                next(err);
            } else {
                res.status(200).send({
                    message: "Products list found!!!",
                    data: { Products: Products },
                });
            }
        });
    },
    updateById: function (req, res, next) {
        let productQuery = {};
        productQuery._id = req.body._id;
        Product.findOne(productQuery, function (err, productInfo) {
            if (err) {
                res.status(404).send({ message: "productInfo Not Found!!!" });
            } else {
                const product = {};
                product.productName = req.body.productName;
                product.description = req.body.description;
                product.category = req.body.category;
                product.oldPrice = req.body.oldPrice;
                product.newPrice = req.body.newPrice;
                product.deliveryAmount = req.body.deliveryAmount;
                product.imageUrl = req.body.imageUrl;
                product.clientId = req.body.clientId;
                product.createBy = req.body.createBy;
                product.vendorId = req.body.vendorId;
                product.startDate = new Date(req.body.startDate);
                console.log(product.startDate)
                if (product.startDate) {
                    let edata = new Date(req.body.startDate).setDate(new Date(req.body.startDate).getDate() + 7)
                    product.expiryDate = new Date(edata);
                }
                if (product.deliveryAmount >= "100") {
                    product.freeDelivery = "enabled"
                } else {
                    product.freeDelivery = "Not enabled"
                }
                console.log(product.startDate, product.expiryDate)
                Product.findOneAndUpdate(productQuery, product, function (err, productInfo) {
                    if (err) next(err);
                    else {
                        res.status(200).send({ message: "product updated successfully!!!" });
                    }
                });
            }
        });
    },
    deleteById: function (req, res, next) {
        let productQuery = {};
        productQuery._id = req.body._id;
        Product.findOneAndRemove(productQuery, function (err, productInfo) {
            if (err) next(err);
            else {
                res.status(200).send({ message: "product deleted successfully!!!" });
            }
        });
    },
    create: async function (req, res, next) {
        Product.findOne(
            { imageUrl: req.body.imageUrl },
            async function (err, productInfo) {
                console.log(productInfo, "productInfo");
                if (!productInfo && req.body.role !== "4") {
                    const product = {};
                    product.productName = req.body.productName;
                    product.description = req.body.description;
                    product.category = req.body.category;
                    product.oldPrice = req.body.oldPrice;
                    product.newPrice = req.body.newPrice;
                    product.deliveryAmount = req.body.deliveryAmount;
                    product.imageUrl = req.body.imageUrl;
                    product.clientId = req.body.clientId;
                    product.createBy = req.body.createBy;
                    product.vendorId = req.body.vendorId;
                    product.startDate = new Date(req.body.startDate);
                    console.log(product.startDate)

                    if (product.vendorId) {
                        let vendorInfo = await userModel.findOne({ cognitoSub: product.vendorId });
                        console.log("vendorInfo", vendorInfo)
                        product.vendorData = await vendorInfo
                    }


                    if (product.startDate) {
                        let edata = new Date(req.body.startDate).setDate(new Date(req.body.startDate).getDate() + 7)
                        product.expiryDate = new Date(edata);
                    }

                    console.log(product.startDate, product.expiryDate)

                    if (product.deliveryAmount >= "100") {
                        product.freeDelivery = "enabled"
                    } else {
                        product.freeDelivery = "Not enabled"
                    }
                    Product.create(product, function (err, result) {
                        if (err) next(err);
                        else
                            res.status(200).send({ message: "product added successfully!!!" });
                    });
                } else if (req.body.role == "4") {
                    res.status(422).send({ message: "Users can't create the product" });
                }
                else {
                    res.status(422).send({ message: "product already exists" });
                }
            }
        );
    },
};
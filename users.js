// const userModel = require("./model");
const { Product, userModel } = require('./model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    create: function (req, res, next) {
        // console.log("req", req)
        userModel.findOne(
            { email: req.body.email, phone: req.body.phone },
            function (err, userInfo) {
                if (!userInfo && req.body.role !== "2") {
                    let user = {};
                    user.name = req.body.name;
                    user.role = req.body.role;
                    user.email = req.body.email;
                    user.phone = req.body.phone;
                    user.password = req.body.password;
                    user.cognitoSub = uuidv4();
                    if (req.body.role !== "1") {
                        if (req.body.cognitoSub) {
                            user.clientId = req.body.cognitoSub
                        } else {
                            res.status(422).send({ message: "Admin cognitoSub needed" });
                        }

                    }
                    userModel.create(user, function (err, result) {
                        if (err) next(err);
                        else
                            res.status(200).send({ message: "User added successfully!!!" });
                    });
                } else if (req.body.role == "2") {
                    res.status(422).send({ message: "Staff Only Admin can created" });
                } else {
                    res
                        .status(422)
                        .send({ message: "Email or phone number already exists" });
                }
            }
        );
    },
    authenticate: function (req, res, next) {
        userModel.findOne({ email: req.body.email }, function (err, userInfo) {
            console.log("user", userInfo);
            if (err) {
                next(err);
            } else {
                if (bcrypt.compareSync(req.body.password, userInfo.password)) {
                    const token = jwt.sign(
                        { cognitoSub: userInfo.cognitoSub },
                        req.app.get("secretKey"),
                        { expiresIn: "1h" }
                    );
                    res
                        .status(200)
                        .send({
                            message: "Loggedin succesfully!!!",
                            data: { user: userInfo, token: token },
                        });
                } else {
                    res.status(422).send({ message: "Invalid email/password!!!" });
                }
            }
        });
    },
    getById: function (req, res, next) {
        let userQuery = {};
        userQuery.cognitoSub = req.body.cognitoSub;
        userModel.findOne(userQuery, function (err, userInfo) {
            if (!userInfo) {
                res.status(200).send({
                    message: "No product detail found!!!",
                });
            } else {
                res.status(200).send({
                    message: "product detail found!!!",
                    data: { userInfo: userInfo },
                });
            }
        });
    },
    updateById: function (req, res, next) {
        let userQuery = {};
        userQuery._id = req.body._id;
        userModel.findByIdAndUpdate(userQuery, req.body, function (err, userInfo) {
            if (!userInfo) {
                res.status(200).send({
                    message: "No user detail found!!!",
                });
            } else {
                res.status(200).send({
                    message: "updated user detail !!!",
                    data: { userInfo: userInfo },
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
                res.status(200).send({ message: "user deleted successfully!!!" });
            }
        });
    },
};
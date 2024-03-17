const express = require('express');
const connectDB = require('./db');
const userController = require('./users');
const productController = require('./product');
const { Product, userModel } = require('./model');
const paginations = require('./pagination');
const app = express();
var jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 3000;


// Connect to MongoDB
connectDB();

// jwt secret token
app.set("secretKey", "nodeRestApi");

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// signup && login
app.post('/register', userController.create);
app.post('/authenticate', userController.authenticate);
app.get('/userData', userController.getById);
app.put("/userUpdate", userController.updateById);
app.delete("/Deleteuser", userController.deleteById);

// product crud
app.get("/", productController.getAll);
app.post("/product", productController.create);
app.get("/productId", productController.getById);
app.put("/productId", productController.updateById);
app.delete("/productId", productController.deleteById);

// admin access
app.post('/admin/staff', async function (req, res, next) {
    // console.log("req", req)
    userModel.findOne(
        { email: req.body.email, phone: req.body.phone },
        async function (err, userInfo) {
            if (!userInfo) {
                let user = {};
                user.name = req.body.name;
                user.role = req.body.role;
                user.email = req.body.email;
                user.phone = req.body.phone;
                user.password = req.body.password;
                user.cognitoSub = uuidv4();
                user.vendorId = req.body.vendorId;
                if (user.vendorId) {
                    let vendorInfo = await userModel.findOne({ cognitoSub: user.vendorId });
                    console.log("vendorInfo", vendorInfo)
                    user.vendorData = await vendorInfo
                }

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
            } else {
                res
                    .status(422)
                    .send({ message: "Email or phone number already exists" });
            }
        }
    );
});

app.get('/admin/allusers', (req, res) => {
    userModel.find({ clientId: req.body.cognitoSub }, (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(products)
        res.status(200).json(products);
    });
});

app.get('/admin/allProduct', (req, res) => {
    Product.find({ clientId: req.body.cognitoSub }, (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log(products)
        res.status(200).json(products);
    });
});


// Staff access
app.get('/Staff/VendorData', (req, res) => {
    userModel.find({ cognitoSub: req.body.cognitoSub }, (err, staffs) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log(staffs)
        Product.find({ createBy: staffs.vendorId }, (err, products) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            console.log(products)
            res.status(200).json(products);
        });
        // res.status(200).json(products);
    });
});

// Vendor access 
app.get('/Vendor/product', (req, res) => {
    Product.find({ createBy: req.body.createBy }, (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log(products)
        res.status(200).json(products);
    });
});

// User access
app.get('/user/products', (req, res) => {
    Product.find({}, (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const formattedProducts = products.map(product => {
            const discountPercentage = ((product.oldPrice - product.newPrice) / product.oldPrice) * 100;
            const discountAmount = product.oldPrice - product.newPrice;

            return {
                _id: product._id,
                productName: product.productName,
                vendorData: product.vendorData,
                expiryDate: product.expiryDate,
                discount: {
                    percentage: discountPercentage.toFixed(2),
                    discountAmount: discountAmount.toFixed(2)
                }
            };
        });
        console.log(formattedProducts)
        res.status(200).json(formattedProducts);
    });
});

// paginations
app.get("/api/products/search", paginations.pages);



// Server start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
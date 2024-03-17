const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//Define a schema
// role {1:admin, 2:staff, 3:Vendor , 4:user}

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cognitoSub: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
    },
    vendorId: {
        type: String,
    },
    vendorData: {
        type: Object,
    },
});


const ProductSchema = new Schema({
    vendorId: {
        type: String,
        required: true,
    },
    vendorData: {
        type: Object,
    },
    productName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    startDate: Date,
    expiryDate: Date,
    deliveryAmount: {
        type: Number,
        required: true,
    },
    oldPrice: {
        type: Number,
        required: true,
    },
    newPrice: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    freeDelivery: {
        type: String,
    },
    clientId: {
        type: String,
        required: true,
    },
    createBy: {
        type: String,
        required: true,
    }
});

// hash user password before saving into database
UserSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});

const Product = mongoose.model('Product', ProductSchema);
const userModel = mongoose.model('Euser', UserSchema);

module.exports = { Product, userModel };
// module.exports = mongoose.model('User', UserSchema);
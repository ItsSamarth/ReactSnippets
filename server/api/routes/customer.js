const express = require("express");
const router = express.Router();
const CustomerController = require('../controller/customer');
const multer = require('multer');
const checkAuth = require('../middleware/check-authentication');
const validateCustomer = require('../middleware/validate-customer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Profile Image must be a Jpg, Jpeg, Png image only.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});



//GET ALL CUSTOMERS DETAILS
router.get("/", checkAuth, CustomerController.customer_get_all);

//GET SINGLE CUSTOMER DETAILS
router.get("/:id", checkAuth, CustomerController.customer_get);

//ADD CUSTOMER TO DB
router.post("/add", checkAuth, upload.single('profile_image'), validateCustomer, CustomerController.customer_add);


module.exports = router;
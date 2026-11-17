const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.param("id", (req, res, next, id) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
        return next(new ExpressError(404, "Listing not found."));
    }
    next();
});

router.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createForm)
);


//New Route
router.get("/new",
    isLoggedIn,
    listingController.renderNewForm,
    (req,res)=>{
    res.render("listings/new.ejs");
});

router.route("/:id")
.get(wrapAsync(listingController.showForm))
.put(isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateForm ))
.put(isLoggedIn,
     isOwner,
     validateListing, wrapAsync(listingController.updateForm ))
.delete(isLoggedIn,
         isOwner,
         wrapAsync(listingController.deleteForm ));


//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.editForm));








module.exports = router;
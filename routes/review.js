const express = require("express");
const router = express.Router({mergeParams : true});
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const{validateReview,isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");



// const validateReview = (req, res, next) => {
//     console.log("Content-Type:", req.headers["content-type"]);
//     console.log("REQUEST BODY:", req.body);

//     const { error } = reviewSchema.validate(req.body || {});

//     if (error) {
//         const errMsg = error.details.map((el) => el.message).join(", ");
//         throw new ExpressError(400, errMsg);
//     }

//     next();
// };




// Reviews
// Post route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.postReview));


//Reviews
//Delete route

router.delete(
    "/:reviewId",
     isLoggedIn,
     isReviewAuthor,
     wrapAsync(reviewController.deleteReview));

module.exports = router;
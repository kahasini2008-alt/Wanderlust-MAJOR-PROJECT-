const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
    title: Joi.string().required(), 
    description: Joi.string().required(), 
    location: Joi.string().required(), 
    country: Joi.string().required(), 
    price: Joi.number().required().min(0), 
    category: Joi.string().valid(
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Swimming",
        "Camping",
        "Farms",
        "Arctic",
        "Boats",
        "Domes"
    ).required(),
    image: Joi.alternatives().try(
        Joi.string().allow("", null),
        Joi.object({
            url: Joi.string().allow("", null),
        })
    ),
    })
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
    rating : Joi.number().required().min(1).max(5).messages({
        "number.min": "review rating must lie in range of 1 to 5",
        "number.max": "review rating must lie in range of 1 to 5",
    }),
    comment: Joi.string().required(),
    }).required(),
}).required()
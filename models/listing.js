const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const defaultImageUrl = "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";
const Review = require("./review.js");

const imageSchema = new Schema({
    filename: { type: String, default: "listingimage" },
    url: {
        type: String,
        default: defaultImageUrl,
        set: (value) => value === "" ? defaultImageUrl : value,
    },
}, { _id: false });

const listingSchema = new Schema({
    title: { 
        type: String,
         required: true
     },
     description: String,

    image: { type: imageSchema, default: () => ({}) },
    price: { type: Number, required: true },
    location: String,
    country: String,
    reviews:[
        {
        type: Schema.Types.ObjectId,
        ref: "Review",
       } ,
],
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    geometry  :{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },
  category:{
    type: String,
    enum:["Trending","Rooms","Iconic Cities",
        "Mountains","Castles","Swimming",
        "Camping","Farms","Arctic","Boats","Domes"],
  },

});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
await Review.deleteMany({_id :{$in : listing.reviews}});
    }
});



const  Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
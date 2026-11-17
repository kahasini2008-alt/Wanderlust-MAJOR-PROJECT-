const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    const categories = Listing.schema.path("category").enumValues;

    // Validate the selected category
    if (
        category !== undefined &&
        (typeof category !== "string" || !categories.includes(category))
    ) {
        req.flash("error", "Invalid category selected!");
        return res.redirect("/listings");
    }
    // Build the database filter
    const filter = {};

    if (category) {
        filter.category = category;
    }
    // Search by title, location, country, or description
    if (typeof search === "string" && search.trim()) {
        const escapedSearch = search.trim().replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { description: searchRegex }
        ];
    }
    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        category,
        searchTerm: typeof search === "string" ? search : ""
    });
};


module.exports.renderNewForm = (req,res)=>{
    const categories = Listing.schema.path("category").enumValues;
    res.render("listings/new.ejs",{categories});
};

module.exports.showForm = async(req,res)=>{
    let  {id} = req.params;
    const listing= await Listing.findById(id)
    .populate({
     path : "reviews",
     populate : {
        path : "author",
     },
    })
    .populate("owner");
    if(!listing){
         req.flash("error","Listing Not Found!");
         return res.redirect("/listings");
    }
    let mapCoordinates = listing.geometry?.coordinates;
    if (!Array.isArray(mapCoordinates) || mapCoordinates.length !== 2 || !mapCoordinates.every(Number.isFinite)) {
        const response = await geocodingClient
            .forwardGeocode({
                query: `${listing.location}, ${listing.country}`,
                limit: 1,
            })
            .send();

        mapCoordinates = response.body.features[0]?.geometry?.coordinates ?? null;
        if (mapCoordinates) {
            listing.geometry = { type: "Point", coordinates: mapCoordinates };
            await listing.save();
        }
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing, mapCoordinates});
};
module.exports.createForm = async(req,res)=>{

let response = await geocodingClient
   .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
})
  .send();
  
  


 const listingData = { ...req.body.listing };
  if (req.file) {
        listingData.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    } else if (typeof listingData.image === "string") {
        listingData.image = listingData.image ? { url: listingData.image } : {};
    }
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  newListing.geometry = response.body.features[0].geometry;

 let savedListing =  await newListing.save();
  console.log(savedListing);
  req.flash("success","New Listing created!");
  res.redirect(`/listings`);
};

module.exports.editForm = async (req,res)=>{
     let  {id} = req.params;
    const listing= await Listing.findById(id);
   if(!listing){
         req.flash("error","Listing Not Found!");
         return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    const categories = Listing.schema.path("category").enumValues;
    res.render("listings/edit.ejs",{listing, originalImageUrl, categories});
};

module.exports.updateForm = async (req,res)=>{
    let  {id} = req.params;
    const listingData = { ...req.body.listing };
    if (req.file) {
        listingData.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    }

    await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
    
    req.flash("success","Listing Updated!");
     res.redirect(`/listings/${id}`);
};

module.exports.deleteForm = async(req,res)=>{
    let  {id} = req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

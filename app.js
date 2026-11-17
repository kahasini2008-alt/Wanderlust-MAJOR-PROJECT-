if(process.env.NODE_ENV != "production"){
   require("dotenv").config({ quiet: true });
}




const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require('connect-mongo');
const flash = require("./utils/flash.js");
const passport = require("passport");
const LocalStrategy =require("passport-local");
const User = require("./models/user.js");




const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL;

app.use(express.json());
app.use(express.urlencoded({extended:true}));


main()
.then(()=>{
    console.log("DB connected");
    app.listen(8080,()=>{
        console.log("Server is running on port 8080");
    });
})
.catch((err)=>{
    console.error("Database connection failed:", err);
    process.exitCode = 1;
});

async function main(){
    if (!dbUrl) {
        throw new Error("ATLASDB_URL is not set. Add a valid MongoDB connection string to the environment.");
    }
    await mongoose.connect(dbUrl);
};
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto :{
        secret :process.env.SECRET,
    },
    touchAfter : 24*3600,
});
store.on("error",(err)=>{
    console.error("ERROR IN MONGO STORE",err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires : Date.now() + 7*24*60*60*1000,
        maxAge :7*24*60*60*1000,
        httpOnly : true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("Hi I'm root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
    res.status(204).end();
});



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.loginRedirect = req.flash("loginRedirect"); // Add this line
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"sigma-student"
//     });
//    let registeredUser = await User.register(fakeUser,"HelloWorld");
//    res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);

app.all("/{*path}",(req,res,next)=>{
    next(new ExpressError(404, `Page Not Found: ${req.method} ${req.originalUrl}`));
});

app.use((err,req,res,next)=>{
    if (err.name === "ExpressError" && err.statusCode === 404) {
        console.warn(err.message);
    } else if (err.name === "ExpressError" && err.statusCode === 400) {
        console.error(err.message);
    } else {
        console.error(err);
    }
    const statusCode = Number.isInteger(err.statusCode)
        ? err.statusCode
        : err.name === "ValidationError" || err.name === "CastError"
            ? 400
            : 500;
    let message = err.message;
    if (statusCode === 500) {
        message = "Something went wrong.";
    } else if (err.name === "ValidationError") {
        message = err.errors?.price?.name === "CastError"
            ? "Price must be a valid number."
            : "Please check your listing details.";
    }
    res.status(statusCode).render("error.ejs", { message });
})

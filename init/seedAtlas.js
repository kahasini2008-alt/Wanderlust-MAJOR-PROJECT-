
require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function seedAtlas() {
    try {
        const dbUrl = process.env.ATLASDB_URL;
        const mapToken = process.env.MAP_TOKEN;

        if (!dbUrl || !mapToken) {
            throw new Error(
                "ATLASDB_URL or MAP_TOKEN is missing from .env"
            );
        }

        await mongoose.connect(dbUrl);
        console.log("Connected to Atlas!");

        let inserted = 0;
        let categorized = 0;
        let skipped = 0;

        for (const item of initData.data) {
            // Preserve listings that already exist
            const existing = await Listing.findOne({
                title: item.title
            });

            if (existing) {
                if (!existing.category && item.category) {
                    await Listing.updateOne(
                        {
                            _id: existing._id,
                            $or: [
                                { category: { $exists: false } },
                                { category: null },
                                { category: "" }
                            ]
                        },
                        { $set: { category: item.category } }
                    );
                    console.log(`Categorized existing listing: ${item.title}`);
                    categorized++;
                    continue;
                }

                console.log(`Skipped existing listing: ${item.title}`);
                skipped++;
                continue;
            }

            const place = `${item.location}, ${item.country}`;
            const url =
                `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
                `${encodeURIComponent(place)}.json` +
                `?access_token=${encodeURIComponent(mapToken)}&limit=1`;

            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok || !result.features?.length) {
                console.log(`Could not find coordinates for: ${place}`);
                continue;
            }

            // Mapbox returns [longitude, latitude]
            const coordinates = result.features[0].center;

            await Listing.create({
                ...item,
                geometry: {
                    type: "Point",
                    coordinates
                }
            });

            console.log(`Added: ${item.title}`);
            inserted++;
        }

        console.log("\nSeeding finished!");
        console.log(`Inserted: ${inserted}`);
        console.log(`Categorized: ${categorized}`);
        console.log(`Skipped: ${skipped}`);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedAtlas();

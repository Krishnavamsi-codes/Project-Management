import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/index.js";

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app listening on port http://localhost:${port}`);
        });
    })//server will now listen only after the connection to db has been successfully achieved
    .catch((err) => {
        console.error("MongoDB connection error", err);
        process.exit(1);
    });
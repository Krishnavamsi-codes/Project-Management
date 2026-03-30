import express from "express"
import cors from "cors"
const app=express();

//server returns response or error and error part alrdy is like given for implementation by node so we do the response stuff
//base configuraiton
app.use(express.json({limit:"16kb"}))
//data coming with url so now we retrieve it here
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

//cors configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN?.split(',') || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]
}))


// 🔁 How it combines

// When you do:

// app.use("/api/v1/healthcheck", healthcheckrouter);

// 👉 Express combines paths like this:

// Base path        +   Router path
// /api/v1/healthcheck + /

// 👉 Final route becomes:

// /api/v1/healthcheck/
import  healthcheckrouter  from "./routes/healthcheck.routes.js";
app.use("/api/v1/healthcheck",healthcheckrouter)
app.get("/", (req, res) => {
    res.send("Welcome to homepage");
});

app.get("/instagram", (req, res) => {
    res.send("This is an instagram page");
});
export default app;
require("dotenv").config();
const express=require("express");
const app=express();
app.use(express.json());
const mongoose=require("mongoose");


const userRoutes=require("./routes/users");
const preferenceRoutes=require("./routes/preferences");
const newsRoutes=require("./routes/news");


const PORT=process.env.PORT;
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("connected to mongodb");
})
app.listen(PORT,()=>{
    console.log("Server is up and running");
});
app.use(userRoutes);
app.use(preferenceRoutes);
app.use(newsRoutes);
module.exports=app;
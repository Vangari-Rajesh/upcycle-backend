import mongoose from "mongoose";

function connectDB(uri){
    mongoose.connect(uri)
    .then(()=>{
        console.log("DB connected")
    })
    .catch((e)=>{
        console.log(e);
    })
}

export default connectDB;
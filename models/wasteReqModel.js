import mongoose from "mongoose";

const wasteReqSchema = mongoose.Schema({
    title: String,
    description: String,
    materialRequired: String,
    price: Number,
    quantity: Number,
    image: String,
    contributions: [{}],
    uploaderEmail: String,
    initialQuantity: String
})

const wasteReq = mongoose.model("wasteReq", wasteReqSchema);
export default wasteReq;
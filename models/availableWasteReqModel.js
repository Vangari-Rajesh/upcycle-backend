import mongoose from "mongoose";

const availableWasteReqSchema = mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    quantity: Number,
    image: String,
    uploaderEmail: String,
    initialQuantity: String
})

const availableWasteReq = mongoose.model("availableWasteReq", availableWasteReqSchema);

export default availableWasteReq;
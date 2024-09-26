import mongoose from "mongoose";

const innovativeProdSchema = mongoose.Schema({
    title: String,
    description: String,
    materialUsed: String,
    price: Number,
    quantity: Number,
    dimensions: String,
    image:String,
    initialQuantity:String,
    uploaderEmail: String,
})

const innovativeProd = mongoose.model("innovativeProd", innovativeProdSchema);

export default innovativeProd;

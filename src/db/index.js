import mongoose from "mongoose"

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("++mongodb connected")
    } catch (error) {
        console.error("mongodb connection error", error);
        process.exit(1)
    }
}
export default connectdb;
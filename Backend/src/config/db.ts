import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error(' MONGO_URI is not defined in .env file');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);

        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(` Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
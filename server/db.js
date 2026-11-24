import mongoose from "mongoose";

const state = (globalThis.__triptiMongo ||= { promise: null });

export async function connectDb(uri) {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!state.promise) {
    mongoose.set("strictQuery", true);
    state.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      })
      .catch((error) => {
        state.promise = null;
        throw error;
      });
  }
  await state.promise;
  return mongoose.connection;
}

export async function disconnectDb() {
  if (state.promise) {
    await mongoose.disconnect();
    state.promise = null;
  }
}

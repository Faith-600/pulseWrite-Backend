// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");

// let mongoServer;

// // This runs ONCE before ALL test files.
// beforeAll(async () => {
//   console.log("--- JEST GLOBAL SETUP: Connecting to DB ---");
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri);
// });

// // This runs ONCE after ALL test files.
// afterAll(async () => {
//   console.log("--- JEST GLOBAL TEARDOWN: Disconnecting from DB ---");
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// // This runs before EACH test case in EVERY file.
// beforeEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany({});
//   }
// });

import { connect } from "mongoose";

export default async () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await connect(process.env.DB, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    console.log("Could not connect to database!");
  }
};

import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import routes from "./routes";
import { connect } from "./repository/database";
import { setupDocumentation } from "./util/documentation";

dotenvFlow.config();
const app: Application = express();

export async function startServer() {
  // Connect once
  await connect();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "PUT", "POST", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type", "Origin", "X-Requested-With", "Accept"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use("/api", routes);

  setupDocumentation(app);

  const PORT: number = parseInt(process.env.PORT as string) || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Only start server if this file is executed directly
if (require.main === module) {
  startServer();
}

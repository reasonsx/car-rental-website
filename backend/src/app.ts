import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";

import routes from "./routes";
import { connectDB } from "./config/db";
import { setupDocumentation } from "./utils/documentation";

dotenvFlow.config();

const app: Application = express();

export async function startServer() {
  try {
    await connectDB();

    app.use(cors());
    app.use(express.json());

    app.get("/", (_req, res) => {
      res.json({
        message: "Car Rental API is running 🚀",
        api: "/api/v1",
        docs: "/api-docs",
      });
    });

    app.use("/api/v1", routes);

    setupDocumentation(app);

    const PORT = Number(process.env.PORT) || 4000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 API: http://localhost:${PORT}/api/v1`);
      console.log(`📄 Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Run only if executed directly
if (require.main === module) {
  startServer();
}

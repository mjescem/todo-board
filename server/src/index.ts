import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.route.js";
import boardRoutes from "./routes/board.route.js";
import categoryRoutes from "./routes/category.route.js";
import ticketRoutes from "./routes/ticket.route.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);

// Configure Monolithic Static File Serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client-dist");

app.use(express.static(clientBuildPath));

// Fallback all non-API routes to index.html for React SPA routing
app.get("/{*path}", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ message: "API route not found" });
    return;
  }
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Global error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  },
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

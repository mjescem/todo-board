import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.route.js";
import boardRoutes from "./routes/board.route.js";
import categoryRoutes from "./routes/category.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import { authenticate } from "./middleware/authenticate.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/boards", authenticate, boardRoutes);
app.use("/api/categories", authenticate, categoryRoutes);
app.use("/api/tickets", authenticate, ticketRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

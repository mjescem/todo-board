import express from "express";
import userRoutes from "./routes/auth.route.js";

const app = express();

app.use(express.json());

app.use("/api/auth", userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
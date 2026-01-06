import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnection from './config/db.js';
import groupTicketingRoutes from "./routes/groupTicketing.routes.js";
import authRoutes from "./routes/auth.routes.js";


const app = express();
dotenv.config();

// Connect to the database
dbConnection();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    })
);
app.use(express.json());


app.use("/api/group-ticketing", groupTicketingRoutes);
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('Brother International API is running');
});

const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
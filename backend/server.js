import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dbConnection from './config/db.js';
import groupTicketingRoutes from "./routes/groupTicketing.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bankRoutes from "./routes/bank.routes.js";
import sectorRoutes from "./routes/sector.routes.js";
import airlineRoutes from "./routes/airline.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import testEmail from "./utils/testEmail.js";
import alHaiderAPIRoutes from "./routes/alHaiderAPI.routes.js";
import bookingRoutes from "./routes/booking.routes.js";


const app = express();
dotenv.config();

// Connect to the database
dbConnection();

// Test email configuration
testEmail();

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://brothersinttvl.com", "https://brothersinttvl.com", "https://www.brothersinttvl.com", "http://www.brothersinttvl.com"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());


app.use("/api/group-ticketing", groupTicketingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/sector", sectorRoutes);
app.use("/api/airline", airlineRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/al-haider", alHaiderAPIRoutes);
app.use("/api/bookings", bookingRoutes);

app.get('/', (req, res) => {
    res.send('Brother International API is running');
});

const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
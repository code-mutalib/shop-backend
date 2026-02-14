import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import dbConnection from './config/db.js';
import seedAdmin from './utils/seedAdmin.js';
import userRouter from './routes/user.routes.js';
import productRouter from "./routes/product.routes.js";
import orderRouter from './routes/order.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API is running 🚀');
});

/* ================= ROUTES ================= */
app.use('/api/users', userRouter);
app.use("/api/products", productRouter);
app.use('/api/orders', orderRouter);

/* ================= 404 HANDLER ================= */
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

dbConnection()
.then(async () => {
  console.log('MongoDB connected');

  /* ================= RUN ADMIN SEEDER ================= */
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
}).catch((err) => {
  console.log('MongoDB connection failed:', err.message);
});

import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

/* ================= CUSTOMER ROUTES ================= */
orderRouter.post('/', authMiddleware(['customer', 'admin']), createOrder);

orderRouter.get('/my-orders', authMiddleware(['customer']), getMyOrders);

/* ================= ADMIN ROUTES ================= */
orderRouter.get('/', authMiddleware(['admin']), getAllOrders);

orderRouter.put('/:id', authMiddleware(['admin']), updateOrderStatus);

orderRouter.delete('/:id', authMiddleware(['admin']), deleteOrder);

export default orderRouter;

import express from 'express';
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const productRouter = express.Router();

/* ================= PUBLIC ROUTES ================= */
productRouter.get('/', getAllProducts);
productRouter.get('/:slug', getSingleProduct);

/* ================= ADMIN ROUTES ================= */
productRouter.post('/', authMiddleware(['admin']), createProduct);

productRouter.put('/:id', authMiddleware(['admin']), updateProduct);

productRouter.delete('/:id', authMiddleware(['admin']), deleteProduct);

export default productRouter;

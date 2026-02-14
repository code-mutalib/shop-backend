import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

/* =========================================================
   CREATE ORDER (CUSTOMER)
========================================================= */
export const createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products provided',
      });
    }

    let totalAmount = 0;

    /* ================= VALIDATE PRODUCTS ================= */
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const variant = product.variants.find((v) => v.weight === item.weight);

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: 'Selected variant not available',
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      variant.stock -= item.quantity;
      await product.save();

      totalAmount += variant.price * item.quantity;
      item.price = variant.price;
    }

    const order = await Order.create({
      user: req.user._id,
      products,
      totalAmount,
      shippingAddress,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET MY ORDERS (CUSTOMER)
========================================================= */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.productId', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL ORDERS (ADMIN)
========================================================= */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.productId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE ORDER STATUS (ADMIN)
========================================================= */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE ORDER (ADMIN)
========================================================= */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

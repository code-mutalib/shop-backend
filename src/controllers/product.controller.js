import Product from "../models/product.model.js";

/* =========================================================
   CREATE PRODUCT (ADMIN)
========================================================= */
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, variants, description, images, isFeatured } =
      req.body;

    if (!name || !category || !variants || !description) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const product = await Product.create({
      name,
      category,
      variants,
      description,
      images,
      isFeatured,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL PRODUCTS (PUBLIC)
========================================================= */
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (featured) filter.isFeatured = featured === "true";

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET SINGLE PRODUCT
========================================================= */
export const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE PRODUCT (ADMIN)
========================================================= */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE PRODUCT (ADMIN)
========================================================= */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

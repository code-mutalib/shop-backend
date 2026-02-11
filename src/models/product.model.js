import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    category: String,
    variants: [
      {
        weight: String,
        price: Number,
        stock: Number,
      },
    ],
    description: String,
    images: [String],
    isFeatured: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

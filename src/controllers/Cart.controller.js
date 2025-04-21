import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.params.productId;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(401, "Invalid User")
    }

    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      throw new ApiError(404, "Product not found.")
    }

    // Find cart or create new
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        products: [{ productId }],
      });
    } else {
      // Check if product already exists in cart
      const existingItem = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Increment quantity
        existingItem.quantity += 1;
      } else {
        // Add new item
        cart.products.push({ productId });
      }
    }

    await cart.save();

    // Populate product details
    const populatedCart = await Cart.findOne({ userId }).populate("products.productId");

    // Calculate total quantity
    const totalItems = populatedCart.products.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const cartDetails = {
      items: totalItems,
      products: populatedCart.products
    }
    return res
    .status(200)
    .json(
      new ApiResponse(
        200, cartDetails, "Product added to cart"
      )
    )
  } catch (error) {
    throw new ApiError(500, "Internal server error" || error);
  }
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const productId = req.params.productId;

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(401, "Invalid User");
  }

  // Check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new ApiError(404, "Product not found.");
  }

  // Find user's cart
  let cart = await Cart.findOne({ userId }); // <-- Fix: use findOne instead of find
  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  // Filter out the product from cart
  const filteredProducts = cart.products.filter(
    (item) => item.productId.toString() !== productId
  );

  // Check if product was actually removed
  if (filteredProducts.length === cart.products.length) {
    throw new ApiError(400, "Product not found in cart.");
  }

  cart.products = filteredProducts;
  await cart.save();

  // Populate updated cart
  const updatedCart = await Cart.findOne({ userId }).populate("products.productId");

  const totalItems = updatedCart.products.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const cartDetails = {
    items: totalItems,
    products: updatedCart.products,
  };

  return res.status(200).json(
    new ApiResponse(200, cartDetails, "Product removed from cart")
  );
});


export const getCartDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(401, "Invalid User");
  }

  // Get the user's cart
  const cart = await Cart.findOne({ userId }).populate("products.productId");

  if (!cart || cart.products.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { items: 0, products: [] }, "Cart is empty")
    );
  }

  // Calculate total number of items
  const totalItems = cart.products.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const cartDetails = {
    items: totalItems,
    products: cart.products,
  };

  return res.status(200).json(
    new ApiResponse(200, cartDetails, "Cart fetched successfully")
  );
});



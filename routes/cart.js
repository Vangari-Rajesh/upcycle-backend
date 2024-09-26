import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import dotenv from "dotenv";
import userMiddleware from "../middlewares/user.js";
import innovativeProd from "../models/innovativeProdModel.js";
import User from "../models/userModel.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe("sk_test_51OduLoSEuj58CJVxfj0JxednavltZr3C59KJx9Ik6b9ZhHw6AmMigGRBri6vNvJkvOp1GGaT0ZUElG21zUdPQer6005hR0RkBD");

// cart logic
router.post("/addToCart", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Assuming req.body already contains the cart item structure you want to add.
        user.cart.push(req.body); // Push the whole object, not just an ObjectId

        await user.save(); // Save the user document to persist changes

        res.status(201).json({ msg: "Item added to cart successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error adding item to cart" });
    }
});

router.post("/buyCart", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Assuming req.body already contains the cart item structure you want to add.
        user.buyCart.push(req.body); // Push the whole object, not just an ObjectId

        await user.save(); // Save the user document to persist changes

        res.status(201).json({ msg: "Item added to cart successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error adding item to cart" });
    }
});

router.delete("/buyEmpty", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Clear the cart by setting it to an empty array
        user.buyCart = [];
        await user.save();

        res.send('Cart cleared successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while clearing the cart');
    }
});

router.get("/getBuyEamil", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        console.log(email);
        const user = await User.findOne({ email: email });

        // Send the cart items to the front-end
        console.log(user.buyCart);
        res.status(200).json(user.buyCart);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

router.delete("/clearCart", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Clear the cart by setting it to an empty array
        user.cart = [];
        await user.save();

        res.send('Cart cleared successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while clearing the cart');
    }
});

router.get("/getCartByEmail", userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email: email });

        console.log(email);

        // Check if user and cart exist
        if (user && user.cart.length > 0) {
            // Send the cart items to the front-end
            res.status(200).json(user.cart);
        } else {
            // If no user or no cart items found, send a 404 response
            res.status(404).json({ msg: "No cart items found for this email" });
        }
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

router.post("/removeFromCart", userMiddleware, async (req, res) => {
    const { itemIndex } = req.body;
    const userEmail = req.user.email;
    console.log('Received userEmail:', userEmail);
    console.log('Received itemIndex:', itemIndex);

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (itemIndex >= 0 && itemIndex < user.cart.length) {
            user.cart.splice(itemIndex, 1); // Remove the item at the specified index
            await user.save();
            res.status(200).json({ msg: "Item removed from cart" });
        } else {
            res.status(400).json({ msg: "Invalid item index" });
        }
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

// failure page when user cancels the payment 
router.delete('/delete-last-product', userMiddleware, async (req, res) => {
    try {
        const email = req.user.email;

        // Find the user by their email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user has any bought products
        if (user.boughtProducts.length === 0) {
            return res.status(400).json({ error: "No bought products to delete" });
        }

        // Remove the last bought product
        user.boughtProducts.pop();

        // Save the updated user to the database
        await user.save();

        res.status(204).end(); // Successful deletion, no content to return
    } catch (error) {
        console.error("Error during the delete request", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
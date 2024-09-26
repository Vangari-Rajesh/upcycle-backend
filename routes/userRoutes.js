import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { instance } from "../app.js";
import userMiddleware from "../middlewares/user.js";
import User from "../models/userModel.js";
import innovativeProd from "../models/innovativeProdModel.js";
import wasteReq from "../models/wasteReqModel.js";

dotenv.config();

const router = express.Router();
router.post("/signup", async(req,res)=>{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const cPassword = req.body.cPassword;
    res.cookie("email", email);
    // Input handling
    if (!username || !email || !password || !cPassword) {
        return res.json({msg : "All fields are required."});
    }
    if (!email.includes('@')) {
        return res.json({msg : 'Enter a correct email address.'});
    }    
    if(password.length<8){
        return res.json({msg : "Password should contain atleast 8 characters"})
    }
    if(password !== cPassword){
        return res.json({msg:"Password and Confirm password should be same"})
    }

    const existingUser = await User.findOne({ email});
    if (existingUser) {
        return res.json({msg: 'User already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        username: username,
        email: email,
        password: hashedPassword,
    });

    await user.save();

    res.status(200).json({msg : 'User created successfully'} );
})

router.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
        return res.json({ msg: 'Incorrect email and password' });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        const token = jwt.sign({ email: email }, process.env.SECRET, { expiresIn: "20h" });
        res.cookie("token", token, {
            httpOnly: true,
        });

        // Return the user's email in the response
        return res.status(200).json({ msg: "Login successful", email: user.email });
    } else {
        return res.json({ msg: 'Incorrect email and password' });
    }
});

router.post("/logout", (req, res) => {
    // Clear the token or session
    res.clearCookie('token');
    console.log("cleared cookie");
    // Optionally, perform any other cleanup tasks
    // For example, clear any user-related data stored in session
    res.status(200).json({ msg: "Logout successful" });
});

router.patch("/updateUsersInnovativeProd", userMiddleware, async (req, res) => {
    try {
        const userEmail = req.user.email;
        console.log(userEmail);
        const description = req.body.description;
        const product = await innovativeProd.findOne({ description });
        console.log(product)
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        const productId = product._id;
        const userDoc = await User.findOne({ email: userEmail });

        console.log(userDoc)

        if (!userDoc) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (!userDoc.innovativeProds) {
            userDoc.innovativeProds = [];
        }

        userDoc.innovativeProds.push(productId);
        await userDoc.save();

        res.json({ msg: "Product uploaded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

router.get("/getUsersWasteReq" ,async (req, res) => {
    try {
        const userEmail = req.body
        const userDoc = await User.findOne({ email:userEmail });
        if (!userDoc) {
            return res.json({ msg: "User not found" });
        }

        const arrOfObjectIds = userDoc.wasteReq;

        const wasteReqDocuments = await wasteReq.find({ _id: { $in: arrOfObjectIds } });

        res.status(200).json({ wasteReqDocuments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

router.get("/getUsersInnovativeProds", async (req,res)=>{
    try{
        const userEmail = req.body;
        const userDoc = await User.findOne({email: userEmail});
        if(!userDoc){
            return res.json({msg : "User not found"});
        }

        const arrOfObjectIds = userDoc.wasteReq;
        const wasteReqDocuments = await wasteReq.find({_id:{$in: arrOfObjectIds}});
        res.status(200).json({wasteReqDocuments});
    }catch(err){
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
})


router.get("/satisfiedRequirements", userMiddleware, async(req, res) => {
    try {
        const userEmail = req.user.email;
        const userDoc = await User.findOne({ email: userEmail });
        if (!userDoc) {
            return res.json({ msg: "User not found" });
        }

        const arrOfObjectIds = userDoc.wasteReq;

        const wasteReqDocuments = await wasteReq.find({
            _id: { $in: arrOfObjectIds },
            quantity: 0
        });

        res.status(200).json({wasteReqDocuments});
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


router.get("/profile", userMiddleware, async(req,res)=>{
    const email = req.user.email;
    const user = await User.findOne({email});
    return res.json(user);
})

// for market profile

router.get('/user', userMiddleware, async (req, res) => {
    try {
        // Fetching user by email
        const email = req.user.email;
        const user = await User.findOne({ email: email });
  
        if (!user) {
            return res.status(404).send('User not found');
        }
  
        // Extracting boughtProducts and filtering out Stripe session IDs
        const boughtProducts = user.boughtProducts.map(product => {
            const { stripeSessionId, ...productDetails } = product;
            return productDetails;
        });
  
        // Sending the modified response
        res.json({
            username: user.username,
            email: user.email,
            boughtProducts: boughtProducts
        });
        // console.log(res.json)
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
  });


  router.post('/checkout', userMiddleware, async (req, res) => {
    try {
        const options = {
          amount: Number(req.body.amount * 100),
          currency: "INR",
        };
    
        console.log("instance === ", instance);
        const order = await instance.orders.create(options);
        console.log("after instance of the order = ", order);
    
        // Perform MongoDB changes
        const email = req.user.email; // Assuming user email is available in req.user
        const user = await User.findOne({ email: email });
    
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }
        try{
            // console.log("user mama ",user.cart);
            for (const item in user.cart){
                // console.log("id ==  ",item._id,"  item= ",item);
                const prod=await innovativeProd.findOne({title:item.title});
                console.log(prod+" prod in for loop");
                prod.quantity=prod.quantity-1;
                if(prod.quantity<=0){
                    console.log(prod,"  is stock out of bound ");
                   await prod.remove();
                }
                else{
                await prod.save();
                }
            }

        }
        catch (error) {
            console.error('Error updating quantities:', error);
          }
        
        // Concatenate cart with boughtProducts and empty cart
        user.boughtProducts = user.boughtProducts.concat(user.cart);
        user.cart = [];
    
        // Save changes to the database
        await user.save();
    
        // console.log("user in database -- ", user);
    
        res.status(200).json({
          success: true,
          order,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
      }
    });
    
    router.post('/paymentverification', userMiddleware, async (req, res) => {
      // Redirect the user to the customer profile page
      res.redirect("http://localhost:5173/customer-profile");
    });
    
    // module.exports = { checkout, paymentVerification };
    
// router.route("/checkout").post( userMiddleware, checkout);

// router.route("/paymentverification").post( userMiddleware, paymentVerification);

export default router;
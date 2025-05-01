import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ProductPage from "./Pages/ProductPage";
import Checkout from "./Pages/Checkout";

import Test from "./Pages/Test";
import ForgotPassword from "./Pages/ForgotPassword.JSX";
import VerifyCode from "./Pages/VerifyCode";
import SetNewPassword from "./Pages/SetNewPassword";
import Product from "./Pages/Product";
import AboutUs from "./Pages/AboutUs";
import Cart from "./Pages/Cart";
import { CartProvider } from "./context/CartContext";
import CustomizationPage from "./Pages/CustomizationPage";
import BlogPage from "./Pages/BlogPage";
import CustomizationTool from "./Pages/CustomizationTool ";
import OrderDetailsPage from "./Pages/OrderDetailsPage";
import AddProduct from "./Pages/AddProduct";
import SellerDashboard from "./Pages/SellerDashboard";

const App = () => {
  return (
    <CartProvider>
     
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/productpage" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<Test />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifycode" element={<VerifyCode />} />
          <Route path="/set-password" element={<SetNewPassword />} />
          // In your router configuration
          <Route path="/order-details" element={<OrderDetailsPage />} />
          <Route path="/product" element={<Product />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/CustomizationPage" element={<CustomizationPage />} />
          <Route path="/BlogPage" element={<BlogPage />} />
          <Route path="/CustomizationTool" element={< CustomizationTool />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
        </Routes>
       
      
    </CartProvider>
  );
};

export default App;
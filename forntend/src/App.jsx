import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Checkout from "./Pages/Checkout";
import ProductDetail from "./Pages/ProductDetail"; // Renamed from Test.js for clarity
import ForgotPassword from "./Pages/ForgotPassword";
import VerifyCode from "./Pages/VerifyCode";
import SetNewPassword from "./Pages/SetNewPassword";
import AboutUs from "./Pages/AboutUs";
import Cart from "./Pages/Cart";
import { CartProvider } from "./context/CartContext";
import CustomizationPage from "./Pages/CustomizationPage";
import BlogPage from "./Pages/BlogPage";
import CustomizationTool from "./Pages/CustomizationTool ";
import OrderDetailsPage from "./Pages/OrderDetailsPage";
import AddProduct from "./Pages/AddProduct";
import SellerDashboard from "./Pages/SellerDashboard";
import AdminDashboard from "./Pages/AdminDashboard ";

import Profile from "./Pages/Profile";
import { UserProvider } from "./context/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Messenger from "./Pages/Messanger";


import NotFoundPage from "./Pages/NotFoundPage";

import Product from "./Pages/Product";
import CategoryPage from "./components/CategoryPage";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";


const App = () => {
  return (
    <CartProvider>
      <UserProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/product" element={<Product />} />
          <Route path="*" element={<NotFoundPage />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
       
          <Route path="/sportswear/:categoryId" element={<CategoryPage/>} />
      

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifycode" element={<VerifyCode />} />
          <Route path="/set-password" element={<SetNewPassword />} />
          <Route path="/order-details" element={<OrderDetailsPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/CustomizationPage" element={<CustomizationPage />} />
          <Route path="/BlogPage" element={<BlogPage />} />
          <Route path="/CustomizationTool" element={<ErrorBoundary><CustomizationTool /></ErrorBoundary>} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/AdminDashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/Messenger" element={<Messenger />} />

          <Route path="/Profile" element={<Profile />} />
        </Routes>
        </AuthProvider>
      </UserProvider>
    </CartProvider>
  );
};

export default App;
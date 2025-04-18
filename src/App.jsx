import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ProductPage from "./Pages/ProductPage";
import Checkout from "./Pages/Checkout";
import Test2 from "./Pages/Test2";
import Test from "./Pages/Test";
import ForgotPassword from "./Pages/ForgotPassword.JSX";
import VerifyCode from "./Pages/VerifyCode";
import SetNewPassword from "./Pages/SetNewPassword";
import Product from "./Pages/Product";
import AboutUs from "./Pages/AboutUs";
import Cart from "./Pages/Cart";
import { CartProvider } from "./context/CartContext";
import CustomizationPage from "./Pages/CustomizationPage";

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
          <Route path="/test2" element={<Test2 />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/verifycode" element={<VerifyCode />} />
          <Route path="/set-password" element={<SetNewPassword />} />
          <Route path="/product" element={<Product />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/CustomizationPage" element={<CustomizationPage />} />
        </Routes>
       
      
    </CartProvider>
  );
};

export default App;
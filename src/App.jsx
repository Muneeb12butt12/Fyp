import React from "react";
import {Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import AboutPage from "./Pages/AboutPage";
import ProductPage from "./Pages/ProductPage";
import Checkout from "./Pages/Checkout";
import Test2 from "./Pages/Test2";
import Test from "./Pages/Test";
import ForgotPassword from "./Pages/ForgotPassword.JSX";
import VerifyCode from "./Pages/VerifyCode";
import SetNewPassword from './Pages/SetNewPassword';
import SmartCart from "./Pages/SmartCart";




const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/AboutPage" element={<AboutPage />} />
      <Route path="/ProductPage" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />
       <Route path="/Test" element={<Test />} />
       <Route path="/Test2" element={<Test2 />} />
       <Route path="/ForgetPassword" element={<ForgotPassword />} />
       <Route path="/VerifyCode" element={<VerifyCode />} /> 
       <Route path="/set-password" element={<SetNewPassword />} />
       <Route path="/SmartCart" element={<SmartCart/>} />
    </Routes>
  );
};

export default App;

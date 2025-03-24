import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import AboutPage from "./Pages/AboutPage";
import ProductPage from "./Pages/ProductPage";
import Checkout from "./Pages/Checkout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
};

export default App;

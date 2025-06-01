import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("products")) || [];
    const filtered = stored.filter(
      (p) => p.category.toLowerCase() === categoryName.toLowerCase()
    );
    setProducts(filtered);
  }, [categoryName]);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {categoryName} Sportswear
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-xl transition">
              <img src={product.img} className="h-40 w-full object-contain mb-4" alt={product.title} />
              <h2 className="font-semibold text-lg">{product.title}</h2>
              <p className="text-primary font-bold mt-2">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;

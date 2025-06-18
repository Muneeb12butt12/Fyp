// CategoryPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar, FaPlus } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";

const CategoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.categoryData;

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();

    if (!category) {
      navigate("/");
    }
  }, [category, navigate]);

  if (!category) return null;

  const handleOrderNow = (product, e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`, { state: { productData: product } });
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <div className="text-center md:text-left">
            <p className="text-sm text-primary">Premium {category.name} Collection</p>
            <h1 className="text-3xl font-bold">{category.name} Sportswear</h1>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
          <Link
            to="/add-product"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
          >
            <FaPlus /> Add Product
          </Link>
        </div>

        {/* All Products in Category */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">All {category.name} Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.items.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl bg-white dark:bg-gray-800 hover:bg-black/80 dark:hover:bg-primary hover:text-white relative shadow-xl duration-300 group max-w-[250px]"
                data-aos="fade-up"
              >
                <div className="pt-6">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="max-w-[120px] h-[120px] mx-auto group-hover:scale-105 duration-300 drop-shadow-md object-contain"
                  />
                </div>

                <div className="px-4 pb-6 text-center -mt-8">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(4)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                  <h2 className="font-bold text-lg">{product.title}</h2>
                  <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-primary font-bold mt-2">${product.price}</p>
                  <button
                    onClick={(e) => handleOrderNow(product, e)}
                    className="mt-4 bg-primary text-white py-1 px-4 rounded-full group-hover:bg-white group-hover:text-primary duration-300"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
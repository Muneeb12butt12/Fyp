import React, { useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { FaStar, FaPlus } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

// Import sport-specific product images
import Basketball1 from "../assets/sportwear/basketball1.png";
import Basketball2 from "../assets/sportwear/basketball2.png";
import Basketball3 from "../assets/sportwear/basketball3.png";
import Tennis1 from "../assets/sportwear/tennis1.png";
import Tennis2 from "../assets/sportwear/tennis2.png";
import Tennis3 from "../assets/sportwear/tennis3.png";
import Cricket1 from "../assets/sportwear/cricket1.png";
import Cricket2 from "../assets/sportwear/cricket2.png";
import Cricket3 from "../assets/sportwear/cricket3.png";
import Football1 from "../assets/sportwear/football1.png";
import Football2 from "../assets/sportwear/football2.png";
import Football3 from "../assets/sportwear/football3.png";

// Sport categories with products
const sportCategories = [
  {
    id: 1,
    name: "Cricket",
    description: "High-performance cricket jerseys and gear",
    items: [
      {
        id: 101,
        img: Cricket1,
        title: "Cricket Jersey Pro",
        price: (Math.random() * 100 + 20).toFixed(2),
        description: "Professional cricket jersey with moisture-wicking fabric",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L", "XL"]
      },
      {
        id: 102,
        img: Cricket2,
        title: "Cricket Training Tee",
        price: (Math.random() * 100 + 25).toFixed(2),
        description: "Lightweight training tee for cricket practice",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["M", "L", "XL"]
      },
      {
        id: 103,
        img: Cricket3,
        title: "Premium Cricket Kit",
        price: (Math.random() * 100 + 50).toFixed(2),
        description: "Complete cricket kit with jersey and pants",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L", "XL", "XXL"]
      }
    ]
  },
  {
    id: 2,
    name: "Football",
    description: "Professional football kits and accessories",
    items: [
      {
        id: 201,
        img: Football1,
        title: "Football Jersey Elite",
        price: (Math.random() * 100 + 30).toFixed(2),
        description: "High-performance football jersey with breathable mesh",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L"]
      },
      {
        id: 202,
        img: Football2,
        title: "Football Training Top",
        price: (Math.random() * 100 + 35).toFixed(2),
        description: "Training top for football practice sessions",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["M", "L", "XL"]
      },
      {
        id: 203,
        img: Football3,
        title: "Matchday Football Kit",
        price: (Math.random() * 100 + 60).toFixed(2),
        description: "Complete football kit for match days",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L", "XL"]
      }
    ]
  },
  {
    id: 3,
    name: "Basketball",
    description: "Basketball jerseys and performance wear",
    items: [
      {
        id: 301,
        img: Basketball1,
        title: "Basketball Jersey Pro",
        price: (Math.random() * 100 + 40).toFixed(2),
        description: "Authentic basketball jersey with team colors",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["M", "L", "XL"]
      },
      {
        id: 302,
        img: Basketball2,
        title: "Basketball Shorts",
        price: (Math.random() * 100 + 35).toFixed(2),
        description: "Performance basketball shorts with moisture control",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L"]
      },
      {
        id: 303,
        img: Basketball3,
        title: "Basketball Practice Kit",
        price: (Math.random() * 100 + 55).toFixed(2),
        description: "Complete practice kit for basketball players",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["M", "L", "XL", "XXL"]
      }
    ]
  },
  {
    id: 4,
    name: "Tennis",
    description: "Tennis apparel and accessories",
    items: [
      {
        id: 401,
        img: Tennis1,
        title: "Tennis Polo Shirt",
        price: (Math.random() * 100 + 30).toFixed(2),
        description: "Breathable polo shirt for tennis matches",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L"]
      },
      {
        id: 402,
        img: Tennis2,
        title: "Tennis Skirt",
        price: (Math.random() * 100 + 35).toFixed(2),
        description: "Comfortable tennis skirt with built-in shorts",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["XS", "S", "M"]
      },
      {
        id: 403,
        img: Tennis3,
        title: "Tennis Performance Set",
        price: (Math.random() * 100 + 50).toFixed(2),
        description: "Complete tennis outfit for optimal performance",
        colors: [
          "red", "blue", "black", "white", "yellow", "green", "orange",
          "purple", "gray", "pink", "gold", "silver", "maroon", "navy",
          "teal", "lime", "burgundy"
        ],
        sizes: ["S", "M", "L"]
      }
    ]
  }
];

const Product = () => {
  const navigate = useNavigate();
  const [orderPopup, setOrderPopup] = useState(false);

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

// Update the handleCategoryClick function in Product.js
const handleCategoryClick = (category) => {
  navigate(`/sportswear/${category.id}`, { state: { categoryData: category } });
};
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
            <p className="text-sm text-primary">Premium Sportswear Collection</p>
            <h1 className="text-3xl font-bold">Sportswear Categories</h1>
            <p className="text-gray-400 text-sm">
              Explore our collection of top-quality sportswear
            </p>
          </div>
          <Link
            to="/add-product"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
          >
            <FaPlus /> Add Product
          </Link>
        </div>

        {/* Sport Categories Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Browse by Sport</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sportCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCategoryClick(category)}
                data-aos="fade-up"
              >
                <img
                  src={category.items[0].img}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        {sportCategories.map((category) => (
          <div key={category.id} className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{category.name} Collection</h2>
              <Link
  to={`/sportswear/${category.id}`}
  state={{ categoryData: category }}
  className="text-primary hover:underline"
>
  View All
</Link>
            </div>
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
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Product;
import React from "react";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Img1 from "../assets/shirt/shirt.png";
import Img2 from "../assets/shirt/shirt2.png";
import Img3 from "../assets/shirt/shirt3.png";
import Img4 from "../assets/shirt/shirt4.jpg";
import Img5 from "../assets/shirt/shirt5.jpg";
import Img6 from "../assets/shirt/shirt6.png";
import Img7 from "../assets/shirt/Shirt7.png";
import { FaStar } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
const images = [Img1, Img2, Img3, Img4, Img5, Img6,Img7];

const ProductsData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  img: images[i % images.length],
  title: `Product ${i + 1}`,
  price: (Math.random() * 100 + 20).toFixed(2),
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  colors: ["blue", "red", "green"],
  sizes: ["XS", "S", "M", "L", "XL", "2XL"]
}));

const Product = () => {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { productData: product } });
  };
const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
    <Navbar />
    <div className="container mx-auto px-4 py-10">
   
      <div className="text-center mb-10">
        <p className="text-sm text-primary">Top Rated Products for You</p>
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-gray-400 text-sm">
          Explore our collection of 30 top-rated items
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 place-items-center">
        {ProductsData.map((data) => (
          <div
            key={data.id}
            className="rounded-2xl bg-white dark:bg-gray-800 hover:bg-black/80 dark:hover:bg-primary hover:text-white relative shadow-xl duration-300 group max-w-[250px] cursor-pointer"
            onClick={() => handleProductClick(data)}
          >
            <div className="pt-6">
              <img
                src={data.img}
                alt={`Product ${data.id}`}
                className="max-w-[120px] mx-auto group-hover:scale-105 duration-300 drop-shadow-md"
              />
            </div>

            <div className="px-4 pb-6 text-center -mt-8">
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(4)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-500 text-sm" />
                ))}
              </div>
              <h2 className="font-bold text-lg">{data.title}</h2>
              <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                {data.description}
              </p>
              <p className="text-primary font-bold mt-2">${data.price}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(data);
                }}
                className="mt-4 bg-primary text-white py-1 px-4 rounded-full group-hover:bg-white group-hover:text-primary duration-300"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Product;
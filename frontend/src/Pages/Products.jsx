import React, { useState, useEffect } from "react";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { FaStar, FaFilter, FaTimes, FaArrowLeft, FaShoppingCart, FaPalette, FaComments } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api.js";

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "men", name: "Men's Collection" },
    { id: "women", name: "Women's Collection" },
    { id: "accessories", name: "Accessories" },
    { id: "sports", name: "Sports Wear" },
    { id: "casual", name: "Casual Wear" }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching products from:", API_ENDPOINTS.PRODUCTS);
      
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Products API response:", data);
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch products");
      }
      
      // Products are already filtered by status and isActive on the backend
      const products = data.products || [];
      
      console.log("Products received:", products);
      setProducts(products);
      setFilteredProducts(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      filterProducts();
    }
  }, [selectedCategory, sortBy, products]);

  const filterProducts = () => {
    if (!Array.isArray(products)) return;
    
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "men") {
        filtered = filtered.filter(product => product.gender === "male" || product.gender === "unisex");
      } else if (selectedCategory === "women") {
        filtered = filtered.filter(product => product.gender === "female" || product.gender === "unisex");
      } else {
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // featured - no sorting needed
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (product) => {
    navigate('/product', { state: { productData: product } });
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
    setSelectedColor(null);
    setSelectedSize(null);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    // Validate product variants
    if (product.variants?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (product.variants?.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Prepare product data for cart
    const productToAdd = {
      ...product,
      selectedColor: selectedColor || product.variants?.colors?.[0] || null,
      selectedSize: selectedSize || product.variants?.sizes?.[0] || null,
      sellerId: product.seller?._id || product.seller, // Handle both populated and unpopulated seller
      sellerName: product.seller?.businessInfo?.businessName || product.seller?.fullName || null
    };

    // Add to cart
    addToCart(productToAdd);

    // Reset selections
    setSelectedColor(null);
    setSelectedSize(null);
  };

  const handleCustomize = (e, product) => {
    e.stopPropagation();
    navigate(`/product/${product._id}?customize=true`);
  };

  useEffect(() => {
    AOS.init({ offset: 100, duration: 800, easing: "ease-in-sine", delay: 100 });
    AOS.refresh();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {selectedProduct ? (
          // Product Details View
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={handleCloseDetails}
              className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <FaArrowLeft />
              Back to Products
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={selectedProduct.images?.[0] || "/placeholder-image.jpg"}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedProduct.images?.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80"
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} - ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProduct.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(4)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ${selectedProduct.price}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedProduct.description}
                    </p>

                    {/* Seller Information */}
                    {selectedProduct.seller && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sold by</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedProduct.seller.businessInfo?.businessName || selectedProduct.seller.fullName || 'Unknown Seller'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              toast.success('Chat feature coming soon!');
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                          >
                            <FaComments />
                            Chat with Seller
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color Selection */}
                  {selectedProduct.variants?.colors?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Color</h3>
                      <div className="flex gap-2">
                        {selectedProduct.variants.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-10 h-10 rounded-full border-2 ${
                              selectedColor === color
                                ? 'border-primary'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {selectedProduct.variants?.sizes?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Size</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.variants.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg border-2 ${
                              selectedSize === size
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">{selectedProduct.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Material</p>
                        <p className="font-medium">{selectedProduct.material}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sport Type</p>
                        <p className="font-medium">{selectedProduct.sportType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={(e) => handleAddToCart(e, selectedProduct)}
                      className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => handleCustomize(e, selectedProduct)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <FaPalette />
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Products Grid View
          <>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Our Products
          </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover our collection of high-quality products
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button
              className="md:hidden flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? <FaTimes /> : <FaFilter />}
              {isFilterOpen ? "Close Filters" : "Show Filters"}
            </button>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
                {/* Category Filter */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`block w-full text-left px-2 py-1 rounded ${
                          selectedCategory === category.id
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-4">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
        </div>

        {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button
                      onClick={fetchProducts}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No products found matching your criteria.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((data) => (
                      <div
                        key={data._id}
                        className="rounded-2xl bg-white dark:bg-gray-800 hover:bg-black/80 dark:hover:bg-primary hover:text-white relative shadow-xl duration-300 group max-w-[280px] cursor-pointer"
              onClick={() => handleProductClick(data)}
              data-aos="fade-up"
            >
                        {/* Image Container */}
                        <div className="h-48 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                          <img
                            src={data.images?.[0] || "/placeholder-image.jpg"}
                            alt={data.name}
                            className="h-full w-full object-contain p-4 group-hover:scale-105 duration-300"
                />
              </div>
                        {/* Content Container */}
                        <div className="p-4">
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(4)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                          <h2 className="font-bold text-lg mb-2 line-clamp-1">{data.name}</h2>
                          <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2 mb-3">
                  {data.description}
                </p>
                          <p className="text-primary font-bold">${data.price}</p>
              </div>
            </div>
          ))}
        </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Products; 
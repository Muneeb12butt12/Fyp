import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    colors: [],
    sizes: [],
    img: null
  });
  const [tempColor, setTempColor] = useState("");
  const [tempSize, setTempSize] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProduct({
          ...product,
          img: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addColor = () => {
    if (tempColor && !product.colors.includes(tempColor)) {
      setProduct({
        ...product,
        colors: [...product.colors, tempColor]
      });
      setTempColor("");
    }
  };

  const removeColor = (colorToRemove) => {
    setProduct({
      ...product,
      colors: product.colors.filter(color => color !== colorToRemove)
    });
  };

  const addSize = () => {
    if (tempSize && !product.sizes.includes(tempSize)) {
      setProduct({
        ...product,
        sizes: [...product.sizes, tempSize]
      });
      setTempSize("");
    }
  };

  const removeSize = (sizeToRemove) => {
    setProduct({
      ...product,
      sizes: product.sizes.filter(size => size !== sizeToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get existing products from localStorage or use empty array
    const existingProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    const newProduct = {
      ...product,
      id: existingProducts.length + 1,
      price: parseFloat(product.price).toFixed(2)
    };
    
    const updatedProducts = [...existingProducts, newProduct];
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Navigate to products page after successful addition
    navigate('/products', { replace: true });
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Add New Product</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 border rounded-md overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary-dark"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Colors</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  placeholder="Add color"
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sizes</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tempSize}
                  onChange={(e) => setTempSize(e.target.value)}
                  placeholder="Add size"
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;
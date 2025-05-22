import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ColorizableImage = ({ src, color, className }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-atop';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', src);
      canvas.width = 500;
      canvas.height = 600;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '20px Arial';
      ctx.fillText('Product Preview', 50, 50);
    };
    
    img.src = src;
    img.crossOrigin = 'Anonymous';
  }, [src, color]);

  return <canvas ref={canvasRef} className={className} />;
};

const CustomizationPage = () => {
  const { updateCartItemCustomization, addCustomizedToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Enhanced color palette with 20 distinct colors
  const enhancedColors = [
    '#FF0000', // Red
    '#FF4500', // OrangeRed
    '#FF8C00', // DarkOrange
    '#FFA500', // Orange
    '#FFD700', // Gold
    '#FFFF00', // Yellow
    '#9ACD32', // YellowGreen
    '#00FF00', // Lime
    '#2E8B57', // SeaGreen
    '#008080', // Teal
    '#00FFFF', // Cyan
    '#1E90FF', // DodgerBlue
    '#0000FF', // Blue
    '#8A2BE2', // BlueViolet
    '#9932CC', // DarkOrchid
    '#FF00FF', // Magenta
    '#FF1493', // DeepPink
    '#C71585', // MediumVioletRed
    '#000000', // Black
    '#FFFFFF', // White
    '#808080', // Gray
    '#A0522D', // Sienna
    '#D2B48C', // Tan
    '#FFE4B5', // Moccasin
  ];

  // Default product with numeric price
  const defaultProduct = {
    id: 1,
    title: 'Custom Sports T-Shirt',
    price: 29.99,
    img: 'https://via.placeholder.com/500x600?text=T-Shirt+Preview',
    colors: enhancedColors,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'High-quality customizable t-shirt with premium fabric'
  };

  // Safely parse incoming product data
  const { productData, selectedColor: initialColor, selectedSize: initialSize, quantity: initialQuantity } = location.state || {};
  const product = productData ? {
    ...productData,
    price: parseFloat(productData.price) || defaultProduct.price
  } : defaultProduct;

  // State declarations
  const [selectedColor, setSelectedColor] = useState(initialColor || product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(initialSize || product.sizes[0]);
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoSize, setLogoSize] = useState('medium');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textPosition, setTextPosition] = useState('below-logo');
  const [totalPrice, setTotalPrice] = useState((product.price * quantity).toFixed(2));
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Logo options
  const logoOptions = [
    { id: 1, name: 'SportsX Logo', image: 'https://via.placeholder.com/200x200?text=SportsX', price: 5.99 },
    { id: 2, name: 'Team Spirit', image: 'https://via.placeholder.com/200x200?text=Team+Spirit', price: 4.99 },
    { id: 3, name: 'Athletic Star', image: 'https://via.placeholder.com/200x200?text=Athletic+Star', price: 6.99 },
    { id: 4, name: 'Custom Upload', image: 'https://via.placeholder.com/200x200?text=Upload', price: 8.99 },
  ];

  // Size options with prices
  const sizeOptions = [
    { value: 'small', label: 'Small (+$0.00)', price: 0 },
    { value: 'medium', label: 'Medium (+$1.00)', price: 1.00 },
    { value: 'large', label: 'Large (+$2.00)', price: 2.00 },
    { value: 'xlarge', label: 'X-Large (+$3.00)', price: 3.00 },
  ];

  // Text position options
  const textPositionOptions = [
    { value: 'above-logo', label: 'Above Logo' },
    { value: 'below-logo', label: 'Below Logo' },
    { value: 'left-logo', label: 'Left of Logo' },
    { value: 'right-logo', label: 'Right of Logo' },
    { value: 'no-logo', label: 'Text Only' },
  ];

  // Price calculation with proper number handling
  useEffect(() => {
    const basePrice = parseFloat(product.price) || 0;
    let price = basePrice;
    
    if (selectedLogo) price += parseFloat(selectedLogo.price) || 0;
    
    const sizeOption = sizeOptions.find(option => option.value === logoSize);
    if (sizeOption) price += parseFloat(sizeOption.price) || 0;
    
    if (customText.trim() !== '') {
      price += 2.99;
      if (customText.length > 15) price += 1.99;
    }
    
    setTotalPrice((price * quantity).toFixed(2));
  }, [product.price, selectedLogo, logoSize, customText, quantity]);

  // Draggable logo handlers
  const handleMouseDown = (e) => {
    if (!selectedLogo) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - logoPosition.x,
      y: e.clientY - logoPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLogo) return;
    
    const previewRect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - dragStart.x - previewRect.left;
    const y = e.clientY - dragStart.y - previewRect.top;
    
    const maxX = previewRect.width - (logoSize === 'small' ? 80 : 
                 logoSize === 'medium' ? 120 :
                 logoSize === 'large' ? 160 : 200);
    const maxY = previewRect.height - (logoSize === 'small' ? 80 : 
                 logoSize === 'medium' ? 120 :
                 logoSize === 'large' ? 160 : 200);
    
    setLogoPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleSaveCustomization = async (e) => {
    e.preventDefault();
    
    const customizedProduct = {
      ...product,
      selectedColor,
      selectedSize,
      quantity: parseInt(quantity) || 1,
      customization: {
        logo: selectedLogo,
        position: `${logoPosition.x},${logoPosition.y}`,
        size: logoSize,
        text: customText,
        textColor,
        textPosition,
        basePrice: parseFloat(product.price) || 0,
        finalPrice: totalPrice
      }
    };

    try {
      if (location.state?.cartItem) {
        await updateCartItemCustomization(
          location.state.cartItem.id,
          selectedColor,
          selectedSize,
          customizedProduct.customization,
          parseInt(quantity) || 1
        );
      } else {
        await addCustomizedToCart(customizedProduct);
      }
      
      navigate('/Cart', { replace: true });
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedLogo({
          id: 'custom-' + Date.now(),
          name: 'Custom Logo',
          image: event.target.result,
          price: 8.99
        });
        setLogoPosition({ x: 50, y: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customize Your {product.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Preview */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Design Preview</h2>
          <div 
            ref={previewRef}
            className="relative w-full h-96 bg-gray-100 flex items-center justify-center cursor-move rounded-md overflow-hidden"
            onMouseDown={handleMouseDown}
          >
            <ColorizableImage 
              src={product.img} 
              color={selectedColor} 
              className="absolute w-full h-full object-contain"
            />
            
            {selectedLogo && (
              <img
                src={selectedLogo.image}
                alt="Custom logo"
                className="absolute cursor-move transition-transform hover:scale-105"
                style={{
                  width: logoSize === 'small' ? '80px' : 
                         logoSize === 'medium' ? '120px' :
                         logoSize === 'large' ? '160px' : '200px',
                  left: `${logoPosition.x}px`,
                  top: `${logoPosition.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  userSelect: 'none'
                }}
                draggable="false"
              />
            )}
            
            {customText && (
              <div 
                className="absolute"
                style={{
                  color: textColor,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  top: textPosition.includes('above') ? '30%' : 
                       textPosition.includes('below') ? '50%' : '40%',
                  left: textPosition.includes('left') ? '15%' : 
                        textPosition.includes('right') ? '65%' : '40%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 15,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {customText}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">Total: ${totalPrice}</p>
              {selectedLogo && <p className="text-sm">Includes {selectedLogo.name}</p>}
            </div>
            {selectedLogo && (
              <p className="text-sm text-gray-500">Drag logo to reposition</p>
            )}
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Product Details</h3>
            <p className="text-sm mb-2">
              <span className="font-medium">Color:</span> 
              <span className="ml-1 inline-block w-4 h-4 rounded-full border border-gray-300" 
                    style={{ backgroundColor: selectedColor }}></span>
              <span className="ml-1">{selectedColor}</span>
            </p>
            <p className="text-sm mb-2"><span className="font-medium">Size:</span> {selectedSize}</p>
            <p className="text-sm mb-2"><span className="font-medium">Base Price:</span> ${product.price.toFixed(2)}</p>
            {product.description && (
              <p className="text-sm mt-2">{product.description}</p>
            )}
          </div>
        </div>
        
        {/* Customization Options */}
        <div className="space-y-6">
          {/* Color Selection */}
       {/* Color Selection */}
{/* Color Selection */}
<div className="bg-white p-6 rounded-lg shadow-lg">
  <h3 className="text-lg font-semibold mb-3">Select Color</h3>
  <div className="flex flex-wrap gap-2">
    {product.colors.map((color) => (
      <button
        key={color}
        onClick={() => setSelectedColor(color)}
        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
          selectedColor === color 
            ? 'border-black scale-110 shadow-md ring-2 ring-offset-1 ring-black' 
            : 'border-gray-200 hover:border-gray-400 hover:scale-105'
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Select color ${color}`}
        title={color}
      />
    ))}
  </div>
  <div className="mt-3 text-sm text-gray-600 flex items-center">
    <span>Selected:</span>
    <span className="ml-2 font-medium">{selectedColor}</span>
    <span 
      className="ml-2 w-4 h-4 rounded-full border border-gray-300 inline-block"
      style={{ backgroundColor: selectedColor }}
    ></span>
  </div>
</div>
          
          {/* Size Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 rounded-md transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Logo Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Add Logo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {logoOptions.map((logo) => (
                <button
                  key={logo.id}
                  onClick={() => {
                    setSelectedLogo(logo);
                    setLogoPosition({ x: 50, y: 50 });
                  }}
                  className={`p-2 border-2 rounded-lg transition-all ${
                    selectedLogo?.id === logo.id 
                      ? 'border-black bg-gray-50 scale-105' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={logo.image} 
                    alt={logo.name} 
                    className="w-full h-16 object-contain"
                  />
                  <p className="text-sm mt-1 font-medium">{logo.name}</p>
                  <p className="text-xs text-gray-500">+${logo.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Upload Your Own Logo</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-black file:text-white
                  hover:file:bg-gray-800"
              />
            </div>
            
            {selectedLogo && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Logo Size</label>
                <select
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {sizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Custom Text */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Add Custom Text</h3>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your custom text (max 30 chars)"
              className="w-full p-2 border rounded-md mb-3 focus:ring-2 focus:ring-black focus:border-transparent"
              maxLength={30}
            />
            
            {customText && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-sm">{textColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Text Position</label>
                  <select
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {textPositionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Quantity */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-r hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-l hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="text-gray-600">{quantity} × ${product.price.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 border-2 border-black bg-white text-black px-8 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleSaveCustomization}
              className="flex-1 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              {location.state?.cartItem ? 'Update Customization' : 'Add to Cart'} - ${totalPrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPage;
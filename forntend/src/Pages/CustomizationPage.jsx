import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const ColorizableImage = ({ src, color, className, filter, pattern }) => {
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
      
      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply color
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-atop';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply filter
      if (filter) {
        ctx.globalCompositeOperation = 'overlay';
        switch(filter) {
          case 'vintage':
            ctx.fillStyle = 'rgba(200, 180, 120, 0.2)';
            break;
          case 'blackAndWhite':
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);
            break;
          case 'sepia':
            ctx.fillStyle = 'rgba(112, 66, 20, 0.3)';
            break;
          case 'cool':
            ctx.fillStyle = 'rgba(0, 100, 200, 0.1)';
            break;
          case 'warm':
            ctx.fillStyle = 'rgba(255, 100, 0, 0.1)';
            break;
          default:
            break;
        }
        if (filter !== 'blackAndWhite') {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Apply pattern if exists
      if (pattern) {
        const patternImg = new Image();
        patternImg.onload = () => {
          ctx.globalCompositeOperation = 'overlay';
          const pattern = ctx.createPattern(patternImg, 'repeat');
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        patternImg.src = pattern;
      }
      
      // Add subtle shadow
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
  }, [src, color, filter, pattern]);

  return <canvas ref={canvasRef} className={className} />;
};

const CustomizationPage = () => {
  const { updateCartItemCustomization, addCustomizedToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const patternInputRef = useRef(null);
  const optionsRef = useRef(null);
  
  // Enhanced color palette
  const enhancedColors = [
    '#FF0000', '#FF4500', '#FF8C00', '#FFA500', '#FFD700', 
    '#FFFF00', '#9ACD32', '#00FF00', '#2E8B57', '#008080', 
    '#00FFFF', '#1E90FF', '#0000FF', '#8A2BE2', '#9932CC', 
    '#FF00FF', '#FF1493', '#C71585', '#000000', '#FFFFFF', 
    '#808080', '#A0522D', '#D2B48C', '#FFE4B5'
  ];

  // Fabric options
  const fabricOptions = [
    { id: 'cotton', name: 'Premium Cotton', price: 0, description: 'Soft, breathable 100% cotton' },
    { id: 'polyester', name: 'Performance Polyester', price: 4.99, description: 'Moisture-wicking and durable' },
    { id: 'blend', name: 'Cotton-Poly Blend', price: 2.99, description: 'Best of both worlds' },
    { id: 'organic', name: 'Organic Cotton', price: 7.99, description: 'Eco-friendly and soft' },
    { id: 'linen', name: 'Linen', price: 9.99, description: 'Lightweight and natural' }
  ];

  // Image filters
  const filterOptions = [
    { id: 'none', name: 'No Filter' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'blackAndWhite', name: 'Black & White' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'cool', name: 'Cool Tone' },
    { id: 'warm', name: 'Warm Tone' }
  ];

  // Pattern options - using placeholder images from a free pattern service
  const patternOptions = [
    { id: 'none', name: 'No Pattern', image: null },
    { id: 'stripes', name: 'Thin Stripes', image: 'https://www.transparenttextures.com/patterns/black-thread-light.png', price: 3.99 },
    { id: 'dots', name: 'Polka Dots', image: 'https://www.transparenttextures.com/patterns/dotted.png', price: 4.99 },
    { id: 'camo', name: 'Camouflage', image: 'https://www.transparenttextures.com/patterns/camo.png', price: 5.99 },
    { id: 'floral', name: 'Floral', image: 'https://www.transparenttextures.com/patterns/floral.png', price: 6.99 },
    { id: 'geometric', name: 'Geometric', image: 'https://www.transparenttextures.com/patterns/geometric-pattern.png', price: 5.99 }
  ];

  // Logo options - using placeholder images from a free service
  const logoOptions = [
    { id: 1, name: 'SportsX Logo', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=SportsX', price: 5.99 },
    { id: 2, name: 'Team Spirit', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Team+Spirit', price: 4.99 },
    { id: 3, name: 'Athletic Star', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Athletic+Star', price: 6.99 },
    { id: 4, name: 'Custom Upload', image: 'https://via.placeholder.com/200x200/ffffff/000000?text=Upload+Logo', price: 8.99 },
  ];

  // Default product with better placeholder image
  const defaultProduct = {
    id: 1,
    title: 'Custom Sports T-Shirt',
    price: 29.99,
    img: 'https://via.placeholder.com/800x960/ffffff/000000?text=T-Shirt+Preview',
    colors: enhancedColors,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'High-quality customizable t-shirt with premium fabric'
  };

  // Parse incoming product data
  const { productData, selectedColor: initialColor, selectedSize: initialSize, 
          quantity: initialQuantity, selectedFabric: initialFabric, selectedFilter: initialFilter,
          selectedPattern: initialPattern } = location.state || {};
  
  const product = productData ? {
    ...productData,
    price: parseFloat(productData.price) || defaultProduct.price
  } : defaultProduct;

  // State declarations
  const [selectedColor, setSelectedColor] = useState(initialColor || product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(initialSize || product.sizes[0]);
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [selectedLogo, setSelectedLogo] = useState(location.state?.selectedLogo || null);
  const [logoSize, setLogoSize] = useState(location.state?.logoSize || 'medium');
  const [customText, setCustomText] = useState(location.state?.customText || '');
  const [textColor, setTextColor] = useState(location.state?.textColor || '#000000');
  const [textPosition, setTextPosition] = useState(location.state?.textPosition || 'below-logo');
  const [totalPrice, setTotalPrice] = useState((product.price * quantity).toFixed(2));
  const [logoPosition, setLogoPosition] = useState(location.state?.logoPosition || { x: 50, y: 50 });
  const [textPositionCoords, setTextPositionCoords] = useState({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFabric, setSelectedFabric] = useState(initialFabric || fabricOptions[0].id);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'none');
  const [selectedPattern, setSelectedPattern] = useState(initialPattern || patternOptions[0]);
  const [activeTab, setActiveTab] = useState('design'); // 'design' or 'details'
  const [patternOpacity, setPatternOpacity] = useState(0.5); // New state for pattern opacity
  const [patternScale, setPatternScale] = useState(1); // New state for pattern scale

  // Draggable logo handlers
  const handleMouseDown = (e) => {
    if (!selectedLogo) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    previewRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLogo) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    setLogoPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x + (deltaX / rect.width * 100))),
      y: Math.max(0, Math.min(100, prev.y + (deltaY / rect.height * 100)))
    }));
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    previewRef.current.style.cursor = 'grab';
  };

  const handleKeyDown = (e) => {
    if (!previewRef.current.contains(document.activeElement)) return;
    
    const moveAmount = e.shiftKey ? 10 : 5;
    
    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setTextPositionCoords(prev => ({ ...prev, y: Math.max(0, prev.y - moveAmount) }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setTextPositionCoords(prev => ({ ...prev, y: Math.min(100, prev.y + moveAmount) }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setTextPositionCoords(prev => ({ ...prev, x: Math.max(0, prev.x - moveAmount) }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setTextPositionCoords(prev => ({ ...prev, x: Math.min(100, prev.x + moveAmount) }));
        break;
      default:
        break;
    }
  };

  // Price calculation
  useEffect(() => {
    const basePrice = parseFloat(product.price) || 0;
    let price = basePrice;
    
    // Add fabric cost
    const fabric = fabricOptions.find(f => f.id === selectedFabric);
    if (fabric) price += parseFloat(fabric.price) || 0;
    
    // Add logo cost
    if (selectedLogo) price += parseFloat(selectedLogo.price) || 0;
    
    // Add text cost
    if (customText.trim() !== '') {
      price += 2.99;
      if (customText.length > 15) price += 1.99;
    }
    
    // Add pattern cost
    if (selectedPattern && selectedPattern.id !== 'none') {
      price += parseFloat(selectedPattern.price) || 0;
    }
    
    setTotalPrice((price * quantity).toFixed(2));
  }, [product.price, selectedLogo, customText, quantity, selectedFabric, selectedPattern]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    const reader = new FileReader();
    reader.onload = (event) => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setSelectedLogo({
          id: `custom-${Date.now()}`,
          name: 'Custom Logo',
          image: event.target.result,
          price: 8.99
        });
        setLogoPosition({ x: 50, y: 50 });
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setIsLoading(false);
      toast.error('Failed to upload logo');
    };
    reader.readAsDataURL(file);
  };

  const handlePatternUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    const reader = new FileReader();
    reader.onload = (event) => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setSelectedPattern({
          id: `custom-${Date.now()}`,
          name: 'Custom Pattern',
          image: event.target.result,
          price: 9.99
        });
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setIsLoading(false);
      toast.error('Failed to upload pattern');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomization = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const customizationData = {
      productId: product.id,
      color: selectedColor,
      size: selectedSize,
      quantity: parseInt(quantity) || 1,
      fabric: selectedFabric,
      filter: selectedFilter,
      pattern: selectedPattern,
      patternOpacity,
      patternScale,
      logo: selectedLogo ? {
        id: selectedLogo.id,
        url: selectedLogo.image,
        position: logoPosition,
        size: logoSize
      } : null,
      text: customText ? {
        content: customText,
        color: textColor,
        position: textPositionCoords
      } : null,
      basePrice: parseFloat(product.price) || 0,
      finalPrice: totalPrice
    };

    setTimeout(() => {
      if (location.state?.cartItem) {
        updateCartItemCustomization(
          location.state.cartItem.id,
          selectedColor,
          selectedSize,
          customizationData,
          parseInt(quantity) || 1
        );
      } else {
        addCustomizedToCart({
          ...product,
          ...customizationData
        });
      }
      setIsLoading(false);
      navigate('/Cart');
      toast.success('Customization saved successfully!');
    }, 1000);
  };

  // Scroll to options when tab changes
  useEffect(() => {
    if (optionsRef.current && activeTab === 'details') {
      optionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isLoading && <LoadingSpinner />}
      
      <h1 className="text-3xl font-bold mb-6">Customize Your {product.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Preview - Larger and sticky */}
        <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4 h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-4 py-2 font-medium ${activeTab === 'design' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            >
              Design Preview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            >
              Product Details
            </button>
          </div>
          
          {activeTab === 'design' ? (
            <div 
              ref={previewRef}
              className="relative flex-1 bg-gray-100 flex items-center justify-center cursor-move rounded-md overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <ColorizableImage 
                src={product.img} 
                color={selectedColor} 
                className="absolute w-full h-full object-contain"
                filter={selectedFilter}
                pattern={selectedPattern?.image}
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
                    left: `${logoPosition.x}%`,
                    top: `${logoPosition.y}%`,
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
                    top: `${textPositionCoords.y}%`,
                    left: `${textPositionCoords.x}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 15,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {customText}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-medium">Color:</span> 
                  <span className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: selectedColor }}></span>
                  <span className="ml-1">{selectedColor}</span>
                </p>
                <p className="text-sm"><span className="font-medium">Size:</span> {selectedSize}</p>
                <p className="text-sm">
                  <span className="font-medium">Fabric:</span> {
                    fabricOptions.find(f => f.id === selectedFabric)?.name || 'Standard'
                  }
                </p>
                <p className="text-sm"><span className="font-medium">Base Price:</span> ${product.price.toFixed(2)}</p>
                {product.description && (
                  <p className="text-sm">{product.description}</p>
                )}
                
                {selectedLogo && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Custom Logo</h4>
                    <div className="flex items-center">
                      <img 
                        src={selectedLogo.image} 
                        alt="Selected logo" 
                        className="w-12 h-12 object-contain mr-3 border rounded"
                      />
                      <div>
                        <p className="text-sm">{selectedLogo.name}</p>
                        <p className="text-xs text-gray-500">Size: {logoSize}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {customText && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Custom Text</h4>
                    <p className="text-sm" style={{ color: textColor }}>{customText}</p>
                  </div>
                )}
                
                {selectedPattern && selectedPattern.id !== 'none' && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Pattern</h4>
                    <div className="flex items-center">
                      {selectedPattern.image && (
                        <img 
                          src={selectedPattern.image} 
                          alt="Selected pattern" 
                          className="w-12 h-12 object-contain mr-3 border rounded"
                        />
                      )}
                      <p className="text-sm">{selectedPattern.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Total: ${totalPrice}</p>
                {selectedLogo && <p className="text-sm">Includes {selectedLogo.name}</p>}
                {selectedPattern && selectedPattern.id !== 'none' && (
                  <p className="text-sm">With {selectedPattern.name} pattern</p>
                )}
              </div>
              {selectedLogo && (
                <p className="text-sm text-gray-500 hidden lg:block">Drag logo to reposition</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Customization Options */}
        <div ref={optionsRef} className="space-y-6">
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
          
          {/* Fabric Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Select Fabric</h3>
            <div className="grid grid-cols-2 gap-3">
              {fabricOptions.map((fabric) => (
                <button
                  key={fabric.id}
                  onClick={() => setSelectedFabric(fabric.id)}
                  className={`p-3 border rounded-md text-left transition-colors ${
                    selectedFabric === fabric.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <p className="font-medium">{fabric.name}</p>
                  <p className="text-sm text-gray-600">{fabric.description}</p>
                  {fabric.price > 0 && (
                    <p className="text-sm text-blue-600">+${fabric.price.toFixed(2)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Image Filter */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Image Filter</h3>
            <div className="grid grid-cols-3 gap-3">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`p-2 border rounded-md transition-colors ${
                    selectedFilter === filter.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Pattern Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Add Pattern</h3>
            <div className="grid grid-cols-3 gap-3">
              {patternOptions.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`p-2 border rounded-md transition-colors ${
                    selectedPattern?.id === pattern.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {pattern.image ? (
                    <img 
                      src={pattern.image} 
                      alt={pattern.name} 
                      className="w-full h-12 object-cover mb-1"
                    />
                  ) : (
                    <div className="w-full h-12 bg-gray-100 flex items-center justify-center mb-1">
                      <span>No Pattern</span>
                    </div>
                  )}
                  <p className="text-sm">{pattern.name}</p>
                  {pattern.price > 0 && (
                    <p className="text-xs text-blue-600">+${pattern.price.toFixed(2)}</p>
                  )}
                </button>
              ))}
            </div>
            
            {/* Enhanced Pattern Controls */}
            {selectedPattern && selectedPattern.id !== 'none' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pattern Opacity: {Math.round(patternOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={patternOpacity}
                    onChange={(e) => setPatternOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pattern Scale: {patternScale}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={patternScale}
                    onChange={(e) => setPatternScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Upload Your Own Pattern</label>
              <input 
                type="file" 
                ref={patternInputRef}
                accept="image/*"
                onChange={handlePatternUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-black file:text-white
                  hover:file:bg-gray-800"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
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
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            {selectedLogo && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Logo Size</label>
                  <select
                    value={logoSize}
                    onChange={(e) => setLogoSize(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="small">Small (+$0.00)</option>
                    <option value="medium">Medium (+$1.00)</option>
                    <option value="large">Large (+$2.00)</option>
                    <option value="xlarge">X-Large (+$3.00)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Logo Position</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLogoPosition({ x: 20, y: 20 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Top Left
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 50, y: 20 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Top Center
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 80, y: 20 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Top Right
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setLogoPosition({ x: 20, y: 50 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Middle Left
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 50, y: 50 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Center
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 80, y: 50 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Middle Right
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setLogoPosition({ x: 20, y: 80 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Bottom Left
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 50, y: 80 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Bottom Center
                    </button>
                    <button 
                      onClick={() => setLogoPosition({ x: 80, y: 80 })}
                      className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                    >
                      Bottom Right
                    </button>
                  </div>
                </div>
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
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 p-2 border rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Text Position</label>
                  <select
                    value={textPosition}
                    onChange={(e) => {
                      setTextPosition(e.target.value);
                      if (e.target.value === 'below-logo') {
                        setTextPositionCoords({ x: logoPosition.x, y: Math.min(100, logoPosition.y + 15) });
                      } else if (e.target.value === 'above-logo') {
                        setTextPositionCoords({ x: logoPosition.x, y: Math.max(0, logoPosition.y - 15) });
                      } else if (e.target.value === 'left-logo') {
                        setTextPositionCoords({ x: Math.max(0, logoPosition.x - 15), y: logoPosition.y });
                      } else if (e.target.value === 'right-logo') {
                        setTextPositionCoords({ x: Math.min(100, logoPosition.x + 15), y: logoPosition.y });
                      }
                    }}
                    className="w-full p-2 border rounded-md mb-2"
                  >
                    <option value="below-logo">Below Logo</option>
                    <option value="above-logo">Above Logo</option>
                    <option value="left-logo">Left of Logo</option>
                    <option value="right-logo">Right of Logo</option>
                    <option value="custom">Custom Position</option>
                  </select>
                </div>
                
                {textPosition === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Position Controls</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setTextPositionCoords(prev => ({ ...prev, y: Math.max(0, prev.y - 5) }))}
                        className="p-2 border rounded-md hover:bg-gray-100"
                        aria-label="Move text up"
                      >
                        ↑
                      </button>
                      <button 
                        onClick={() => setTextPositionCoords(prev => ({ ...prev, y: Math.min(100, prev.y + 5) }))}
                        className="p-2 border rounded-md hover:bg-gray-100"
                        aria-label="Move text down"
                      >
                        ↓
                      </button>
                      <button 
                        onClick={() => setTextPositionCoords(prev => ({ ...prev, x: Math.max(0, prev.x - 5) }))}
                        className="p-2 border rounded-md hover:bg-gray-100"
                        aria-label="Move text left"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => setTextPositionCoords(prev => ({ ...prev, x: Math.min(100, prev.x + 5) }))}
                        className="p-2 border rounded-md hover:bg-gray-100"
                        aria-label="Move text right"
                      >
                        →
                      </button>
                      <button 
                        onClick={() => setTextPositionCoords({ x: 50, y: 50 })}
                        className="p-2 border rounded-md hover:bg-gray-100 text-sm"
                        aria-label="Reset text position"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Position: X: {textPositionCoords.x}%, Y: {textPositionCoords.y}% 
                      (or use arrow keys when preview is focused)
                    </p>
                  </div>
                )}
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
          <div className="flex flex-col gap-4 sticky bottom-0 bg-white py-4 border-t">
            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 border-2 border-black bg-white text-black px-8 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSaveCustomization}
                disabled={isLoading}
                className={`flex-1 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {location.state?.cartItem ? 'Update Customization' : 'Add to Cart'} - ${totalPrice}
              </button>
            </div>
            <button
              onClick={() => navigate('/CustomizationTool', { 
                state: { 
                  productData: product,
                  selectedColor,
                  selectedSize,
                  quantity,
                  selectedLogo,
                  logoSize,
                  customText,
                  textColor,
                  textPosition,
                  logoPosition,
                  textPositionCoords,
                  selectedFabric,
                  selectedFilter,
                  selectedPattern,
                  patternOpacity,
                  patternScale
                } 
              })}
              className="w-full border-2 border-blue-600 bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Advanced Customization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPage;
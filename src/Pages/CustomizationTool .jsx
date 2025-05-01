import { useState, useRef } from 'react';
import { 
  FiUpload, FiDownload, FiTrash2, FiMove, 
  FiType, FiImage, FiScissors, FiLayers,
  FiRotateCw 
} from 'react-icons/fi';
import { FaArrowsAltH } from 'react-icons/fa';
import { ChromePicker } from 'react-color';

const CustomizationTool = () => {
  const [activeTool, setActiveTool] = useState('text');
  const [designElements, setDesignElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Product options
  const product = {
    name: "Premium Performance T-Shirt",
    colors: [
      '#FFFFFF', '#000000', '#FF0000', '#0000FF', '#00FF00',
      '#FFA500', '#800080', '#FFFF00', '#FFC0CB', '#A52A2A',
      '#008080', '#000080', '#808080', '#C0C0C0', '#FFD700'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    basePrice: 29.99
  };

  // Available tools
  const tools = [
    { id: 'text', name: 'Text', icon: <FiType /> },
    { id: 'image', name: 'Image', icon: <FiImage /> },
    { id: 'move', name: 'Move', icon: <FiMove /> },
    { id: 'cut', name: 'Cut', icon: <FiScissors /> },
    { id: 'layer', name: 'Layer', icon: <FiLayers /> },
    { id: 'rotate', name: 'Rotate', icon: <FiRotateCw /> },
    { id: 'flip', name: 'Flip', icon: <FaArrowsAltH /> },
    { id: 'delete', name: 'Delete', icon: <FiTrash2 /> }
  ];

  // Add text element
  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'Your Text Here',
      color: '#000000',
      fontSize: 24,
      fontFamily: 'Arial',
      position: { x: 50, y: 50 },
      rotation: 0,
      zIndex: designElements.length,
      isFlipped: false
    };
    setDesignElements([...designElements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          src: event.target.result,
          width: 200,
          height: 200,
          position: { x: 50, y: 50 },
          rotation: 0,
          zIndex: designElements.length,
          isFlipped: false
        };
        setDesignElements([...designElements, newElement]);
        setSelectedElement(newElement.id);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete element
  const deleteElement = () => {
    if (selectedElement) {
      setDesignElements(designElements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  // Cut element
  const cutElement = () => {
    if (selectedElement) {
      const element = designElements.find(el => el.id === selectedElement);
      if (element) {
        deleteElement();
        console.log("Element cut:", element);
      }
    }
  };

  // Rotate element
  const rotateElement = (degrees = 90) => {
    if (selectedElement) {
      setDesignElements(designElements.map(el => 
        el.id === selectedElement 
          ? {...el, rotation: (el.rotation + degrees) % 360} 
          : el
      ));
    }
  };

  // Flip element
  const flipElement = () => {
    if (selectedElement) {
      setDesignElements(designElements.map(el => 
        el.id === selectedElement 
          ? {...el, isFlipped: !el.isFlipped} 
          : el
      ));
    }
  };

  // Change layer order
  const changeLayer = (direction = 'up') => {
    if (selectedElement) {
      const elements = [...designElements];
      const index = elements.findIndex(el => el.id === selectedElement);
      
      if (direction === 'up' && index < elements.length - 1) {
        [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
      } else if (direction === 'down' && index > 0) {
        [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
      }
      
      const updated = elements.map((el, i) => ({...el, zIndex: i}));
      setDesignElements(updated);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return product.basePrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Design Your Sportswear</h1>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium">${calculateTotal()}</span>
            <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Toolbar */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-1">
          <h2 className="text-xl font-semibold mb-6">Design Tools</h2>
          
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 mb-6">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  if (tool.id === 'rotate') rotateElement();
                  if (tool.id === 'flip') flipElement();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-md ${
                  activeTool === tool.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl mb-1">{tool.icon}</span>
                <span className="text-xs">{tool.name}</span>
              </button>
            ))}
          </div>

          {activeTool === 'text' && (
            <div className="space-y-4">
              <button 
                onClick={addTextElement}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Add Text
              </button>
              {selectedElement && designElements.find(el => el.id === selectedElement)?.type === 'text' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Content</label>
                    <input 
                      type="text" 
                      value={designElements.find(el => el.id === selectedElement).content}
                      onChange={(e) => {
                        const updated = designElements.map(el => 
                          el.id === selectedElement ? {...el, content: e.target.value} : el
                        );
                        setDesignElements(updated);
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div 
                      className="w-full h-10 border rounded cursor-pointer"
                      style={{ backgroundColor: designElements.find(el => el.id === selectedElement).color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    {showColorPicker && (
                      <div className="absolute z-10 mt-1">
                        <ChromePicker
                          color={designElements.find(el => el.id === selectedElement).color}
                          onChangeComplete={(color) => {
                            const updated = designElements.map(el => 
                              el.id === selectedElement ? {...el, color: color.hex} : el
                            );
                            setDesignElements(updated);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTool === 'image' && (
            <div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
              >
                <FiUpload />
                <span>Upload Image</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {activeTool === 'cut' && (
            <button 
              onClick={cutElement}
              disabled={!selectedElement}
              className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md transition ${
                selectedElement ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiScissors />
              <span>Cut Selected</span>
            </button>
          )}

          {activeTool === 'layer' && selectedElement && (
            <div className="space-y-2">
              <button 
                onClick={() => changeLayer('up')}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
              >
                <span>Bring Forward</span>
              </button>
              <button 
                onClick={() => changeLayer('down')}
                className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
              >
                <span>Send Backward</span>
              </button>
            </div>
          )}

          {activeTool === 'delete' && (
            <button 
              onClick={deleteElement}
              disabled={!selectedElement}
              className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md transition ${
                selectedElement ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiTrash2 />
              <span>Delete Selected</span>
            </button>
          )}
        </div>

        {/* Design Canvas */}
        <div className="lg:col-span-2">
          <div 
            className="relative bg-white rounded-lg shadow-sm overflow-hidden"
            style={{ 
              height: '600px', 
              backgroundImage: 'url(https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80)', 
              backgroundSize: 'cover' 
            }}
          >
            {[...designElements].sort((a, b) => a.zIndex - b.zIndex).map(element => (
              <div 
                key={element.id}
                onClick={() => setSelectedElement(element.id)}
                className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-indigo-500' : ''}`}
                style={{
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  transform: `rotate(${element.rotation}deg) ${element.isFlipped ? 'scaleX(-1)' : ''}`,
                  ...(element.type === 'text' ? {
                    color: element.color,
                    fontSize: `${element.fontSize}px`,
                    fontFamily: element.fontFamily,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  } : {})
                }}
              >
                {element.type === 'text' ? (
                  element.content
                ) : (
                  <img 
                    src={element.src} 
                    alt="Custom design" 
                    style={{ 
                      width: `${element.width}px`, 
                      height: `${element.height}px`,
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                    }}
                    className="object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-1">
          <h2 className="text-xl font-semibold mb-6">Product Options</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className="py-2 border border-gray-200 rounded-md hover:border-gray-400 hover:bg-gray-50 transition"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center border rounded-md w-32">
                <button className="px-3 py-2 border-r hover:bg-gray-100">-</button>
                <span className="flex-1 text-center">1</span>
                <button className="px-3 py-2 border-l hover:bg-gray-100">+</button>
              </div>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition shadow-md">
              Add to Cart - ${calculateTotal()}
            </button>

            <button className="w-full flex items-center justify-center space-x-2 py-3 border border-black rounded-md hover:bg-gray-100 transition">
              <FiDownload />
              <span>Save Design</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationTool;
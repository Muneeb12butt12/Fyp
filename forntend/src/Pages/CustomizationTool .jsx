import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text as KonvaText, Group, Line, Circle, Arrow, Path, RegularPolygon } from 'react-konva';
import { useCart } from '../context/CartContext';

const AdvancedCustomizationTool = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [image, setImage] = useState(null);
  
  // Get product data from location state
  const { productData } = location.state || {};
  const product = productData || {
    id: 1,
    title: 'Custom Product',
    price: 29.99,
    img: 'https://via.placeholder.com/800x1000?text=Product+Preview'
  };

  // Tool states
  const [selectedTool, setSelectedTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempElement, setTempElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [cropCoords, setCropCoords] = useState(null);
  const [cutPath, setCutPath] = useState([]);
  const [isCutting, setIsCutting] = useState(false);
  const [filter, setFilter] = useState('none');
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [mask, setMask] = useState(null);
  const [eraserSize, setEraserSize] = useState(20);

  // Load the base image
  useEffect(() => {
    const img = new window.Image();
    img.src = product.img;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
      saveHistory([], img);
    };
  }, [product.img]);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedTool === 'select' && transformerRef.current && selectedElement) {
      transformerRef.current.nodes([selectedElement]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedElement, selectedTool]);

  // Save current state to history
  const saveHistory = (newElements, newImage = image) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: newElements, image: newImage });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setImage(state.image);
      setElements(state.elements);
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setImage(state.image);
      setElements(state.elements);
    }
  };

  // Handle stage mouse down
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    if (selectedTool === 'select') {
      const clickedElement = stage.getIntersection(pointerPos);
      setSelectedElement(clickedElement);
      return;
    }

    if (selectedTool === 'crop') {
      setCropCoords({
        x: pointerPos.x,
        y: pointerPos.y,
        width: 0,
        height: 0
      });
      return;
    }

    if (selectedTool === 'cut') {
      setIsCutting(true);
      setCutPath([pointerPos.x, pointerPos.y]);
      return;
    }

    if (selectedTool === 'brush') {
      setTempElement({
        tool: 'brush',
        points: [pointerPos.x, pointerPos.y],
        color: brushColor,
        size: brushSize
      });
      return;
    }

    if (selectedTool === 'eraser') {
      setTempElement({
        tool: 'eraser',
        points: [pointerPos.x, pointerPos.y],
        size: eraserSize
      });
      return;
    }

    if (selectedTool === 'text') {
      const newText = {
        tool: 'text',
        x: pointerPos.x,
        y: pointerPos.y,
        text: textValue,
        fontSize: 20,
        fill: textColor,
        draggable: true
      };
      setElements([...elements, newText]);
      saveHistory([...elements, newText]);
      return;
    }

    // For shape tools
    setTempElement({
      tool: selectedTool,
      x: pointerPos.x,
      y: pointerPos.y,
      width: 0,
      height: 0,
      fill: '#FF0000',
      stroke: '#000000',
      strokeWidth: 2,
      draggable: true
    });
  };

  // Handle stage mouse move
  const handleMouseMove = (e) => {
    if (!tempElement && !isCutting && !cropCoords) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    if (isCutting) {
      setCutPath([...cutPath, pointerPos.x, pointerPos.y]);
      return;
    }

    if (tempElement?.tool === 'brush' || tempElement?.tool === 'eraser') {
      setTempElement({
        ...tempElement,
        points: [...tempElement.points, pointerPos.x, pointerPos.y]
      });
      return;
    }

    if (selectedTool === 'crop' && cropCoords) {
      setCropCoords({
        ...cropCoords,
        width: pointerPos.x - cropCoords.x,
        height: pointerPos.y - cropCoords.y
      });
      return;
    }

    if (tempElement) {
      setTempElement({
        ...tempElement,
        width: pointerPos.x - tempElement.x,
        height: pointerPos.y - tempElement.y
      });
    }
  };

  // Handle stage mouse up
  const handleMouseUp = () => {
    if (isCutting) {
      applyCut();
      setIsCutting(false);
      return;
    }

    if (!tempElement && !cropCoords) return;

    if (tempElement) {
      if ((tempElement.tool === 'brush' || tempElement.tool === 'eraser') && tempElement.points.length > 2) {
        setElements([...elements, tempElement]);
        saveHistory([...elements, tempElement]);
      } else if (tempElement.tool !== 'brush' && tempElement.tool !== 'eraser') {
        setElements([...elements, tempElement]);
        saveHistory([...elements, tempElement]);
      }
    }

    if (selectedTool === 'crop' && cropCoords) {
      applyCrop();
    }

    setTempElement(null);
  };

  // Apply crop to image
  const applyCrop = () => {
    if (!cropCoords || !image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate actual crop coordinates (handles negative width/height)
    const x = cropCoords.width < 0 ? cropCoords.x + cropCoords.width : cropCoords.x;
    const y = cropCoords.height < 0 ? cropCoords.y + cropCoords.height : cropCoords.y;
    const width = Math.abs(cropCoords.width);
    const height = Math.abs(cropCoords.height);

    // Set canvas dimensions to crop size
    canvas.width = width;
    canvas.height = height;
    
    // Draw the cropped portion
    ctx.drawImage(
      image,
      x, y, width, height, // source rectangle
      0, 0, width, height  // destination rectangle
    );
    
    // Create new image from cropped canvas
    const newImage = new window.Image();
    newImage.src = canvas.toDataURL();
    newImage.onload = () => {
      setImage(newImage);
      saveHistory(elements, newImage);
      setCropCoords(null);
    };
  };

  // Apply cut path to image
  const applyCut = () => {
    if (cutPath.length < 6 || !image) return; // Need at least 3 points to form a shape

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Create clipping path
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(cutPath[0], cutPath[1]);
    
    for (let i = 2; i < cutPath.length; i += 2) {
      ctx.lineTo(cutPath[i], cutPath[i + 1]);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Create new image from cut canvas
    const newImage = new window.Image();
    newImage.src = canvas.toDataURL();
    newImage.onload = () => {
      setImage(newImage);
      saveHistory(elements, newImage);
      setCutPath([]);
    };
  };

  // Apply mask to image
  const applyMask = () => {
    if (!mask || !image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Apply mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    
    // Create new image from masked canvas
    const newImage = new window.Image();
    newImage.src = canvas.toDataURL();
    newImage.onload = () => {
      setImage(newImage);
      saveHistory(elements, newImage);
    };
  };

  // Apply filter to image
  const applyFilter = () => {
    if (!image) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
    `;
    ctx.drawImage(image, 0, 0);
    
    if (filter === 'grayscale') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (filter === 'sepia') {
      ctx.fillStyle = 'rgba(112, 66, 20, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (filter === 'invert') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx.putImageData(imageData, 0, 0);
    }
    
    const newImage = new window.Image();
    newImage.src = canvas.toDataURL();
    newImage.onload = () => {
      setImage(newImage);
      saveHistory(elements, newImage);
    };
  };

  // Rotate image
  const rotateImage = (degrees) => {
    if (!image) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Adjust canvas size to fit rotated image
    const rad = degrees * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    canvas.width = image.height * sin + image.width * cos;
    canvas.height = image.height * cos + image.width * sin;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    
    const newImage = new window.Image();
    newImage.src = canvas.toDataURL();
    newImage.onload = () => {
      setImage(newImage);
      saveHistory(elements, newImage);
      setRotation(degrees);
    };
  };

  // Handle mask upload
  const handleMaskUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          setMask(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Render elements based on their type
  const renderElement = (element, index) => {
    switch (element.tool) {
      case 'rectangle':
        return (
          <Rect
            key={index}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            draggable={element.draggable}
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'circle':
        return (
          <Circle
            key={index}
            x={element.x}
            y={element.y}
            radius={Math.max(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            draggable={element.draggable}
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'line':
        return (
          <Line
            key={index}
            points={[element.x, element.y, element.x + element.width, element.y + element.height]}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            draggable={element.draggable}
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={index}
            points={[element.x, element.y, element.x + element.width, element.y + element.height]}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            fill={element.stroke}
            draggable={element.draggable}
            pointerLength={10}
            pointerWidth={10}
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'brush':
        return (
          <Line
            key={index}
            points={element.points}
            stroke={element.color}
            strokeWidth={element.size}
            lineCap="round"
            lineJoin="round"
            tension={0.1}
            globalCompositeOperation="source-over"
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'eraser':
        return (
          <Line
            key={index}
            points={element.points}
            stroke="white"
            strokeWidth={element.size}
            lineCap="round"
            lineJoin="round"
            tension={0.1}
            globalCompositeOperation="destination-out"
            onClick={() => setSelectedElement(element)}
          />
        );
      case 'text':
        return (
          <KonvaText
            key={index}
            x={element.x}
            y={element.y}
            text={element.text}
            fontSize={element.fontSize}
            fill={element.fill}
            draggable={element.draggable}
            onClick={() => setSelectedElement(element)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Customization Tool</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Canvas Area */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-lg">
          <div className="border-2 border-gray-300 rounded-md overflow-hidden">
            <Stage
              ref={stageRef}
              width={800}
              height={800}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {/* Base Image with filters */}
                {image && (
                  <Group
                    opacity={opacity / 100}
                    rotation={rotation}
                  >
                    <KonvaImage
                      image={image}
                      width={800}
                      height={800}
                    />
                  </Group>
                )}
                
                {/* Crop Rectangle */}
                {cropCoords && (
                  <Rect
                    x={cropCoords.x}
                    y={cropCoords.y}
                    width={cropCoords.width}
                    height={cropCoords.height}
                    stroke="red"
                    strokeWidth={2}
                    dash={[5, 5]}
                    fill="rgba(0,0,0,0.2)"
                  />
                )}

                {/* Cut Path */}
                {isCutting && cutPath.length > 0 && (
                  <Line
                    points={cutPath}
                    stroke="red"
                    strokeWidth={2}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}

                {/* Render all elements */}
                {elements.map((element, index) => renderElement(element, index))}

                {/* Render temporary element (while drawing) */}
                {tempElement && renderElement(tempElement, 'temp')}

                {/* Transformer for selected elements */}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limit resize to keep proportions
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>

          {/* Canvas Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Redo
            </button>
            <button
              onClick={() => {
                setElements([]);
                saveHistory([]);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          
          {/* Tool Selection */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {['select', 'brush', 'eraser', 'text', 'rectangle', 'circle', 'line', 'arrow', 'crop', 'cut'].map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={`p-2 rounded ${selectedTool === tool ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                title={tool.charAt(0).toUpperCase() + tool.slice(1)}
              >
                {tool === 'select' && '✏️'}
                {tool === 'brush' && '🖌️'}
                {tool === 'eraser' && '🧽'}
                {tool === 'text' && '🔤'}
                {tool === 'rectangle' && '⬜'}
                {tool === 'circle' && '⭕'}
                {tool === 'line' && '📏'}
                {tool === 'arrow' && '➡️'}
                {tool === 'crop' && '✂️'}
                {tool === 'cut' && '🔪'}
              </button>
            ))}
          </div>

          {/* Tool Options */}
          <div className="space-y-4">
            {selectedTool === 'text' && (
              <div>
                <h3 className="font-medium mb-2">Text Options</h3>
                <input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter text"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full mt-2"
                />
              </div>
            )}

            {(selectedTool === 'brush' || selectedTool === 'eraser') && (
              <div>
                <h3 className="font-medium mb-2">
                  {selectedTool === 'brush' ? 'Brush' : 'Eraser'} Options
                </h3>
                <div className="flex items-center gap-2">
                  <span>Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={selectedTool === 'brush' ? brushSize : eraserSize}
                    onChange={(e) =>
                      selectedTool === 'brush'
                        ? setBrushSize(parseInt(e.target.value))
                        : setEraserSize(parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                </div>
                {selectedTool === 'brush' && (
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full mt-2"
                  />
                )}
              </div>
            )}

            {/* Image Adjustment Options */}
            <div>
              <h3 className="font-medium mb-2">Image Adjustments</h3>
              <div className="space-y-2">
                <div>
                  <label className="block">Opacity: {opacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Rotation: {rotation}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => rotateImage(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Brightness: {brightness}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Contrast: {contrast}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Saturation: {saturation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block">Blur: {blur}px</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={(e) => setBlur(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="none">No Filter</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="sepia">Sepia</option>
                  <option value="invert">Invert</option>
                </select>
                <button
                  onClick={applyFilter}
                  className="w-full py-2 bg-blue-500 text-white rounded"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Mask Upload */}
            <div>
              <h3 className="font-medium mb-2">Mask</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleMaskUpload}
                className="w-full text-sm"
              />
              {mask && (
                <button
                  onClick={applyMask}
                  className="w-full mt-2 py-2 bg-blue-500 text-white rounded"
                >
                  Apply Mask
                </button>
              )}
            </div>

            {/* Save/Export Options */}
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  // Save current design to cart
                  const dataURL = stageRef.current.toDataURL();
                  // You would typically use your cart context here
                  alert('Design saved!');
                }}
                className="w-full py-2 bg-green-500 text-white rounded mb-2"
              >
                Save Design
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-gray-500 text-white rounded"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCustomizationTool;
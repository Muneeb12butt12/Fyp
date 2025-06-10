import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Text as KonvaText, Group, Line, Circle, Arrow } from 'react-konva';
import { useCart } from '../context/CartContext';

const AdvancedCustomizationTool = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  
  // Image state with dimensions and scale
  const [image, setImage] = useState({
    img: null,
    width: 0,
    height: 0,
    scale: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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
  const [shapeFillColor, setShapeFillColor] = useState('#FF0000');
const [shapeStrokeColor, setShapeStrokeColor] = useState('#000000');
  const [eraserSize, setEraserSize] = useState(20);
  const [coloredRegions, setColoredRegions] = useState([]);
  const [regionColor, setRegionColor] = useState('#FF0000');
  const [regionOpacity, setRegionOpacity] = useState(50);
  const [showShapes, setShowShapes] = useState(false); // New state for showing shapes
useEffect(() => {
  if (!transformerRef.current) return;
  
  if (selectedTool === 'select' && selectedElement) {
    // Only update if the node is different
    const nodes = transformerRef.current.nodes();
    if (!nodes.includes(selectedElement)) {
      transformerRef.current.nodes([selectedElement]);
      transformerRef.current.getLayer().batchDraw();
    }
  } else {
    transformerRef.current.nodes([]);
  }
}, [selectedElement, selectedTool]);
  // Load the base image
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    
    const img = new window.Image();
    img.src = product.img;
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      setIsLoading(false);
      // Calculate scale to fit 800x800 container
      const scale = Math.min(
        800 / img.width,
        800 / img.height
      );
      
      setImage({
        img: img,
        width: img.width * scale,
        height: img.height * scale,
        scale: scale
      });
      saveHistory([], {
        img: img,
        width: img.width * scale,
        height: img.height * scale,
        scale: scale
      });
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setLoadError(true);
      // Fallback to placeholder if main image fails
      const fallbackImg = new window.Image();
      fallbackImg.src = 'https://via.placeholder.com/800x800?text=Product+Image';
      fallbackImg.onload = () => {
        setImage({
          img: fallbackImg,
          width: 800,
          height: 800,
          scale: 1
        });
        saveHistory([], {
          img: fallbackImg,
          width: 800,
          height: 800,
          scale: 1
        });
      };
    };
  }, [product.img]);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedTool === 'select' && transformerRef.current && selectedElement) {
      // Make sure we're only transforming the actual element, not a copy
      transformerRef.current.nodes([selectedElement]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedElement, selectedTool, elements]); 

  // Save current state to history
  const saveHistory = (newElements, newImage = image) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: newElements, image: newImage });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Update element position after drag
  const updateElementPosition = (index, newPosition) => {
    const newElements = [...elements];
    newElements[index] = {
      ...newElements[index],
      ...newPosition
    };
    setElements(newElements);
    saveHistory(newElements);
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

    if (selectedTool === 'color-region') {
      // Start a new colored region
      setTempElement({
        tool: 'color-region',
        points: [pointerPos.x, pointerPos.y],
        color: regionColor,
        opacity: regionOpacity
      });
      return;
    }

    // For shape tools
    setTempElement({
      tool: selectedTool,
      x: pointerPos.x,
      y: pointerPos.y,
      width: 1, // Start with minimum width
      height: 1, // Start with minimum height
      fill: shapeFillColor,
      stroke: shapeStrokeColor,
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
  
    if (tempElement?.tool === 'brush' || tempElement?.tool === 'eraser' || tempElement?.tool === 'color-region') {
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
      const newWidth = pointerPos.x - tempElement.x;
      const newHeight = pointerPos.y - tempElement.y;
      
      setTempElement({
        ...tempElement,
        width: Math.max(1, Math.abs(newWidth)),
        height: Math.max(1, Math.abs(newHeight))
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
      if ((tempElement.tool === 'brush' || tempElement.tool === 'eraser' || tempElement.tool === 'color-region')) {
        // Only save if we have enough points (more than just the initial point)
        if (tempElement.points.length > 2) {
          const newElements = [...elements, tempElement];
          setElements(newElements);
          saveHistory(newElements);
        }
      } else {
        // For shapes
        const newElement = {
          ...tempElement,
          fill: shapeFillColor,
          stroke: shapeStrokeColor
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        saveHistory(newElements);
      }
    }
  
    if (selectedTool === 'crop' && cropCoords) {
      applyCrop();
    }
  
    setTempElement(null);
  };

  // Apply crop to image
  const applyCrop = () => {
    if (!cropCoords || !image.img) return;

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
      image.img,
      x, y, width, height, // source rectangle
      0, 0, width, height  // destination rectangle
    );
    
    // Create new image from cropped canvas
    const newImg = new window.Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      const scale = Math.min(800 / newImg.width, 800 / newImg.height);
      setImage({
        img: newImg,
        width: newImg.width * scale,
        height: newImg.height * scale,
        scale: scale
      });
      saveHistory(elements, {
        img: newImg,
        width: newImg.width * scale,
        height: newImg.height * scale,
        scale: scale
      });
      setCropCoords(null);
    };
  };

  // Apply cut path to image
  const applyCut = () => {
    if (cutPath.length < 6 || !image.img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image.img, 0, 0, image.width, image.height);
    
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
    const newImg = new window.Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setImage({
        ...image,
        img: newImg
      });
      saveHistory(elements, {
        ...image,
        img: newImg
      });
      setCutPath([]);
    };
  };

  // Apply color to selected region
  const applyRegionColor = (newRegion, allRegions = coloredRegions) => {
    if (!image.img) return;
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image.img, 0, 0, image.width, image.height);
    
    // Apply all colored regions
    ctx.globalCompositeOperation = 'source-atop';
    allRegions.forEach(region => {
      ctx.fillStyle = region.color;
      ctx.globalAlpha = region.opacity / 100;
      ctx.beginPath();
      ctx.moveTo(region.points[0], region.points[1]);
      
      for (let i = 2; i < region.points.length; i += 2) {
        ctx.lineTo(region.points[i], region.points[i + 1]);
      }
      
      ctx.closePath();
      ctx.fill();
    });
    
    // Create new image with colored regions
    const newImg = new window.Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setImage({
        ...image,
        img: newImg
      });
      saveHistory(elements, {
        ...image,
        img: newImg
      });
    };
  };

  // Apply mask to image
  const applyMask = () => {
    if (!mask || !image.img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.drawImage(image.img, 0, 0, image.width, image.height);
    
    // Apply mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, image.width, image.height);
    
    // Create new image from masked canvas
    const newImg = new window.Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setImage({
        ...image,
        img: newImg
      });
      saveHistory(elements, {
        ...image,
        img: newImg
      });
    };
  };

  // Apply filter to image
  const applyFilter = () => {
    if (!image.img) return;
    
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
    ctx.drawImage(image.img, 0, 0, image.width, image.height);
    
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
    
    const newImg = new window.Image();
    newImg.src = canvas.toDataURL();
    newImg.onload = () => {
      setImage({
        ...image,
        img: newImg
      });
      saveHistory(elements, {
        ...image,
        img: newImg
      });
    };
  };

  // Rotate image
  const rotateImage = (degrees) => {
    setRotation(degrees);
    // We apply rotation during render, no need to modify image
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
  const renderElement = (element, index, updateElementPosition) => {
    const commonProps = {
      key: index,
      draggable: selectedTool === 'select',
      onClick: () => {
        if (selectedTool === 'select') {
          setSelectedElement(element);
        }
      },
      onDragEnd: (e) => {
        updateElementPosition(index, {
          x: e.target.x(),
          y: e.target.y()
        });
      }
    };
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
            onDragEnd={(e) => {
              updateElementPosition(index, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
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
            onDragEnd={(e) => {
              updateElementPosition(index, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
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
            onDragEnd={(e) => {
              updateElementPosition(index, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
          />
        );
        case 'color-region':
  return (
    <Line
      {...commonProps}
      points={element.points}
      stroke={element.color}
      strokeWidth={5}
      opacity={element.opacity / 100}
      lineCap="round"
      lineJoin="round"
      tension={0.5}
      closed
      fill={element.color}
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
            onDragEnd={(e) => {
              updateElementPosition(index, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
          />
        );
        case 'brush':
          return (
            <Line
              {...commonProps}
              points={element.points}
              stroke={element.color}
              strokeWidth={element.size}
              lineCap="round"
              lineJoin="round"
              tension={0.1}
              globalCompositeOperation="source-over"
            />
          );
        case 'eraser':
          return (
            <Line
              {...commonProps}
              points={element.points}
              stroke="white"
              strokeWidth={element.size}
              lineCap="round"
              lineJoin="round"
              tension={0.1}
              globalCompositeOperation="destination-out"
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
            onDragEnd={(e) => {
              updateElementPosition(index, {
                x: e.target.x(),
                y: e.target.y()
              });
            }}
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
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-lg">Loading image...</div>
            </div>
          )}
          
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
              <div className="text-lg text-red-600">Failed to load image</div>
            </div>
          )}
          
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
                {image.img && (
                  <Group
                    x={400}
                    y={400}
                    offsetX={image.width / 2}
                    offsetY={image.height / 2}
                    rotation={rotation}
                    opacity={opacity / 100}
                  >
                    <KonvaImage
                      image={image.img}
                      width={image.width}
                      height={image.height}
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

                {/* Temporary colored region while drawing */}
                {tempElement?.tool === 'color-region' && (
                  <Line
                    points={tempElement.points}
                    stroke={tempElement.color}
                    strokeWidth={5}
                    opacity={tempElement.opacity / 100}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.5}
                    closed
                    fill={tempElement.color}
                  />
                )}

                {/* Render all elements */}
              {elements.map((element, index) => 
  renderElement(element, index, updateElementPosition)
)}

{/* Render temporary element (while drawing) */}
{tempElement && tempElement.tool !== 'color-region' && 
  renderElement(tempElement, 'temp', updateElementPosition)}

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
                setColoredRegions([]);
                saveHistory([]);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                rotateImage(0);
                setOpacity(100);
                setBrightness(100);
                setContrast(100);
                setSaturation(100);
                setBlur(0);
                setFilter('none');
              }}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Tools Panel */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          
          {/* Tool Selection */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {['select', 'brush', 'eraser', 'text', 'crop', 'cut', 'color-region'].map((tool) => (
              <button
                key={tool}
                onClick={() => {
                  setSelectedTool(tool);
                  setSelectedElement(null); // Clear selection when switching tools
                }}
                className={`p-2 rounded ${selectedTool === tool ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                title={tool.charAt(0).toUpperCase() + tool.slice(1)}
              >
                {tool === 'select' && '✏️'}
                {tool === 'brush' && '🖌️'}
                {tool === 'eraser' && '🧽'}
                {tool === 'text' && '🔤'}
                {tool === 'crop' && '✂️'}
                {tool === 'cut' && '🔪'}
                {tool === 'color-region' && '🎨'}
              </button>
            ))}
            
            {/* Shapes dropdown button */}
            <button
              onClick={() => setShowShapes(!showShapes)}
              className={`p-2 rounded ${showShapes ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              title="Shapes"
            >
              {showShapes ? '⬆️' : '⬇️'} Shapes
            </button>
            
            {/* Shapes tools (shown when showShapes is true) */}
            {showShapes && (
              <>
                {['rectangle', 'circle', 'line', 'arrow'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`p-2 rounded ${selectedTool === tool ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                  >
                    {tool === 'rectangle' && '⬜'}
                    {tool === 'circle' && '⭕'}
                    {tool === 'line' && '📏'}
                    {tool === 'arrow' && '➡️'}
                  </button>
                ))}
              </>
            )}
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

            {selectedTool === 'color-region' && (
              <div>
                <h3 className="font-medium mb-2">Color Region Options</h3>
                <input
                  type="color"
                  value={regionColor}
                  onChange={(e) => setRegionColor(e.target.value)}
                  className="w-full"
                />
                <div className="mt-2">
                  <label className="block">Opacity: {regionOpacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={regionOpacity}
                    onChange={(e) => setRegionOpacity(e.target.value)}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    if (tempElement) {
                      applyRegionColor(tempElement);
                    }
                  }}
                  className="w-full mt-2 py-2 bg-blue-500 text-white rounded"
                >
                  Apply Color
                </button>
              </div>
            )}

            {/* Shape Options */}
            {(selectedTool === 'rectangle' || selectedTool === 'circle' || selectedTool === 'line' || selectedTool === 'arrow') && (
  <div>
    <h3 className="font-medium mb-2">Shape Options</h3>
    <div className="flex gap-2">
      <div>
        <label className="block text-sm">Fill Color</label>
        <input
          type="color"
          value={shapeFillColor}
          onChange={(e) => setShapeFillColor(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm">Stroke Color</label>
        <input
          type="color"
          value={shapeStrokeColor}
          onChange={(e) => setShapeStrokeColor(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
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
                    step="1"
                    value={rotation}
                    onChange={(e) => rotateImage(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <button
                    onClick={() => rotateImage(0)}
                    className="w-full mt-1 py-1 bg-gray-200 rounded"
                  >
                    Reset Rotation
                  </button>
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
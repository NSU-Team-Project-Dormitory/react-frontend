import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';
import Popup from './Popup';
import FloorList from './FloorList';
import CheckboxList from './CheckBoxList';
import colorizeRect from './colorizeRect';

const Rooms = () => {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [popupData, setPopupData] = useState(null);
  const svgContainerRef = useRef(null);
  const [uploadedFloors, setUploadedFloors] = useState({});
  const [uploadedImages, setUploadedImages] = useState({});
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [roomNames, setRoomNames] = useState({});
  const [filters, setFilters] = useState({
    smallRoom: false,
    largeRoom: false,
  });
  const [svgOpacity, setSvgOpacity] = useState(100);
  const [imageWidth, setImageWidth] = useState(100); // State for PNG image width
  const [imageHeight, setImageHeight] = useState(100); // State for PNG image height
  const [initialImageWidth, setInitialImageWidth] = useState(100); // State for initial PNG image width
  const [initialImageHeight, setInitialImageHeight] = useState(100); // State for initial PNG image height
  const [isDragging, setIsDragging] = useState(false); // State for dragging
  const [imagePosition, setImagePosition] = useState({ top: '50%', left: '50%' }); // State for PNG position
  const [initialImagePosition, setInitialImagePosition] = useState({ top: '50%', left: '50%' }); // State for initial PNG position
  const [isPngVisible, setIsPngVisible] = useState(true); // State for PNG visibility

  useEffect(() => {
    const floorPlans = ['floor1.svg', 'floor2.svg', 'floor3.svg'];
    setFloors(floorPlans);
  }, []);

  // Handle resizing the PNG image
  const handleIncreaseWidth = () => {
    setImageWidth(prevWidth => prevWidth * 1.03);
    setImageHeight(prevHeight => prevHeight * 1.03); // Simultaneously increase height
  };

  const handleDecreaseWidth = () => {
    setImageWidth(prevWidth => prevWidth * 0.97);
    setImageHeight(prevHeight => prevHeight * 0.97); // Simultaneously decrease height
  };

  const handleIncreaseHeight = () => {
    setImageHeight(prevHeight => prevHeight * 1.03);
    setImageWidth(prevWidth => prevWidth * 1.03); // Simultaneously increase width
  };

  const handleDecreaseHeight = () => {
    setImageHeight(prevHeight => prevHeight * 0.97);
    setImageWidth(prevWidth => prevWidth * 0.97); // Simultaneously decrease width
  };

  const handleResetSize = () => {

    setImageWidth(initialImageWidth);
    setImageHeight(initialImageHeight);
    setImagePosition(initialImagePosition);

  };

  useEffect(() => {
    if (svgContainerRef.current) {
      svgContainerRef.current.style.opacity = svgOpacity / 100;
    }
  }, [svgOpacity]);

  useEffect(() => {
    if (selectedFloor) {
      if (uploadedFloors[selectedFloor]) {
        setSvgContent(uploadedFloors[selectedFloor]);
      } else {
        let extension = selectedFloor.split('.').pop();
        if (extension === 'svg') {
          fetch(`${process.env.PUBLIC_URL}/plans/${selectedFloor}`)
            .then((response) => response.text())
            .then((data) => {
              setSvgContent(data);
            });
        }
      }
    }
  }, [selectedFloor, uploadedFloors]);

  useEffect(() => {
    if (svgContent.trim() === '') {
      return;
    }

    let modifiedSvg = svgContent;
    if (filters.smallRoom) {
      modifiedSvg = colorizeRect(modifiedSvg, 'rect[id^="m"]', 'yellow');
    } else {
      modifiedSvg = colorizeRect(modifiedSvg, 'rect[id^="m"]', '#A5A5A5');
    }

    if (filters.largeRoom) {
      modifiedSvg = colorizeRect(modifiedSvg, 'rect[id^="b"]', 'pink');
    } else {
      modifiedSvg = colorizeRect(modifiedSvg, 'rect[id^="b"]', '#A5A5A5');
    }

    setSvgContent(modifiedSvg);
  }, [svgContent, filters]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleRoomClick = async (event) => {
    const rectElement = event.target.closest('rect');
    if (rectElement) {
      const rectId = rectElement.id;
      const rectPosition = rectElement.getBoundingClientRect();
      const containerPosition = svgContainerRef.current.getBoundingClientRect();
      const x = rectPosition.left - containerPosition.left + rectPosition.width / 2;
      const y = rectPosition.top - containerPosition.top + rectPosition.height / 2;

      const queryParameters = new URLSearchParams({
        RoomTitle: rectId.toString(),
      }).toString();

      const url = `${apiUrl}/Residents/GetResidentsByRoomTitle?${queryParameters}`;
      
      try {
        const response = await fetch(url);
        console.log('Response status:', response.status);
        if (response.ok) {
          const res = await response.json();
          console.log(res.residents);
          setPopupData({ rectId, position: { x, y }, residents: res.residents });
        } else {
          console.log("No residents");
          setPopupData({ rectId, position: { x, y }, residents: [] });
        }  
      } catch (e) {
        setPopupData({ rectId, position: {x, y} });
      }
      
    } else {
      setPopupData(null);
    }
  };

  const handleClickOutside = (event) => {
    if (svgContainerRef.current && !svgContainerRef.current.contains(event.target)) {
      setPopupData(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleAddFloor = () => {
    fileInputRef.current.click();
  };

  const handleAddImage = () => {
    imageInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = function (e) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(e.target.result, 'image/svg+xml');
        const roomElements = doc.querySelectorAll('rect[id^="m"], rect[id^="b"]');
        const newRoomNames = {};
        roomElements.forEach((room) => {
          newRoomNames[room.id] = room.id;
        });
        const newFloor = {
          name: file.name,
          content: e.target.result,
          svgWidth: doc.documentElement.getAttribute('width'),
          svgHeight: doc.documentElement.getAttribute('height'),
        };
        setFloors((prevFloors) => [...prevFloors, newFloor.name]);
        setUploadedFloors((prevUploadedFloors) => ({
          ...prevUploadedFloors,
          [newFloor.name]: newFloor.content,
        }));
        setRoomNames(newRoomNames);
        setSvgContent(newFloor.content);
        setSelectedFloor(newFloor.name);

        // Scale SVG to fit within container
        scaleSvgToFit(doc.documentElement.getAttribute('width'), doc.documentElement.getAttribute('height'));
      };
      reader.readAsText(file);
    } else {
      alert('Please upload an SVG file.');
    }
  };

  const scaleSvgToFit = (svgWidth, svgHeight) => {
    if (!svgContainerRef.current || !svgWidth || !svgHeight) return;

    const containerWidth = svgContainerRef.current.clientWidth;
    const containerHeight = svgContainerRef.current.clientHeight;

    const widthRatio = containerWidth / svgWidth;
    const heightRatio = containerHeight / svgHeight;
    const scaleFactor = Math.min(widthRatio, heightRatio);

    const scaledWidth = svgWidth * scaleFactor;
    const scaledHeight = svgHeight * scaleFactor;

    svgContainerRef.current.style.width = `${scaledWidth}px`;
    svgContainerRef.current.style.height = `${scaledHeight}px`;
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleSaveRoomName = (rectId, name) => {
    setRoomNames((prevRoomNames) => ({
      ...prevRoomNames,
      [rectId]: name,
    }));
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const roomElement = doc.getElementById(rectId);
    if (roomElement) {
      const titleElement = doc.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleElement.textContent = name;
      roomElement.appendChild(titleElement);

      const serializer = new XMLSerializer();
      const updatedSvgContent = serializer.serializeToString(doc);
      setSvgContent(updatedSvgContent);

      setUploadedFloors((prevUploadedFloors) => ({
        ...prevUploadedFloors,
        [selectedFloor]: updatedSvgContent,
      }));
    }
  };

  const handleSvgOpacityChange = (event) => {
    const newOpacity = Number(event.target.value);
    setSvgOpacity(newOpacity);
    if (svgContainerRef.current) {
      svgContainerRef.current.style.opacity = newOpacity / 100;
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.includes('image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = svgContainerRef.current.clientWidth;
          const maxHeight = svgContainerRef.current.clientHeight;

          let scaleFactor = 1;
          if (img.width > maxWidth || img.height > maxHeight) {
            const widthScale = maxWidth / img.width;
            const heightScale = maxHeight / img.height;
            scaleFactor = Math.min(widthScale, heightScale);
          }

          setImageWidth(img.width * scaleFactor);
          setImageHeight(img.height * scaleFactor);

          // Store the initial values
          setInitialImageWidth(img.width * scaleFactor);
          setInitialImageHeight(img.height * scaleFactor);
          setInitialImagePosition({ top: '50%', left: '50%' });

          setUploadedImages((prevUploadedImages) => ({
            ...prevUploadedImages,
            [selectedFloor]: e.target.result,
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (event) => {
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
  };

  const handleDrag = (event) => {
    if (isDragging) {
      const containerRect = svgContainerRef.current.getBoundingClientRect();
      const newLeft = event.clientX - containerRect.left;
      const newTop = event.clientY - containerRect.top;
      setImagePosition({ top: `${newTop}px`, left: `${newLeft}px` });
    }
  };

  const handlePngVisibilityChange = () => {
    setIsPngVisible(!isPngVisible);
  };

  return (
    <div className="App" onMouseMove={handleDrag} onMouseUp={handleDragEnd}>
      <div className="sidebar">
        <FloorList floors={floors} onSelectFloor={setSelectedFloor} />
        <button onClick={handleAddFloor}>Add Floor Plan</button>
        <button onClick={handleAddImage}>Add PNG</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".svg"
        />
        <input
          type="range"
          min="0"
          max="100"
          value={svgOpacity}
          onChange={handleSvgOpacityChange}
        />
        <input
          type="file"
          accept="image/png"
          ref={imageInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <CheckboxList onChange={handleCheckboxChange} />
        <div>
          <button onClick={handleIncreaseWidth}>Increase PNG size</button>
          <button onClick={handleDecreaseWidth}>Decrease PNG size</button>

          <button onClick={handleResetSize}>Reset PNG Size</button>
        </div>
        <div>
          <button onMouseDown={handleDragStart} onMouseUp={handleDragEnd}>
            Move PNG
          </button>
        </div>
        <div>
          <input
            type="checkbox"
            checked={isPngVisible}
            onChange={handlePngVisibilityChange}
          />
          <label>{isPngVisible ? 'Hide PNG' : 'Show PNG'}</label>
        </div>
      </div>
      <div className="main-content">
        <div
          className="image-container"
          style={{ position: 'relative', width: '100%', height: '100%', background: 'grey', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          {isPngVisible && uploadedImages[selectedFloor] && (
            <img
              src={uploadedImages[selectedFloor]}
              alt="overlay"
              style={{
                position: 'absolute',
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                top: imagePosition.top,
                left: imagePosition.left,
                transform: 'translate(-50%, -50%)',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
            />
          )}

          <div
            className="svg-container"
            ref={svgContainerRef}
            onClick={handleRoomClick}
            style={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: 'translate(-50%, -50%)', // Center the SVG
              top: '50%', 
              left: '50%',
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />

        </div>
        {popupData && (
            <Popup
                rectId={popupData.rectId}
                position={popupData.position}
                residents={popupData.residents}
                onClose={() => setPopupData(null)}
                onSave={handleSaveRoomName}
            />
        )}
      </div>
    </div>
  );
};

export default Rooms;

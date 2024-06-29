import React, { useEffect, useState, useRef } from 'react';
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
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: '100%', height: '100%' });
  const [resizeCorner, setResizeCorner] = useState(null);
  const [startResize, setStartResize] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const floorPlans = ['floor1.svg', 'floor2.svg', 'floor3.svg'];
    setFloors(floorPlans);
  }, []);

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

  const handleRoomClick = (event) => {
    const rectElement = event.target.closest('rect');
    if (rectElement) {
      const rectId = rectElement.id;
      const rectPosition = rectElement.getBoundingClientRect();
      const containerPosition = svgContainerRef.current.getBoundingClientRect();
      const x = rectPosition.left - containerPosition.left + rectPosition.width / 2;
      const y = rectPosition.top - containerPosition.top + rectPosition.height / 2;

      setPopupData({ rectId, position: { x, y } });
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
      reader.onload = function(e) {
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
        };
        setFloors(prevFloors => [...prevFloors, newFloor.name]);
        setUploadedFloors(prevUploadedFloors => ({
          ...prevUploadedFloors,
          [newFloor.name]: newFloor.content,
        }));
        setRoomNames(newRoomNames);
        setSvgContent(newFloor.content);
        setSelectedFloor(newFloor.name);
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, загрузите файл в формате SVG.');
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleSaveRoomName = (rectId, name) => {
    setRoomNames(prevRoomNames => ({
      ...prevRoomNames,
      [rectId]: name,
    }));

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const roomElement = doc.getElementById(rectId);

    if (roomElement) {
      roomElement.setAttribute("data-name", name);
      const titleElement = doc.createElementNS(doc.documentElement.namespaceURI, "title");
      titleElement.textContent = name;
      roomElement.appendChild(titleElement);

      const serializer = new XMLSerializer();
      const updatedSvgContent = serializer.serializeToString(doc);
      setSvgContent(updatedSvgContent);

      setUploadedFloors(prevUploadedFloors => ({
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
        setUploadedImages(prevUploadedImages => ({
          ...prevUploadedImages,
          [selectedFloor]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResizeMouseDown = (corner) => (event) => {
    setIsResizing(true);
    setResizeCorner(corner);
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    setStartResize({
      x: event.clientX,
      y: event.clientY,
      width: containerRect.width,
      height: containerRect.height,
    });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    setResizeCorner(null);
  };

  const handleResizeMouseMove = (event) => {
    if (isResizing && resizeCorner) {
      const startX = startResize.x;
      const startY = startResize.y;
      const startWidth = startResize.width;
      const startHeight = startResize.height;

      let newWidth, newHeight;

      if (resizeCorner === 'se') {
        newWidth = `${startWidth + (event.clientX - startX)}px`;
        newHeight = `${startHeight + (event.clientY - startY)}px`;
      } else if (resizeCorner === 'sw') {
        newWidth = `${startWidth - (event.clientX - startX)}px`;
        newHeight = `${startHeight + (event.clientY - startY)}px`;
      } else if (resizeCorner === 'ne') {
        newWidth = `${startWidth + (event.clientX - startX)}px`;
        newHeight = `${startHeight - (event.clientY - startY)}px`;
      } else if (resizeCorner === 'nw') {
        newWidth = `${startWidth - (event.clientX - startX)}px`;
        newHeight = `${startHeight - (event.clientY - startY)}px`;
      }

      setSize({ width: newWidth, height: newHeight });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const containerRect = svgContainerRef.current.getBoundingClientRect();
      const { clientWidth, clientHeight } = document.documentElement;

      let newWidth = containerRect.width;
      let newHeight = containerRect.height;

      if (containerRect.right > clientWidth) {
        newWidth -= containerRect.right - clientWidth;
      }

      if (containerRect.bottom > clientHeight) {
        newHeight -= containerRect.bottom - clientHeight;
      }

      setSize({ width: `${newWidth}px`, height: `${newHeight}px` });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App" onMouseMove={handleResizeMouseMove} onMouseUp={handleResizeMouseUp}>
      <div className="sidebar">
        <FloorList floors={floors} onSelectFloor={setSelectedFloor} />
        <button onClick={handleAddFloor}>Добавить планировку</button>
        <button onClick={handleAddImage}>Добавить PNG</button>
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
      </div>
      <div className="main-content">
        <div className="image-container" style={{ position: 'relative', width: '100%', height: '100%', background: 'grey' }}>
          {uploadedImages[selectedFloor] && (
            <img
              src={uploadedImages[selectedFloor]}
              alt="overlay"
              style={{ position: 'absolute', width: size.width, height: size.height, top: 0, left: 0 }}
            />
          )}
          <div
            className="svg-container"
            ref={svgContainerRef}
            onClick={handleRoomClick}
            style={{ position: 'absolute', width: size.width, height: size.height, overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          {['se', 'sw', 'ne', 'nw'].map(corner => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                background: 'red',
                cursor: `${corner}-resize`,
                [corner.split('')[0]]: 0,
                [corner.split('')[1]]: 0,
              }}
              onMouseDown={handleResizeMouseDown(corner)}
            />
          ))}
        </div>
        {popupData && (
          <Popup
            rectId={popupData.rectId}
            rectName={roomNames[popupData.rectId]}
            position={popupData.position}
            onClose={() => setPopupData(null)}
            onSave={handleSaveRoomName}
          />
        )}
      </div>
    </div>
  );
};

export default Rooms;

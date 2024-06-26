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
  const fileInputRef = useRef(null);
  const [roomNames, setRoomNames] = useState({});
  const [filters, setFilters] = useState({
    smallRoom: false,
    largeRoom: false,
  });

  useEffect(() => {
    const floorPlans = [
      'floor1.svg',
      'floor2.svg',
      'floor3.svg',
    ];
    setFloors(floorPlans);
  }, []);

  useEffect(() => {
    if (selectedFloor) {
      if (uploadedFloors[selectedFloor]) {
        setSvgContent(uploadedFloors[selectedFloor]);
      } else {
        fetch(`${process.env.PUBLIC_URL}/plans/${selectedFloor}`)
          .then(response => response.text())
          .then(data => setSvgContent(data));
      }
    } else {
      setSvgContent('<div style="text-align: center; margin-top: 50px;">Выберите планировку</div>');
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

  return (
    <div className="App">
      <div className="sidebar">
        <FloorList floors={floors} onSelectFloor={setSelectedFloor} />
        <button onClick={handleAddFloor}>Добавить планировку</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".svg"
        />
        <CheckboxList onChange={handleCheckboxChange} />
      </div>
      <div className="main-content">
        <header
          className="App-header"
          ref={svgContainerRef}
          onClick={handleRoomClick}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
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
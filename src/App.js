
import React, { useEffect, useState, useRef } from 'react';
import './styles/App.css';
import Popup from './Popup';
import FloorList from './FloorList';

function App() {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [popupData, setPopupData] = useState(null);
  const svgContainerRef = useRef(null);

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
      fetch(`${process.env.PUBLIC_URL}/plans/${selectedFloor}`)
        .then(response => response.text())
        .then(data => setSvgContent(data));
    }
  }, [selectedFloor]);

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

  return (
    <div className="App">
      <div className="sidebar">
        <FloorList floors={floors} onSelectFloor={setSelectedFloor} />
      </div>
      <div className="main-content">
        <header className="App-header" ref={svgContainerRef} onClick={handleRoomClick} dangerouslySetInnerHTML={{ __html: svgContent }} />
        {popupData && <Popup rectId={popupData.rectId} position={popupData.position} onClose={() => setPopupData(null)} />}
      </div>
    </div>
  );
}

export default App;

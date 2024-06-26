const colorizeRect = (svgContent, query, color) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const elements = svgDoc.querySelectorAll(query);
  
    elements.forEach((element) => {
      element.setAttribute('fill', color);
    });
  
    return new XMLSerializer().serializeToString(svgDoc);
  };
  
  export default colorizeRect;
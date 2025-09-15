import L from 'leaflet';

// Desktop-optimized icons (smaller)
export const desktopWarehouseIcon = L.divIcon({
  html: `<div style="
    width: 49px;
    height: 49px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
  ">
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,8 8,22 12,22 12,36 36,36 36,22 40,22" fill="black"/>
      <rect x="18" y="28" width="6" height="8" rx="1.5" fill="white" fill-opacity="0"/>
      <rect x="26" y="28" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
      <rect x="18" y="24" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [49, 49],
  iconAnchor: [24.5, 24.5]
});

export const desktopChauffeurIcon = L.divIcon({
  html: `<div style="background: none; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
    <svg fill='#000000' version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='40' height='40' viewBox='0 0 612 612' xml:space='preserve'>
      <g><path d="M612,327.56v-21.606c0-10.533-4.213-20.628-11.701-28.037L484.107,162.958c-7.384-7.306-17.352-11.403-27.739-11.403 h-58.622v-21.988c0-16.336-13.243-29.58-29.58-29.58H29.58C13.243,99.987,0,113.23,0,129.567V327.56H612z M432.551,190.303 c0-2.563,2.071-4.634,4.635-4.634h21.396c1.184,0,2.366,0.494,3.253,1.282l91.006,86.865c3.057,2.86,0.986,7.987-3.154,7.987 h-112.5c-2.563,0-4.635-2.07-4.635-4.634V190.303z M612,343.903v65.486c0,16.336-13.243,29.578-29.579,29.578h-31.65 c-5.719-39.242-39.539-69.412-80.357-69.412c-40.721,0-74.54,30.17-80.259,69.412h-160.42 c-5.718-39.242-39.538-69.412-80.259-69.412c-40.721,0-74.541,30.17-80.259,69.412H29.58C13.243,438.968,0,425.726,0,409.39 v-65.486H612z M470.456,389.313c-33.883,0-61.351,27.467-61.351,61.35s27.469,61.35,61.351,61.35s61.35-27.467,61.35-61.35 S504.339,389.313,470.456,389.313z M470.456,481.339c-16.941,0-30.675-13.734-30.675-30.676s13.732-30.674,30.675-30.674 c16.941,0,30.676,13.732,30.676,30.674S487.397,481.339,470.456,481.339z M149.464,389.313c-33.883,0-61.35,27.467-61.35,61.35 s27.468,61.35,61.35,61.35s61.35-27.467,61.35-61.35S183.346,389.313,149.464,389.313z M149.464,481.339 c-16.941,0-30.676-13.734-30.676-30.676s13.734-30.674,30.676-30.674c16.941,0,30.675,13.732,30.675,30.674 S166.405,481.339,149.464,481.339z"></path></g>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Mobile-optimized icons (larger)
export const warehouseIcon = L.divIcon({
  html: `<div style="
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
  ">
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,8 8,22 12,22 12,36 36,36 36,22 40,22" fill="black"/>
      <rect x="18" y="28" width="6" height="8" rx="1.5" fill="white" fill-opacity="0"/>
      <rect x="26" y="28" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
      <rect x="18" y="24" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [56, 56],
  iconAnchor: [28, 28]
});

export const chauffeurIcon = L.divIcon({
  html: `<div style="background: none; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
    <svg fill='#000000' version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='40' height='40' viewBox='0 0 612 612' xml:space='preserve'>
      <g><path d="M612,327.56v-21.606c0-10.533-4.213-20.628-11.701-28.037L484.107,162.958c-7.384-7.306-17.352-11.403-27.739-11.403 h-58.622v-21.988c0-16.336-13.243-29.58-29.58-29.58H29.58C13.243,99.987,0,113.23,0,129.567V327.56H612z M432.551,190.303 c0-2.563,2.071-4.634,4.635-4.634h21.396c1.184,0,2.366,0.494,3.253,1.282l91.006,86.865c3.057,2.86,0.986,7.987-3.154,7.987 h-112.5c-2.563,0-4.635-2.07-4.635-4.634V190.303z M612,343.903v65.486c0,16.336-13.243,29.578-29.579,29.578h-31.65 c-5.719-39.242-39.539-69.412-80.357-69.412c-40.721,0-74.54,30.17-80.259,69.412h-160.42 c-5.718-39.242-39.538-69.412-80.259-69.412c-40.721,0-74.541,30.17-80.259,69.412H29.58C13.243,438.968,0,425.726,0,409.39 v-65.486H612z M470.456,389.313c-33.883,0-61.351,27.467-61.351,61.35s27.469,61.35,61.351,61.35s61.35-27.467,61.35-61.35 S504.339,389.313,470.456,389.313z M470.456,481.339c-16.941,0-30.675-13.734-30.675-30.676s13.732-30.674,30.675-30.674 c16.941,0,30.676,13.732,30.676,30.674S487.397,481.339,470.456,481.339z M149.464,389.313c-33.883,0-61.35,27.467-61.35,61.35 s27.468,61.35,61.35,61.35s61.35-27.467,61.35-61.35S183.346,389.313,149.464,389.313z M149.464,481.339 c-16.941,0-30.676-13.734-30.676-30.676s13.734-30.674,30.676-30.674c16.941,0,30.675,13.732,30.675,30.674 S166.405,481.339,149.464,481.339z"></path></g>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export const chauffeurIconHighlighted = L.divIcon({
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
    <span class='chauffeur-glow'></span>
    <svg fill='#f59e42' version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 612 612' class='chauffeur-svg-anim'>
      <g><path d="M612,327.56v-21.606c0-10.533-4.213-20.628-11.701-28.037L484.107,162.958c-7.384-7.306-17.352-11.403-27.739-11.403 h-58.622v-21.988c0-16.336-13.243-29.58-29.58-29.58H29.58C13.243,99.987,0,113.23,0,129.567V327.56H612z M432.551,190.303 c0-2.563,2.071-4.634,4.635-4.634h21.396c1.184,0,2.366,0.494,3.253,1.282l91.006,86.865c3.057,2.86,0.986,7.987-3.154,7.987 h-112.5c-2.563,0-4.635-2.07-4.635-4.634V190.303z M612,343.903v65.486c0,16.336-13.243,29.578-29.579,29.578h-31.65 c-5.719-39.242-39.539-69.412-80.357-69.412c-40.721,0-74.54,30.17-80.259,69.412h-160.42 c-5.718-39.242-39.538-69.412-80.259-69.412c-40.721,0-74.541,30.17-80.259,69.412H29.58C13.243,438.968,0,425.726,0,409.39 v-65.486H612z M470.456,389.313c-33.883,0-61.351,27.467-61.351,61.35s27.469,61.35,61.351,61.35s61.35-27.467,61.35-61.35 S504.339,389.313,470.456,389.313z M470.456,481.339c-16.941,0-30.675-13.734-30.675-30.676s13.732-30.674,30.675-30.674 c16.941,0,30.676,13.732,30.676,30.674S487.397,481.339,470.456,481.339z M149.464,389.313c-33.883,0-61.35,27.467-61.35,61.35 s27.468,61.35,61.35,61.35s61.35-27.467,61.35-61.35S183.346,389.313,149.464,389.313z M149.464,481.339 c-16.941,0-30.676-13.734-30.676-30.676s13.734-30.674,30.676-30.674c16.941,0,30.675,13.732,30.675,30.674 S166.405,481.339,149.464,481.339z"></path></g>
    </svg>
    <style>
      .chauffeur-glow {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 48px;
        height: 48px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, #f59e42 0%, #fde68a 60%, #fff7ed 100%);
        filter: blur(2px);
        opacity: 0;
        z-index: 1;
        animation: chauffeur-glow-blink 1.2s infinite;
      }
      .chauffeur-svg-anim {
        opacity: 1.0;
        filter: brightness(1);
        animation: chauffeur-svg-blink 1.2s infinite;
      }
      @keyframes chauffeur-glow-blink {
        0% { opacity: 0; filter: blur(2px); }
        40% { opacity: 0; filter: blur(2px); }
        50% { opacity: 0.7; filter: blur(10px); }
        100% { opacity: 0.7; filter: blur(10px); }
      }
      @keyframes chauffeur-svg-blink {
        0% { opacity: 1; filter: brightness(1); }
        40% { opacity: 1; filter: brightness(1); }
        50% { opacity: 1; filter: brightness(1.5); }
        100% { opacity: 1; filter: brightness(1.5); }
      }
    </style>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Fix for default markers in Leaflet
export const initializeLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

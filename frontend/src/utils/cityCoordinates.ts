export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const CITY_COORDINATES: Record<string, Coordinates> = {
  hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  mumbai: { latitude: 19.0760, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  delhi: { latitude: 28.6139, longitude: 77.2090 },
  'new delhi': { latitude: 28.6139, longitude: 77.2090 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  vijayawada: { latitude: 16.5062, longitude: 80.6480 },
  visakhapatnam: { latitude: 17.6868, longitude: 83.2185 },
  vizag: { latitude: 17.6868, longitude: 83.2185 },
  warangal: { latitude: 17.9689, longitude: 79.5941 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  mysuru: { latitude: 12.2958, longitude: 76.6394 },
  mysore: { latitude: 12.2958, longitude: 76.6394 },
  tirupati: { latitude: 13.6288, longitude: 79.4192 },
  guntur: { latitude: 16.3067, longitude: 80.4365 },
};

export const getCoordinatesForCity = (cityName: string): Coordinates => {
  if (!cityName) {
    return { latitude: 17.3850, longitude: 78.4867 }; // Default Hyderabad
  }
  const clean = cityName.trim().toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { latitude: 17.3850, longitude: 78.4867 };
};

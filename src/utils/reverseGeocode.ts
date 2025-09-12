// src/utils/reverseGeocode.ts
// Utilitaire pour obtenir une adresse à partir de coordonnées (OpenStreetMap Nominatim)

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération de l\'adresse');
    const data = await response.json();
    return data.display_name || '';
  } catch (e) {
    return '';
  }
}

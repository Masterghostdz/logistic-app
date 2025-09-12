// Utilitaire pour ChauffeurDashboard : gestion GPS activation/désactivation
import { mobileService, LocationCoordinates } from '../services/mobileService';

export async function getCurrentPosition(): Promise<LocationCoordinates | null> {
  try {
    return await mobileService.getCurrentLocation();
  } catch (e) {
    return null;
  }
}

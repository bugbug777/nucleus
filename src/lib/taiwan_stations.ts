export interface Station {
  uid: number;
  name: string;
}

let stationsCache: Station[] | null = null;

export async function loadTaiwanStations(): Promise<Station[]> {
  if (stationsCache) {
    return stationsCache;
  }
  
  const response = await fetch('/taiwan-stations.json');
  if (!response.ok) {
    throw new Error('Failed to load Taiwan stations data');
  }
  
  stationsCache = await response.json();
  return stationsCache;
}

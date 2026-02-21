import { fetchAllAqiData } from './aqi';

export interface Station {
  uid: string; // Using sitename as uid
  name: string;
}

export async function loadTaiwanStations(apiKey: string): Promise<Station[]> {
  const records = await fetchAllAqiData(apiKey);
  return records.map(r => ({
    uid: r.sitename,
    name: r.sitename
  }));
}

export interface MoenvAqiData {
    sitename: string;
    county: string;
    aqi: string;
    pollutant: string;
    status: string;
    so2: string;
    co: string;
    o3: string;
    o3_8hr: string;
    pm10: string;
    "pm2.5": string;
    no2: string;
    nox: string;
    no: string;
    wind_speed: string;
    wind_direc: string;
    publishtime: string;
    co_8hr: string;
    "pm2.5_avg": string;
    "pm10_avg": string;
    so2_avg: string;
    longitude: string;
    latitude: string;
    siteid: string;
}

export interface MoenvResponse {
    fields: any[];
    resource_id: string;
    __extras: any;
    include_total: boolean;
    total: string;
    resource_format: string;
    limit: string;
    offset: string;
    _links: any;
    records: MoenvAqiData[];
}

let cachedData: MoenvAqiData[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchAllAqiData(apiKey: string): Promise<MoenvAqiData[]> {
    if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
        return cachedData;
    }

    const response = await fetch(`https://data.moenv.gov.tw/api/v2/aqx_p_432?language=zh&api_key=${apiKey}`);
    if (!response.ok) {
        throw new Error('Failed to fetch AQI data from MOENV');
    }

    // The API directly returns an array of records
    const json: any = await response.json();

    // Sometimes it might return an object with records, handle both cases
    if (Array.isArray(json)) {
        cachedData = json;
    } else if (json.records && Array.isArray(json.records)) {
        cachedData = json.records;
    } else {
        throw new Error('Unexpected API response format');
    }

    lastFetchTime = Date.now();
    return cachedData || [];
}

export async function fetchAqiData(apiKey: string, sitename?: string, geo?: { lat: number; lng: number }): Promise<MoenvAqiData> {
    const allData = await fetchAllAqiData(apiKey);

    if (sitename) {
        const found = allData.find(d => d.sitename === sitename);
        if (found) return found;
        throw new Error(`Station not found: ${sitename}`);
    } else if (geo) {
        // Find closest station using simple Euclidean distance
        let closest: MoenvAqiData | null = null;
        let minDistance = Infinity;

        for (const record of allData) {
            const lat = parseFloat(record.latitude);
            const lng = parseFloat(record.longitude);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                const dist = Math.sqrt(Math.pow(lat - geo.lat, 2) + Math.pow(lng - geo.lng, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    closest = record;
                }
            }
        }

        if (closest) return closest;
        throw new Error('Could not determine closest station');
    }

    // Default fallback
    if (allData.length > 0) return allData[0];
    throw new Error('No AQI data available');
}

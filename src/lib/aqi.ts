export interface AqiData {
    aqi: number;
    city: {
        name: string;
        geo: [number, number];
    };
    time: {
        s: string;
        tz: string;
    };
    iaqi: {
        pm25?: { v: number };
        pm10?: { v: number };
        o3?: { v: number };
        no2?: { v: number };
        so2?: { v: number };
        co?: { v: number };
        t?: { v: number };
        w?: { v: number };
        h?: { v: number };
        p?: { v: number };
    };
}

export interface WaqiResponse {
    status: 'ok' | 'error';
    data: AqiData;
}

export async function fetchAqiData(token: string, uid?: number, geo?: { lat: number; lng: number }): Promise<AqiData> {
    let endpoint = 'here';
    if (uid !== undefined) {
        if (!Number.isFinite(uid) || uid < 0) {
            throw new Error(`Invalid uid: expected a non-negative finite number, got ${uid}`);
        }
        endpoint = `@${uid}`;
    } else if (geo) {
        endpoint = `geo:${geo.lat};${geo.lng}`;
    }

    const response = await fetch(`https://api.waqi.info/feed/${endpoint}/?token=${token}`);
    const json: WaqiResponse = await response.json();

    if (json.status !== 'ok') {
        throw new Error('Failed to fetch AQI data');
    }

    return json.data;
}

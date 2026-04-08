const LOCATION_INDEX = [
  {
    city: 'Hyderabad',
    state: 'Telangana',
    area: 'Hitech City',
    pincode: '500081',
    lat: 17.4435,
    lng: 78.3772,
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    area: 'Andheri East',
    pincode: '400069',
    lat: 19.1136,
    lng: 72.8697,
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    area: 'HSR Layout',
    pincode: '560034',
    lat: 12.9116,
    lng: 77.6446,
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    area: 'Baner',
    pincode: '411045',
    lat: 18.559,
    lng: 73.7868,
  },
];

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const earthKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthKm * c;
}

export function listLocationIndex() {
  return [...LOCATION_INDEX];
}

export function resolveNearestLocation(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  let nearest = null;
  let nearestDistanceKm = Number.MAX_SAFE_INTEGER;

  for (const location of LOCATION_INDEX) {
    const km = distanceKm(lat, lng, location.lat, location.lng);
    if (km < nearestDistanceKm) {
      nearestDistanceKm = km;
      nearest = location;
    }
  }

  if (!nearest) {
    return null;
  }

  return {
    ...nearest,
    mode: 'auto',
    distanceKm: Number(nearestDistanceKm.toFixed(2)),
  };
}

export function searchLocations(rawQuery) {
  const query = String(rawQuery || '').trim().toLowerCase();
  if (!query) {
    return [];
  }

  return LOCATION_INDEX.filter((location) => {
    return (
      location.city.toLowerCase().includes(query) ||
      location.state.toLowerCase().includes(query) ||
      location.area.toLowerCase().includes(query) ||
      location.pincode.includes(query)
    );
  }).map((location) => ({
    ...location,
    mode: 'manual',
  }));
}

export function resolveByPincode(pincode) {
  const normalized = String(pincode || '').trim();
  if (!normalized) {
    return null;
  }

  const location = LOCATION_INDEX.find((entry) => entry.pincode === normalized);
  if (!location) {
    return null;
  }

  return {
    ...location,
    mode: 'manual',
  };
}

export function isServiceableProduct(product, location) {
  if (!product || !location) {
    return false;
  }

  const cityMatch = Array.isArray(product.serviceCities)
    ? product.serviceCities.some(
        (city) => String(city).toLowerCase() === String(location.city || '').toLowerCase(),
      )
    : false;

  const pincodeMatch = Array.isArray(product.servicePincodes)
    ? product.servicePincodes.includes(String(location.pincode || ''))
    : false;

  return cityMatch || pincodeMatch;
}

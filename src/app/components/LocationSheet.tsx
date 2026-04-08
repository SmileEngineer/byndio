import { useMemo, useState } from 'react';
import { Crosshair, MapPin, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { LocationInfo } from '../types';
import { locationSuggestions } from '../mockData';

interface LocationSheetProps {
  currentLocation: LocationInfo;
  onClose: () => void;
  onApply: (location: LocationInfo) => void;
}

export function LocationSheet({ currentLocation, onClose, onApply }: LocationSheetProps) {
  const [area, setArea] = useState(currentLocation.area);
  const [city, setCity] = useState(currentLocation.city);
  const [state, setState] = useState(currentLocation.state);
  const [pincode, setPincode] = useState(currentLocation.pincode);
  const [status, setStatus] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const suggestions = useMemo(() => {
    const query = `${area} ${city} ${pincode}`.trim().toLowerCase();
    if (!query) {
      return locationSuggestions;
    }

    return locationSuggestions.filter((item) =>
      `${item.city} ${item.area} ${item.state} ${item.pincode}`.toLowerCase().includes(query),
    );
  }, [area, city, pincode]);

  const applyLocation = (nextLocation: LocationInfo) => {
    onApply(nextLocation);
    onClose();
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('Browser geolocation is not available on this device.');
      return;
    }

    setIsDetecting(true);
    setStatus('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );

          if (!response.ok) {
            throw new Error('Reverse geocode failed');
          }

          const data = await response.json();
          const address = data.address ?? {};

          const nextLocation: LocationInfo = {
            city:
              address.city ||
              address.town ||
              address.state_district ||
              currentLocation.city,
            area:
              address.suburb || address.neighbourhood || address.village || currentLocation.area,
            state: address.state || currentLocation.state,
            pincode: address.postcode || currentLocation.pincode,
            mode: 'auto',
            coordinates: {
              lat: coords.latitude,
              lon: coords.longitude,
            },
          };

          setStatus('Location detected successfully.');
          applyLocation(nextLocation);
        } catch {
          const fallbackLocation: LocationInfo = {
            ...currentLocation,
            mode: 'auto',
            coordinates: {
              lat: coords.latitude,
              lon: coords.longitude,
            },
          };

          setStatus('Location captured. Reverse geocode failed, so current city label was kept.');
          applyLocation(fallbackLocation);
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        setStatus('Could not access GPS. Use pincode or area search instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2>Choose delivery location</h2>
            <p className="text-sm text-muted-foreground">
              Auto detect with GPS or manually search by pincode and area.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-primary/20 bg-secondary/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Crosshair className="h-4 w-4" />
                  Auto detect
                </div>
                <p className="text-sm text-muted-foreground">
                  Best UX for nearby sellers, hyperlocal delivery and live product filtering.
                </p>
              </div>
              <Button onClick={detectLocation} disabled={isDetecting} className="gap-2">
                <Crosshair className="h-4 w-4" />
                {isDetecting ? 'Detecting...' : 'Use GPS'}
              </Button>
            </div>
            {status ? <p className="mt-3 text-xs text-muted-foreground">{status}</p> : null}
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4 text-primary" />
                Manual input
              </div>
              <p className="text-sm text-muted-foreground">
                Search area name, enter pincode, then apply it instantly to update nearby products.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Area or locality</label>
                <Input value={area} onChange={(event) => setArea(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pincode</label>
                <Input
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City</label>
                <Input value={city} onChange={(event) => setCity(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Input value={state} onChange={(event) => setState(event.target.value)} />
              </div>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Suggested serviceable locations
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.city}-${suggestion.area}`}
                    onClick={() =>
                      applyLocation({
                        ...suggestion,
                        mode: 'manual',
                      })
                    }
                    className="rounded-2xl border border-border p-4 text-left transition hover:border-primary hover:bg-secondary/40"
                  >
                    <div className="font-medium">{suggestion.area}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.city}, {suggestion.state}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Pincode {suggestion.pincode}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-6 py-5 md:flex-row">
          <Button variant="outline" onClick={onClose} className="md:w-auto">
            Cancel
          </Button>
          <Button
            className="md:flex-1"
            onClick={() =>
              applyLocation({
                city,
                area,
                state,
                pincode,
                mode: 'manual',
              })
            }
          >
            Apply location
          </Button>
        </div>
      </div>
    </div>
  );
}

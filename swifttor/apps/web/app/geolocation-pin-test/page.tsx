'use client';

import { useMemo, useRef, useState } from 'react';

type LatLng = { lat: number; lng: number };

function formatCoord(n: number) {
  return n.toFixed(6);
}

export default function GeolocationPinTestPage() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [pinSource, setPinSource] = useState<string | null>(null);
  const [bestCenter, setBestCenter] = useState<LatLng | null>(null);
  const [bestAccM, setBestAccM] = useState<number | null>(null);

  const [watchId, setWatchId] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const defaults = useMemo(() => {
    return {
      acceptableM: 600,
      deadlineMs: 60000,
    };
  }, []);

  const log = (stage: string, data?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(`[GeoPinTest] ${new Date().toISOString()}`, stage, data ?? {});
  };

  const stopAll = () => {
    try {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    } catch {
      // ignore
    }
    watchIdRef.current = null;
    setWatchId(null);

    if (deadlineRef.current != null) {
      window.clearTimeout(deadlineRef.current);
      deadlineRef.current = null;
    }
  };

  const start = async () => {
    if (!('geolocation' in navigator)) {
      setStatus('Geolocation not supported');
      return;
    }

    // Reset
    stopAll();
    setRunning(true);
    setStatus('Requesting geolocation…');
    setPinSource(null);
    setBestCenter(null);
    setBestAccM(null);

    log('CLICK/START');

    try {
      const permsAny = (navigator as any).permissions;
      if (permsAny?.query) {
        const statusObj = await permsAny.query({ name: 'geolocation' });
        log('PERMISSION_STATE', { state: statusObj?.state });
      }
    } catch {
      log('PERMISSION_STATE_UNAVAILABLE');
    }

    let localBestAcc: number | null = null;
    let localBestCenter: LatLng | null = null;

    const accept = (center: LatLng, acc: number | null, source: string) => {
      if (acc == null) return;
      if (!running) return;

      if (deadlineRef.current != null) {
        window.clearTimeout(deadlineRef.current);
        deadlineRef.current = null;
      }
      try {
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
      } catch {
        // ignore
      }
      watchIdRef.current = null;
      setWatchId(null);

      localBestAcc = acc;
      localBestCenter = center;
      setBestCenter(center);
      setBestAccM(acc);
      setPinSource(source);
      setStatus(`Pinned (${source}) • ±${Math.round(acc)}m`);
      log('ACCEPT', { source, lat: center.lat, lng: center.lng, accuracyM: acc });
      setRunning(false);
    };

    const handlePosition = (pos: GeolocationPosition, source: string) => {
      const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const acc = typeof pos.coords.accuracy === 'number' ? pos.coords.accuracy : null;
      log('GPS_UPDATE', { source, lat: center.lat, lng: center.lng, accuracyM: acc });

      if (acc != null && (localBestAcc == null || acc < localBestAcc)) {
        localBestAcc = acc;
        localBestCenter = center;
        setBestCenter(center);
        setBestAccM(acc);
      }

      if (acc != null && acc <= defaults.acceptableM) {
        accept(center, acc, source);
      }
    };

    const failure = (err: GeolocationPositionError) => {
      log('GPS_FAILURE', { code: err?.code, message: err?.message });
      setStatus(`GPS failure (see console)`);
      setRunning(false);
      stopAll();
    };

    setStatus('Watching… (this uses watchPosition)');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handlePosition(pos, 'watchPosition'),
      failure,
      { enableHighAccuracy: true, maximumAge: 0 },
    );
    setWatchId(watchIdRef.current);
    log('WATCH_STARTED', { watchId: watchIdRef.current });

    // Fallback in parallel (mirrors what we added to the real page)
    try {
      log('GETCURRENT_REQUESTED', { enableHighAccuracy: false, timeoutMs: 20000 });
      navigator.geolocation.getCurrentPosition(
        (pos) => handlePosition(pos, 'getCurrentPosition'),
        (err) => log('GETCURRENT_FAILURE', { code: err?.code, message: err?.message }),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 },
      );
    } catch {
      log('GETCURRENT_THROW');
    }

    deadlineRef.current = window.setTimeout(() => {
      log('DEADLINE_TIMEOUT_FIRED', { bestAccM: localBestAcc, bestCenter: localBestCenter });

      if (localBestCenter && localBestAcc != null) {
        setBestCenter(localBestCenter);
        setBestAccM(localBestAcc);
        setPinSource('deadline');
        setStatus(`Pinned at deadline • ±${Math.round(localBestAcc)}m`);
        log('ACCEPT_AT_DEADLINE', { lat: localBestCenter.lat, lng: localBestCenter.lng, accuracyM: localBestAcc });
      } else {
        // Optional stored fallback
        let stored: LatLng | null = null;
        try {
          const raw = window.localStorage.getItem('swiftTow.lastLocation');
          if (raw) {
            const parsed = JSON.parse(raw) as LatLng;
            if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
              stored = parsed;
            }
          }
        } catch {
          // ignore
        }
        if (stored) {
          setBestCenter(stored);
          setPinSource('stored-fallback');
          setStatus('No GPS fix; using stored center (see localStorage)');
          log('FALLBACK_STORED', { lat: stored.lat, lng: stored.lng });
        } else {
          setStatus('No GPS fix before deadline');
        }
      }

      stopAll();
      setRunning(false);
    }, defaults.deadlineMs);
  };

  const pinnedText =
    bestCenter && bestAccM != null
      ? `Pinned center: ${formatCoord(bestCenter.lat)}, ${formatCoord(bestCenter.lng)} • ±${Math.round(bestAccM)}m`
      : bestCenter
        ? `Center: ${formatCoord(bestCenter.lat)}, ${formatCoord(bestCenter.lng)} (accuracy unknown)`
        : 'No pin yet';

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-2">Geolocation Pin Test</h1>
        <p className="text-slate-600 mb-6">
          Click the button and watch the console for the full geolocation lifecycle. This route is independent of Google Maps.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => start()}
            disabled={running}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black disabled:opacity-60"
          >
            {running ? 'Running…' : 'Start Geolocation Pin'}
          </button>
          <button
            onClick={() => {
              stopAll();
              setRunning(false);
              setStatus('Stopped');
              log('STOP');
            }}
            disabled={!running}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-900 font-black disabled:opacity-60"
          >
            Stop
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <div className="font-bold mb-2">Status</div>
          <div className="text-sm text-slate-700 mb-3">{status}</div>
          <div className="font-bold mb-2">Pin Details</div>
          <div className="text-sm text-slate-700">{pinnedText}</div>
          <div className="text-xs text-slate-500 mt-2">
            Pin source: {pinSource ?? '—'}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            WatchId: {watchId ?? '—'}
          </div>
        </div>
      </div>
    </main>
  );
}


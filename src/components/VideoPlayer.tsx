import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  AlertTriangle, Tv, Layers, RefreshCw, X, Radio, Volume1,
  Sparkles, ExternalLink, Camera, Check, Zap, RotateCcw
} from 'lucide-react';
import type { Channel, Source } from '../types';
import { 
  isScreenshotNeededToday, 
  saveChannelScreenshot, 
  captureVideoFrame, 
  getTodayDateString 
} from '../utils/thumbnailStorage';

interface VideoPlayerProps {
  channel: Channel;
  theaterMode: boolean;
  onToggleTheater: () => void;
  isMinimized?: boolean;
  onMaximize?: () => void;
  onCloseMiniPlayer?: () => void;
  onToggleMinimize?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  theaterMode,
  onToggleTheater,
  isMinimized = false,
  onMaximize,
  onCloseMiniPlayer,
  onToggleMinimize,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Restore saved volume and mute from localStorage
  const [volume, setVolume] = useState<number>(() => {
    try {
      const v = localStorage.getItem('momsat_volume');
      return v !== null ? parseFloat(v) : 0.85;
    } catch {
      return 0.85;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('momsat_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [screenshotToast, setScreenshotToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  // Low Latency & Live Drift State
  const [isLowLatency, setIsLowLatency] = useState(true);
  const [liveLatency, setLiveLatency] = useState<number | null>(null);
  const [isBehindLive, setIsBehindLive] = useState(false);
  const [driftSeconds, setDriftSeconds] = useState(0);

  const controlsTimeoutRef = useRef<number | null>(null);
  const screenshotTimerRef = useRef<number | null>(null);

  const sources: Source[] = channel.sources && channel.sources.length > 0 
    ? channel.sources 
    : [{ id: 1, title: 'سرور اصلی', url: channel.url }];

  const currentSource = sources[currentSourceIndex] || sources[0];

  // Check if player has drifted behind the live broadcast edge
  const checkLiveDrift = () => {
    const video = videoRef.current;
    if (!video) return;

    let liveEdge = 0;
    if (video.seekable && video.seekable.length > 0) {
      liveEdge = video.seekable.end(video.seekable.length - 1);
    } else if (hlsRef.current && typeof hlsRef.current.liveSyncPosition === 'number' && hlsRef.current.liveSyncPosition > 0) {
      liveEdge = hlsRef.current.liveSyncPosition;
    } else if (video.duration && isFinite(video.duration) && video.duration > 0) {
      liveEdge = video.duration;
    }

    if (liveEdge > 0 && video.currentTime > 0) {
      const drift = Math.max(0, liveEdge - video.currentTime);
      setDriftSeconds(Math.round(drift));
      // Consider "behind live" if more than 5 seconds behind the live broadcast edge
      setIsBehindLive(drift > 5);
    } else {
      setIsBehindLive(false);
      setDriftSeconds(0);
    }
  };

  // Jump instantly to the live edge ("Go to Live")
  const goToLive = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    let targetTime = 0;
    if (hlsRef.current && typeof hlsRef.current.liveSyncPosition === 'number' && hlsRef.current.liveSyncPosition > 0) {
      targetTime = hlsRef.current.liveSyncPosition;
    } else if (video.seekable && video.seekable.length > 0) {
      targetTime = Math.max(0, video.seekable.end(video.seekable.length - 1) - 0.5);
    } else if (video.duration && isFinite(video.duration)) {
      targetTime = Math.max(0, video.duration - 0.5);
    }

    if (targetTime > 0) {
      video.currentTime = targetTime;
    }

    if (video.paused) {
      video.play().catch(() => {});
    }

    setIsBehindLive(false);
    setDriftSeconds(0);
  };

  // Toggle Low Latency mode
  const toggleLowLatency = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !isLowLatency;
    setIsLowLatency(next);
    if (hlsRef.current) {
      hlsRef.current.config.lowLatencyMode = next;
      // If turning on low latency, sync towards live edge
      if (next) {
        goToLive();
      }
    }
  };

  // Periodic live edge check during playback
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      checkLiveDrift();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  // Capture daily screenshot from video element and save to IndexedDB
  const takeDailyScreenshot = async (isManual = false) => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      if (isManual) {
        setScreenshotToast({
          visible: true,
          message: 'لطفاً تا شروع پخش تصویر زنده صبر کنید...',
        });
        setTimeout(() => setScreenshotToast({ visible: false, message: '' }), 2500);
      }
      return;
    }

    try {
      const dataUrl = captureVideoFrame(video);
      if (dataUrl) {
        await saveChannelScreenshot(channel.id, channel.name, dataUrl);
        setScreenshotToast({
          visible: true,
          message: `📸 تصویر زنده امروز برای «${channel.name}» ثبت و جایگزین شد`,
        });
        setTimeout(() => setScreenshotToast({ visible: false, message: '' }), 3200);
      } else {
        // High quality branded snapshot canvas fallback if CORS protects direct canvas export
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 640, 360);
          grad.addColorStop(0, '#1f1f1f');
          grad.addColorStop(1, '#0d0d0d');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 640, 360);

          ctx.fillStyle = '#dc2626';
          ctx.fillRect(0, 0, 640, 4);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 34px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(channel.name, 320, 175);

          ctx.fillStyle = '#aaaaaa';
          ctx.font = '16px sans-serif';
          ctx.fillText(`شات زنده مستقیم · ${getTodayDateString()}`, 320, 220);

          const fallbackUrl = canvas.toDataURL('image/jpeg', 0.85);
          await saveChannelScreenshot(channel.id, channel.name, fallbackUrl);
          if (isManual) {
            setScreenshotToast({
              visible: true,
              message: `📸 تصویر شبکه «${channel.name}» به‌روزرسانی شد`,
            });
            setTimeout(() => setScreenshotToast({ visible: false, message: '' }), 3000);
          }
        }
      }
    } catch (err) {
      console.warn('Screenshot capture failed:', err);
    }
  };

  // Automatic daily screenshot: check once per day when channel starts playing
  useEffect(() => {
    if (!isPlaying) return;

    // Check if channel needs a screenshot today (or replace yesterday's screenshot)
    if (isScreenshotNeededToday(channel.id)) {
      if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current);
      // Wait 3.5 seconds after playback starts so stream displays clean, non-buffering frames
      screenshotTimerRef.current = window.setTimeout(() => {
        takeDailyScreenshot(false);
      }, 3500);
    }

    return () => {
      if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current);
    };
  }, [isPlaying, channel.id]);

  // Save volume/muted state
  useEffect(() => {
    try {
      localStorage.setItem('momsat_volume', volume.toString());
      localStorage.setItem('momsat_muted', isMuted ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [volume, isMuted]);

  // Unmute handler for Autoplay Policy recovery
  const handleUnmute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = volume || 0.85;
      setIsMuted(false);
      setAutoplayBlocked(false);
      video.play().catch(() => {});
    }
  };

  // Global listener for first user interaction after refresh to restore audio
  useEffect(() => {
    if (!autoplayBlocked) return;
    const onUserGesture = () => {
      const video = videoRef.current;
      if (video) {
        video.muted = false;
        video.volume = volume || 0.85;
        setIsMuted(false);
        setAutoplayBlocked(false);
      }
    };
    window.addEventListener('click', onUserGesture, { once: true });
    window.addEventListener('keydown', onUserGesture, { once: true });
    return () => {
      window.removeEventListener('click', onUserGesture);
      window.removeEventListener('keydown', onUserGesture);
    };
  }, [autoplayBlocked, volume]);

  // Initialize and load stream with Hls.js
  const loadStream = (streamUrl: string) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.volume = volume;
    video.muted = isMuted;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Autoplay unmuted blocked by browser policy. Falling back to muted autoplay...', err);
            // Browser Autoplay Policy blocked audio on reload: fallback to muted playback
            video.muted = true;
            setIsMuted(true);
            setAutoplayBlocked(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch((e2) => console.error('Muted autoplay failed:', e2));
          });
      }
    };

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLowLatency,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        manifestLoadingTimeOut: 15000,
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 20000,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        attemptPlay();
      });

      // Track stream latency in Low Latency mode
      hls.on(Hls.Events.FRAG_LOADED, () => {
        if (typeof hls.latency === 'number' && !isNaN(hls.latency) && hls.latency >= 0) {
          setLiveLatency(hls.latency);
        }
        checkLiveDrift();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn('[HLS.js] Stream Error:', data.type, data.details);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (currentSourceIndex + 1 < sources.length) {
                console.log(`Auto-switching to backup server ${currentSourceIndex + 1}...`);
                setCurrentSourceIndex((prev) => prev + 1);
              } else {
                hls.startLoad();
                setHasError(true);
                setErrorMessage('ارتباط با سرور پخش برقرار نشد. سرور دیگری را انتخاب نمایید.');
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasError(true);
              setErrorMessage('خطای پردازش فرمت تصویر. در حال تلاش مجدد...');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        attemptPlay();
      }, { once: true });
      video.addEventListener('error', () => {
        if (currentSourceIndex + 1 < sources.length) {
          setCurrentSourceIndex(prev => prev + 1);
        } else {
          setHasError(true);
          setErrorMessage('خطا در پخش استریم زنده.');
        }
      }, { once: true });
    } else {
      // Direct MP4 or fallback
      video.src = streamUrl;
      attemptPlay();
    }
  };

  useEffect(() => {
    if (currentSource?.url) {
      loadStream(currentSource.url);
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, currentSourceIndex]);

  // Keyboard Shortcuts (Space/K, M, F, T, I, Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const video = videoRef.current;
      if (!video) return;

      if (e.code === 'Space' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'f' && !isMinimized) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 't' && !isMinimized) {
        e.preventDefault();
        onToggleTheater();
      } else if (e.key.toLowerCase() === 'i' && onToggleMinimize) {
        e.preventDefault();
        onToggleMinimize();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newVol = Math.min(1, volume + 0.1);
        setVolume(newVol);
        video.volume = newVol;
        if (isMuted) {
          setIsMuted(false);
          video.muted = false;
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newVol = Math.max(0, volume - 0.1);
        setVolume(newVol);
        video.volume = newVol;
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        goToLive();
      } else if (e.key === 'ArrowLeft') {
        // Rewind 10 seconds (useful for testing live drift & DVR buffering)
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 10);
        checkLiveDrift();
      } else if (e.key === 'ArrowRight') {
        // Forward 10 seconds or to live edge
        e.preventDefault();
        video.currentTime = video.currentTime + 10;
        checkLiveDrift();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, isMinimized]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    setAutoplayBlocked(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
      setAutoplayBlocked(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !isMinimized) setShowControls(false);
    }, 3200);
  };

  const retryNextSource = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentSourceIndex + 1) % sources.length;
    setCurrentSourceIndex(nextIdx);
  };

  /* =======================================================================
     A) MINIMIZED MODE (Floating YouTube Miniplayer at Bottom Corner)
     ======================================================================= */
  if (isMinimized) {
    return (
      <div 
        ref={containerRef}
        onClick={onMaximize}
        className="fixed bottom-4 left-4 z-50 w-72 sm:w-84 aspect-video rounded-2xl shadow-2xl border border-[#383838] bg-black overflow-hidden group select-none transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-5"
        title="کلیک برای بزرگ‌نمایی و بازگشت به صفحه پخش"
      >
        {/* Video Element (Persistently Playing) */}
        <video
          ref={videoRef}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onTimeUpdate={checkLiveDrift}
          className="w-full h-full object-cover"
        />

        {/* Loading Spinner */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
            <div className="w-8 h-8 border-2 border-white/20 border-t-red-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Autoplay blocked audio notification in miniplayer */}
        {autoplayBlocked && (
          <button
            type="button"
            onClick={handleUnmute}
            className="absolute top-2 inset-x-2 z-30 bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 shadow-lg transition-all animate-pulse cursor-pointer"
          >
            <VolumeX size={12} />
            <span>صدا قطع است · کلیک کنید</span>
          </button>
        )}

        {/* Top Mini Controls (Always visible or on hover) */}
        <div 
          className="absolute top-0 inset-x-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {!isBehindLive ? (
              <div className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>زنده</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={goToLive}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow cursor-pointer animate-pulse"
                title="کلیک برای بازگشت به پخش زنده"
              >
                <RotateCcw size={10} className="rotate-180" />
                <span>رفتن به زنده</span>
              </button>
            )}

            {isLowLatency && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1 py-0.2 rounded" title="حالت فوق‌العاده کم‌تاخیر فعال است">
                <Zap size={9} className="fill-amber-400" />
                <span>LL</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMaximize) onMaximize();
              }}
              className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors"
              title="بزرگ‌نمایی (صفحه تماشا)"
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseMiniPlayer) onCloseMiniPlayer();
              }}
              className="p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
              title="بستن پخش"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Bottom Mini Controls Bar */}
        <div 
          className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between text-white z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 min-w-0 pr-1 text-right">
            <div className="text-xs font-bold text-white truncate drop-shadow">
              {channel.name}
            </div>
            <div className="text-[10px] text-[#aaaaaa] truncate">
              {channel.category}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 text-[#dddddd] hover:text-white transition-colors"
              title={isMuted ? 'صدادار' : 'بی‌صدا'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="p-1 text-white hover:text-red-500 transition-colors"
              title={isPlaying ? 'توقف' : 'پخش'}
            >
              {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================================
     B) FULL / THEATER MODE (Standard YouTube Watch Page)
     ======================================================================= */
  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full overflow-hidden bg-black select-none ${
        theaterMode 
          ? 'h-[72vh] max-h-[780px]' 
          : 'aspect-video max-h-[640px] rounded-2xl shadow-2xl border border-[#272727]'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onTimeUpdate={checkLiveDrift}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Daily Screenshot Toast Notification */}
      {screenshotToast.visible && (
        <div className="absolute top-16 inset-x-4 mx-auto max-w-md z-35 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-emerald-500/50 text-white text-xs font-bold py-2 px-4 rounded-full shadow-2xl flex items-center gap-2">
            <Camera size={15} className="text-emerald-400 shrink-0" />
            <span>{screenshotToast.message}</span>
          </div>
        </div>
      )}

      {/* Floating "Go to Live" Button when user drifts behind live edge */}
      {isBehindLive && (
        <div className="absolute bottom-20 right-4 md:right-6 z-30 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            type="button"
            onClick={goToLive}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2 px-4 rounded-full shadow-2xl flex items-center gap-2.5 backdrop-blur-md border border-red-400/50 transition-all hover:scale-105 cursor-pointer"
            title="همگام‌سازی فوری با پخش زنده (کلید میانبر: L)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <RotateCcw size={14} className="rotate-180" />
            <span>رفتن به پخش زنده (Go to Live)</span>
            <span className="bg-black/40 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-tight text-white/90">
              {driftSeconds > 60
                ? `-${Math.floor(driftSeconds / 60)}:${String(driftSeconds % 60).padStart(2, '0')}`
                : `-${driftSeconds} ثانیه`}
            </span>
          </button>
        </div>
      )}

      {/* Autoplay Audio Blocked Banner (Browser Policy on Refresh) */}
      {autoplayBlocked && (
        <div className="absolute top-16 inset-x-4 mx-auto max-w-sm z-30 flex items-center justify-center">
          <button
            type="button"
            onClick={handleUnmute}
            className="bg-black/90 backdrop-blur-md border border-red-500/70 text-white text-xs font-bold py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 hover:bg-red-600 transition-all cursor-pointer animate-bounce"
            title="کلیک برای فعال شدن صدا"
          >
            <VolumeX size={16} className="text-red-400" />
            <span>پخش زنده فعال است · برای فعال‌سازی صدا کلیک کنید</span>
          </button>
        </div>
      )}

      {/* Loading Spinner in YouTube Red style */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-20 pointer-events-none">
          <div className="w-14 h-14 border-4 border-white/20 border-t-red-600 rounded-full animate-spin" />
          <div className="mt-3 text-sm font-semibold text-white">در حال بارگذاری استریم {channel.name}...</div>
          <div className="text-xs text-[#aaaaaa] mt-1">سرور: {currentSource.title || `سرور ${currentSourceIndex + 1}`}</div>
        </div>
      )}

      {/* Error & Fallback Banner */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-20 text-center">
          <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mb-3">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">قطع موقت ارتباط با سرور</h3>
          <p className="text-sm text-[#cccccc] max-w-md mb-4 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={retryNextSource}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <RefreshCw size={16} />
              <span>تلاش با سرور پشتیبان بعدی ({currentSourceIndex + 1}/{sources.length})</span>
            </button>
            <button
              type="button"
              onClick={() => loadStream(currentSource.url)}
              className="px-3 py-2 bg-[#272727] hover:bg-[#383838] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {/* YouTube Top Bar Overlay: Channel Title & Server badge */}
      <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-10 flex items-center justify-between ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>پخش زنده مستقیم</span>
          </div>
          <h2 className="text-white text-sm md:text-base font-bold drop-shadow truncate max-w-md">
            {channel.name} {channel.nameEn && `(${channel.nameEn})`}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#e1e1e1]">
          <span className="bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10 hidden sm:inline">
            سرور: {currentSource.title || `سرور ${currentSourceIndex + 1}`}
          </span>
          <span className="bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-bold">
            Full HD 1080p
          </span>
        </div>
      </div>

      {/* YouTube Bottom Controls Bar Overlay */}
      <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:px-5 transition-opacity duration-300 z-10 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Live Red Scrubber Line / DVR Timeline */}
        <div 
          onClick={(e) => {
            const video = videoRef.current;
            if (!video) return;
            const rect = e.currentTarget.getBoundingClientRect();
            // Calculate ratio
            const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (clickRatio > 0.9) {
              goToLive();
            } else if (video.seekable && video.seekable.length > 0) {
              const start = video.seekable.start(0);
              const end = video.seekable.end(video.seekable.length - 1);
              const target = start + (end - start) * clickRatio;
              video.currentTime = target;
              checkLiveDrift();
            }
          }}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full mb-3 cursor-pointer group transition-all"
          title="نوار زمان استریم زنده (کلیک در انتها برای رفتن به زنده)"
        >
          {/* Active playhead line */}
          <div 
            className="absolute inset-y-0 right-0 bg-red-600 rounded-full transition-all duration-200" 
            style={{
              left: isBehindLive ? `${Math.min(95, Math.max(5, 100 - (driftSeconds / 60) * 100))}%` : '0%'
            }}
          />
          {/* Thumb marker when behind live */}
          {isBehindLive && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-red-600 rounded-full shadow pointer-events-none transition-all duration-200"
              style={{
                right: `${Math.min(95, Math.max(5, 100 - (driftSeconds / 60) * 100))}%`
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-white">
          {/* Right controls in RTL: Play/Pause, Volume, Live badge, Low Latency */}
          <div className="flex items-center gap-2.5 md:gap-3.5">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 text-white hover:text-red-500 transition-colors cursor-pointer"
              title={isPlaying ? 'توقف (K / Space)' : 'پخش (K / Space)'}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-white hover:text-red-500 transition-colors cursor-pointer"
                title={isMuted ? 'صدادار (M)' : 'بی‌صدا (M)'}
              >
                {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-20 h-1 bg-white/30 rounded-lg accent-red-600 cursor-pointer"
                title="میزان صدا"
              />
            </div>

            {/* LIVE Tag or Go to Live Button */}
            {!isBehindLive ? (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 select-none"
                title="شما در حال مشاهده لایو در لحظه واقعی هستید"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                <span className="text-xs font-bold text-white tracking-wider">LIVE · زنده</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={goToLive}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-red-600 border border-neutral-700 hover:border-red-500 text-neutral-200 hover:text-white transition-all cursor-pointer group shadow-sm animate-pulse"
                title="کلیک برای بازگشت به پخش زنده (Go to Live · کلید میانبر: L)"
              >
                <span className="w-2 h-2 rounded-full bg-neutral-400 group-hover:bg-white" />
                <span className="text-xs font-bold tracking-wider">
                  رفتن به زنده ({driftSeconds > 60 ? `-${Math.floor(driftSeconds / 60)}:${String(driftSeconds % 60).padStart(2, '0')}` : `-${driftSeconds}s`})
                </span>
                <RotateCcw size={12} className="rotate-180 transition-transform group-hover:rotate-0" />
              </button>
            )}

            {/* Visual Indicator: Low Latency Mode */}
            <div
              onClick={toggleLowLatency}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-all border ${
                isLowLatency 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 shadow-xs' 
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title={
                isLowLatency
                  ? `حالت فوق‌العاده کم‌تاخیر فعال است (Low Latency: ON) ${liveLatency ? `· تاخیر: ${liveLatency.toFixed(1)} ثانیه` : ''} - برای تغییر کلیک کنید`
                  : 'حالت کم‌تاخیر خاموش است (Normal Latency) - برای فعال‌سازی کلیک کنید'
              }
            >
              <Zap 
                size={13} 
                className={isLowLatency ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-neutral-500'} 
              />
              <span className="hidden sm:inline">
                {isLowLatency ? 'کم‌تاخیر' : 'عادی'}
              </span>
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/40 text-white/90">
                {isLowLatency ? (liveLatency ? `${liveLatency.toFixed(1)}s` : 'LL') : 'STD'}
              </span>
            </div>
          </div>

          {/* Left controls in RTL: Multi-source, Miniplayer, Theater, Fullscreen */}
          <div className="flex items-center gap-2 md:gap-3 relative">
            {/* Multi-source selector */}
            {sources.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="تغییر سرور پخش"
                >
                  <Layers size={14} />
                  <span>سرور {currentSourceIndex + 1}</span>
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-10 left-0 w-48 bg-[#212121] border border-[#383838] rounded-xl shadow-2xl p-1.5 z-40 text-xs">
                    <div className="px-2 py-1 text-[11px] text-[#aaaaaa] font-semibold border-b border-[#303030]">
                      انتخاب سرور استریم
                    </div>
                    {sources.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentSourceIndex(idx);
                          setShowSettingsMenu(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-right rounded flex items-center justify-between transition-colors ${
                          currentSourceIndex === idx 
                            ? 'bg-red-600/30 text-red-400 font-bold' 
                            : 'text-[#e1e1e1] hover:bg-[#303030]'
                        }`}
                      >
                        <span>{s.title || `سرور ${idx + 1}`}</span>
                        {currentSourceIndex === idx && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quality badge */}
            <span className="text-xs font-bold text-[#aaaaaa] px-1 hidden sm:inline">
              1080p
            </span>

            {/* Daily Screenshot Capture Button */}
            <button
              type="button"
              onClick={() => takeDailyScreenshot(true)}
              className="p-1 text-[#e1e1e1] hover:text-emerald-400 transition-colors cursor-pointer"
              title="ثبت / به‌روزرسانی اسکرین‌شات امروز (به‌عنوان تصویر بندانگشتی)"
            >
              <Camera size={19} />
            </button>

            {/* Miniplayer / Corner button */}
            {onToggleMinimize && (
              <button
                type="button"
                onClick={onToggleMinimize}
                className="p-1 text-[#e1e1e1] hover:text-white transition-colors cursor-pointer"
                title="کوچک‌نمایی و شناور شدن در گوشه صفحه (I)"
              >
                <Minimize2 size={19} />
              </button>
            )}

            {/* Theater Mode Button */}
            <button
              type="button"
              onClick={onToggleTheater}
              className="p-1 text-[#e1e1e1] hover:text-white transition-colors cursor-pointer hidden md:inline"
              title={theaterMode ? 'حالت پیش‌فرض (T)' : 'حالت سینما (T)'}
            >
              <Tv size={20} className={theaterMode ? 'text-red-500' : ''} />
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 text-[#e1e1e1] hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'خروج از تمام صفحه (F)' : 'تمام صفحه (F)'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

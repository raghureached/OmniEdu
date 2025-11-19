import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import React from "react";
import "./VideoPlayer.css";
const VideoPlayer = ({ src, poster }) => {
        const videoRef = React.useRef(null);
        const containerRef = React.useRef(null);
        const [isPlaying, setIsPlaying] = React.useState(false);
        const [duration, setDuration] = React.useState(0);
        const [current, setCurrent] = React.useState(0);
        const [isMuted, setIsMuted] = React.useState(false);
        const [volume, setVolume] = React.useState(1);
        const [speed, setSpeed] = React.useState(1);
        const [fs, setFs] = React.useState(false);

        const fmt = (s) => {
            if (!Number.isFinite(s)) return '0:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60).toString().padStart(2, '0');
            return `${m}:${sec}`;
        };

        const onLoaded = () => {
            const v = videoRef.current; if (!v) return;
            setDuration(v.duration || 0);
        };
        const onTime = () => {
            const v = videoRef.current; if (!v) return;
            setCurrent(v.currentTime || 0);
        };
        const togglePlay = () => {
            const v = videoRef.current; if (!v) return;
            if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
        };
        const onSeek = (e) => {
            const v = videoRef.current; if (!v) return;
            const val = Number(e.target.value);
            v.currentTime = val; setCurrent(val);
        };
        const toggleMute = () => {
            const v = videoRef.current; if (!v) return;
            const next = !isMuted; setIsMuted(next); v.muted = next;
        };
        const onVolume = (e) => {
            const v = videoRef.current; if (!v) return;
            const val = Number(e.target.value); setVolume(val); v.volume = val;
            if (val === 0) { setIsMuted(true); v.muted = true; } else if (isMuted) { setIsMuted(false); v.muted = false; }
        };
        const cycleSpeed = () => {
            const steps = [0.75, 1, 1.25, 1.5];
            const idx = steps.indexOf(speed);
            const next = steps[(idx + 1) % steps.length];
            setSpeed(next);
            const v = videoRef.current; if (v) v.playbackRate = next;
        };
        // Keep fs state in sync with browser fullscreen
        React.useEffect(() => {
            const handleFsChange = () => {
                const isFs = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement
                );
                setFs(isFs);
            };
            document.addEventListener('fullscreenchange', handleFsChange);
            document.addEventListener('webkitfullscreenchange', handleFsChange);
            document.addEventListener('msfullscreenchange', handleFsChange);
            return () => {
                document.removeEventListener('fullscreenchange', handleFsChange);
                document.removeEventListener('webkitfullscreenchange', handleFsChange);
                document.removeEventListener('msfullscreenchange', handleFsChange);
            };
        }, []);

        const toggleFs = async () => {
            const el = containerRef.current;
            const vid = videoRef.current;
            try {
                const isFsNow = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement
                );
                if (!isFsNow) {
                    if (el?.requestFullscreen) {
                        await el.requestFullscreen();
                    } else if (el?.webkitRequestFullscreen) {
                        el.webkitRequestFullscreen();
                    } else if (el?.msRequestFullscreen) {
                        el.msRequestFullscreen();
                    } else if (vid?.webkitEnterFullscreen) {
                        // iOS Safari fallback: use the native video fullscreen
                        vid.webkitEnterFullscreen();
                        setFs(true);
                        return;
                    }
                    setFs(true);
                } else {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    setFs(false);
                }
            } catch {}
        };


        return (
            <div
                className="videoP-player"
                ref={containerRef}
                style={{
                    width: fs ? '100vw' : '100%',
                    maxWidth: fs ? '100vw' : 960,
                    margin: fs ? 0 : '0 auto',
                    height: fs ? '100vh' : 'auto',
                    backgroundColor: '#000',
                    position: 'relative',
                    display: fs ? 'block' : 'flex',
                    flexDirection: fs ? 'unset' : 'column',
                }}
            >
                <video
                    className="videoP-video"
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    onLoadedMetadata={onLoaded}
                    onTimeUpdate={onTime}
                    preload="metadata"
                    playsInline
                    style={{
                        width: fs ? '100vw' : '100%',
                        height: fs ? '100vh' : 540,
                        display: 'block',
                        borderRadius: fs ? 0 : 8,
                        objectFit: fs ? 'cover' : 'contain',
                        backgroundColor: '#000',
                    }}
                />
                <div
                    className="videoP-controls"
                    style={fs ? {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '8px 12px',
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 80%)',
                        color: '#fff'
                    } : undefined}
                >
                    <div className="videoP-left">
                        <button className="vc-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <Pause size={16} color="white"/> : <Play size={16} color="white"/>}
                        </button>
                        <div className="videoP-time">{fmt(current)} / {fmt(duration)}</div>
                    </div>
                    <div className="videoP-center">
                        <input
                            className="videoP-seek"
                            
                            type="range"
                            min={0}
                            max={Math.max(0, duration)}
                            step="0.1"
                            value={Math.min(current, duration || 0)}
                            onChange={onSeek}
                            aria-label="Seek"
                        />
                    </div>
                    <div className="videoP-right">
                        <button className="vc-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            className="videoP-volume"
                            type="range"
                            min={0}
                            max={1}
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={onVolume}
                            aria-label="Volume"
                        />
                        <button className="videoP-btn videoP-speed" onClick={cycleSpeed} aria-label="Speed">
                            {speed.toFixed(2).replace(/\.00$/, '')}x
                        </button>
                        <button className="vc-btn" onClick={toggleFs} aria-label={fs ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                            {fs ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default VideoPlayer;
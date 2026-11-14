import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { SYSTEM_MOTIONS, getMotionPhase } from './system-motion';
import './system-motion.css';

function MotionClip({ motion, onUnavailable }) {
    const stage = useRef(null);
    const player = useRef(null);
    const playback = useRef(() => {});
    const intent = useRef('auto');
    const replayPending = useRef(false);
    const currentPhase = useRef(0);
    const [playing, setPlaying] = useState(false);
    const [frameReady, setFrameReady] = useState(false);
    const [posterOnly, setPosterOnly] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [unavailable, setUnavailable] = useState(false);
    const [posterUnavailable, setPosterUnavailable] = useState(false);
    const [playBlocked, setPlayBlocked] = useState(false);
    const phase = motion.phases[phaseIndex];

    useEffect(() => {
        const video = player.current;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        let mounted = true;
        let visible = false;
        let sourceLoaded = false;
        let failed = false;
        let attempt = 0;

        function wantsPlayback() {
            return mounted && visible && !document.hidden && !failed
                && (intent.current === 'play' || (intent.current === 'auto' && !media.matches));
        }

        function reconcile() {
            attempt += 1;
            const currentAttempt = attempt;
            if (!wantsPlayback()) {
                video.pause();
                return;
            }
            if (!sourceLoaded) {
                sourceLoaded = true;
                video.src = motion.video;
                video.load();
            }
            const result = video.play();
            if (result?.then) {
                result.then(() => {
                    if (!mounted) {
                        video.pause();
                        return;
                    }
                    if (currentAttempt !== attempt) return;
                    if (!wantsPlayback()) video.pause();
                }).catch((error) => {
                    if (!mounted || currentAttempt !== attempt) return;
                    if (error.name !== 'AbortError') setPlayBlocked(true);
                });
            }
        }

        function onError() {
            failed = true;
            attempt += 1;
            video.pause();
            setUnavailable(true);
        }

        function onVisibility() { reconcile(); }
        function onMotionPreference() {
            setPosterOnly(media.matches && intent.current !== 'play');
            reconcile();
        }

        playback.current = reconcile;
        video.addEventListener('error', onError);
        document.addEventListener('visibilitychange', onVisibility);
        media.addEventListener('change', onMotionPreference);

        let observer;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
                reconcile();
            }, { threshold: [0, 0.1] });
            observer.observe(stage.current);
        } else {
            visible = true;
            reconcile();
        }

        return () => {
            mounted = false;
            attempt += 1;
            observer?.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            media.removeEventListener('change', onMotionPreference);
            video.removeEventListener('error', onError);
            video.pause();
            video.removeAttribute('src');
            video.load();
            playback.current = () => {};
        };
    }, [motion]);

    function togglePlayback() {
        intent.current = playing ? 'pause' : 'play';
        if (!playing) setPosterOnly(false);
        setPlayBlocked(false);
        playback.current();
    }

    function replay() {
        const video = player.current;
        replayPending.current = video.readyState === 0;
        if (video.readyState > 0) video.currentTime = 0;
        currentPhase.current = 0;
        setPhaseIndex(0);
        setPosterOnly(false);
        setPlayBlocked(false);
        intent.current = 'play';
        playback.current();
    }

    function onMetadata() {
        if (replayPending.current) {
            player.current.currentTime = 0;
            replayPending.current = false;
        }
    }

    function onTimeUpdate() {
        const next = getMotionPhase(motion.phases, player.current.currentTime);
        if (next === currentPhase.current) return;
        currentPhase.current = next;
        setPhaseIndex(next);
    }

    return (
        <figure className="motion-player" aria-label={`${motion.title} system animation`}>
            <div className="motion-stage" ref={stage}>
                {!posterUnavailable && <img className="motion-poster" src={motion.poster} alt={motion.posterDescription} width="1280" height="720" loading="lazy" onError={() => setPosterUnavailable(true)} />}
                {posterUnavailable && <div className="motion-poster-fallback"><span>{motion.title}</span><p>A connected system, shown in layers.</p></div>}
                <video ref={player} className={`motion-video${frameReady && !posterOnly ? ' motion-has-frame' : ''}`} width="1280" height="720" preload="none" muted playsInline loop aria-hidden="true" onLoadedMetadata={onMetadata} onLoadedData={() => setFrameReady(true)} onPlay={() => { setPlaying(true); setPlayBlocked(false); }} onPause={() => setPlaying(false)} onTimeUpdate={onTimeUpdate} />
                {unavailable && <div className="motion-unavailable" role="status"><span>Animation unavailable</span><p>The system diagram is still available.</p>{onUnavailable && <button type="button" onClick={onUnavailable}>View diagram</button>}</div>}
            </div>
            <figcaption className="motion-caption">
                <div className="motion-phase"><strong>{phase.label}</strong><p>{phase.description}</p>{playBlocked && !unavailable && <p className="motion-play-hint">Press Play animation to start.</p>}</div>
                <div className="motion-controls" aria-label={`${motion.title} animation playback`}>
                    <button type="button" onClick={togglePlayback} disabled={unavailable} aria-label={`${playing ? 'Pause' : 'Play'} animation: ${motion.title}`}>{playing ? <Pause className="motion-control-symbol" size={15} aria-hidden="true" /> : <Play className="motion-control-symbol" size={15} aria-hidden="true" />}{playing ? 'Pause' : 'Play'} animation</button>
                    <button type="button" onClick={replay} disabled={unavailable} aria-label={`Replay animation: ${motion.title}`}><RotateCcw className="motion-control-symbol" size={15} aria-hidden="true" />Replay</button>
                </div>
            </figcaption>
        </figure>
    );
}

export default function SystemMotion({ discipline = 'software', onUnavailable }) {
    const motion = SYSTEM_MOTIONS[discipline] ?? SYSTEM_MOTIONS.software;
    return <MotionClip key={motion.id} motion={motion} onUnavailable={onUnavailable} />;
}

import { Component, lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import './landing.css';
import './motion-studies.css';

const MotionStudyCanvas = lazy(() => import('./MotionStudyCanvas'));

const STUDIES = [
    {
        id: 'payroll',
        number: '01',
        name: 'Contract Loom',
        discipline: 'Integration',
        shortName: 'Payroll',
        client: 'Global HR platform',
        title: 'One contract. Many systems.',
        project: 'Payroll integration across 20+ jurisdictions',
        description: 'Different providers, record structures, and failure modes resolve into one dependable API.',
        mechanism: 'Records arrive through distinct lanes. Fields align to a common contract, duplicates resolve into one result, and retries take a separate path while the system keeps moving.',
        material: 'A translucent contract aperture, olive alignment rails, and a cherry trace through the active record.',
        caption: 'Different records enter. One consistent contract emerges.',
        alt: 'Structured provider records converge through a transparent contract aperture into a consistent output stream.',
        beats: ['Provider records', 'Contract alignment', 'Duplicate resolution', 'Isolated retry'],
        outcomes: [['20+', 'Countries live'], ['4 ms', 'p50 latency'], ['99.99%', 'API availability']],
        stack: 'Python · FastAPI · GCP',
        year: '2024',
    },
    {
        id: 'legal',
        number: '02',
        name: 'Citation Field',
        discipline: 'Retrieval',
        shortName: 'Legal retrieval',
        client: 'Legal-tech B2B',
        title: 'Find the passage. Keep its source.',
        project: 'Vector search for case law & contracts',
        description: 'A query moves through a dense legal corpus and reveals relevant passages with their provenance intact.',
        mechanism: 'Document fragments form a spatial index. Lexical matches and semantic neighborhoods converge into an ordered set of passages, with visible connections back to the source material.',
        material: 'Thin ivory excerpts, dark paragraph structures, selective glass, and cherry citation paths.',
        caption: 'A field of information becomes a small set of traceable passages.',
        alt: 'A deep field of structured legal document fragments opens around selected passages, with fine citation paths connecting the results to their sources.',
        beats: ['Indexed fragments', 'Lexical & semantic search', 'Relevant passages', 'Source connections'],
        outcomes: [['12 ms', 'Average query'], ['99.9%', 'Recall@10'], ['4M+', 'Documents indexed']],
        stack: 'Pinecone · pgvector · LangChain',
        year: '2025',
    },
    {
        id: 'edge',
        number: '03',
        name: 'Signal Surface',
        discipline: 'Streaming',
        shortName: 'Edge detection',
        client: 'Fintech',
        title: 'See the deviation. Keep the flow.',
        project: 'Real-time anomaly detection at the edge',
        description: 'A continuous market-data stream meets local scoring. One abnormal sequence separates from the flow.',
        mechanism: 'Signals travel through distributed scoring cells. A local cell detects a distinct deviation and sends it along an independent alert route; the rest of the field continues to operate.',
        material: 'Fine signal filaments, small inspection windows, and a cherry deviation with a distinct shape.',
        caption: 'A local decision becomes visible without interrupting the system.',
        alt: 'Continuous signal filaments pass through a distributed scoring field as a distinct cherry anomaly separates into an independent alert route.',
        beats: ['Continuous events', 'Local scoring', 'A distinct deviation', 'Traceable alert'],
        outcomes: [['<1 ms', 'Edge latency'], ['128', 'Edge nodes'], ['24/7', 'In production']],
        stack: 'Kinesis · Kafka · ONNX',
        year: '2025',
    },
];

function useReducedMotion() {
    const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(media.matches);
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);
    return reduced;
}

class SceneBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() { return { failed: true }; }

    componentDidCatch(error) { this.props.onFailure(error); }

    render() { return this.state.failed ? null : this.props.children; }
}

function InteractivePlayer({ study }) {
    const captureMode = new URLSearchParams(window.location.search).get('capture') === '1';
    const stage = useRef(null);
    const [visible, setVisible] = useState(false);
    const [entered, setEntered] = useState(false);
    const [hidden, setHidden] = useState(() => document.hidden);
    const [enabled, setEnabled] = useState(true);
    const [intent, setIntent] = useState('auto');
    const [ready, setReady] = useState(false);
    const [failure, setFailure] = useState(false);
    const [posterFailure, setPosterFailure] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(12);
    const [seek, setSeek] = useState(null);
    const reducedMotion = useReducedMotion();
    const timelineId = useId();
    const mountScene = !failure && (captureMode || enabled || (entered && !reducedMotion));
    const playing = !captureMode && mountScene && visible && !hidden && (intent === 'play' || (intent === 'auto' && !reducedMotion));

    useEffect(() => {
        const updateVisibility = () => setHidden(document.hidden);
        document.addEventListener('visibilitychange', updateVisibility);
        const observer = new IntersectionObserver(([entry]) => {
            const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
            setVisible(isVisible);
            if (isVisible) setEntered(true);
        }, { threshold: [0, 0.1] });
        observer.observe(stage.current);
        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', updateVisibility);
        };
    }, []);

    function playOrPause() {
        setEnabled(true);
        setIntent(playing ? 'pause' : 'play');
    }

    function replay() {
        setEnabled(true);
        setIntent('play');
        setTime(0);
        setSeek({ time: 0 });
    }

    function scrub(event) {
        const next = Number(event.target.value);
        setEnabled(true);
        setIntent('pause');
        setTime(next);
        setSeek({ time: next });
    }

    function onReady(details) {
        setReady(true);
        if (details.duration > 0) setDuration(details.duration);
    }

    return (
        <figure className="ms-film" aria-label={`${study.name} interactive scene study`}>
            <div className="ms-stage" ref={stage}>
                {!posterFailure && <img className={`ms-poster${ready && mountScene ? ' ms-poster-covered' : ''}`} src={`/motion-studies/${study.id}.webp`} alt={study.alt} width="1600" height="900" loading="lazy" onError={() => setPosterFailure(true)} />}
                {posterFailure && !ready && <div className="ms-still-fallback"><span>{study.name}</span><p>{study.caption}</p></div>}
                {mountScene && (
                    <SceneBoundary onFailure={() => setFailure(true)}>
                        <Suspense fallback={null}>
                            <MotionStudyCanvas modelUrl={`/motion-studies/${study.id}.glb`} playing={playing} seek={seek} onReady={onReady} onProgress={setTime} captureMode={captureMode} />
                        </Suspense>
                    </SceneBoundary>
                )}
                {mountScene && !ready && <div className="ms-scene-status" role="status">Opening the 3D study…</div>}
                {!mountScene && !failure && reducedMotion && <button className="ms-stage-play" type="button" onClick={playOrPause}><Play size={17} aria-hidden="true" /> Explore the 3D study</button>}
                {failure && <div className="ms-scene-status ms-scene-failed" role="status">The interactive scene could not load. The still view and concept description remain available.</div>}
            </div>
            <figcaption className="ms-film-caption">
                <div className="ms-film-caption-copy"><span>{study.name}</span><p>{study.caption}</p></div>
                <div className="ms-player-controls" role="group" aria-label={`${study.name} playback`}>
                    <button type="button" disabled={failure} onClick={playOrPause} aria-label={`${playing ? 'Pause' : 'Play'} study: ${study.name}`}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{playing ? 'Pause' : 'Play'} study</button>
                    <button type="button" disabled={failure} onClick={replay} aria-label={`Replay study: ${study.name}`}><RotateCcw size={15} aria-hidden="true" />Replay</button>
                </div>
            </figcaption>
            <div className="ms-timeline">
                <label htmlFor={timelineId} className="ms-visually-hidden">Explore the {study.name} timeline</label>
                <input id={timelineId} type="range" min="0" max={Math.max(0.1, duration - 0.01)} step="0.05" value={Math.min(time, duration - 0.01)} onChange={scrub} disabled={failure} aria-valuetext={`${time.toFixed(1)} of ${duration.toFixed(0)} seconds`} />
                <span aria-hidden="true">{String(Math.floor(time)).padStart(2, '0')} / {duration.toFixed(0)} s</span>
            </div>
            <ol className="ms-story-beats" aria-label="What the scene reveals">{study.beats.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol>
        </figure>
    );
}

function FilmPlayer({ study }) {
    const stage = useRef(null);
    const player = useRef(null);
    const intent = useRef('auto');
    const pendingSeek = useRef(null);
    const reconcilePlayback = useRef(() => {});
    const requestSource = useRef(() => {});
    const [playing, setPlaying] = useState(false);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
    const [posterFailure, setPosterFailure] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(12);
    const timelineId = useId();

    useEffect(() => {
        const video = player.current;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        let visible = false;
        let sourceLoaded = false;
        let mounted = true;
        let unavailable = false;
        let attempt = 0;

        function loadSource() {
            if (sourceLoaded || !mounted || unavailable) return;
            sourceLoaded = true;
            video.src = `/motion-studies/${study.id}.mp4`;
            video.load();
        }

        function wantsPlayback() {
            return mounted && visible && !document.hidden && !unavailable
                && (intent.current === 'play' || (intent.current === 'auto' && !media.matches));
        }

        function reconcile() {
            const activeAttempt = ++attempt;
            if (!wantsPlayback()) { video.pause(); return; }
            loadSource();
            video.play()?.then(() => {
                if (!mounted || !wantsPlayback()) video.pause();
            }).catch((error) => {
                if (mounted && activeAttempt === attempt && error.name !== 'AbortError') setBlocked(true);
            });
        }

        function onError() {
            unavailable = true;
            attempt += 1;
            video.pause();
            setPlaying(false);
            setReady(false);
            setFailed(true);
        }

        requestSource.current = loadSource;
        reconcilePlayback.current = reconcile;
        video.addEventListener('error', onError);
        document.addEventListener('visibilitychange', reconcile);
        media.addEventListener('change', reconcile);
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
            reconcile();
        }, { threshold: [0, 0.1] });
        observer.observe(stage.current);
        return () => {
            mounted = false;
            attempt += 1;
            observer.disconnect();
            document.removeEventListener('visibilitychange', reconcile);
            media.removeEventListener('change', reconcile);
            video.removeEventListener('error', onError);
            video.pause();
            video.removeAttribute('src');
            video.load();
            reconcilePlayback.current = () => {};
            requestSource.current = () => {};
        };
    }, [study]);

    function toggle() {
        intent.current = playing ? 'pause' : 'play';
        if (playing) setTime(player.current.currentTime);
        setBlocked(false);
        reconcilePlayback.current();
    }

    function replay() {
        pendingSeek.current = 0;
        if (player.current.readyState > 0) player.current.currentTime = 0;
        setTime(0);
        setBlocked(false);
        intent.current = 'play';
        reconcilePlayback.current();
    }

    function scrub(event) {
        const next = Number(event.target.value);
        intent.current = 'pause';
        pendingSeek.current = next;
        player.current.pause();
        requestSource.current();
        if (player.current.readyState > 0) player.current.currentTime = next;
        setTime(next);
    }

    function metadata() {
        const video = player.current;
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        setDuration(video.duration);
        if (pendingSeek.current !== null) {
            video.currentTime = Math.min(pendingSeek.current, Math.max(0, video.duration - 0.01));
            pendingSeek.current = null;
        }
    }

    return (
        <figure className="ms-film" aria-label={`${study.name} motion study`}>
            <div className="ms-stage" ref={stage}>
                {!posterFailure && <img className={`ms-poster${ready ? ' ms-poster-covered' : ''}`} src={`/motion-studies/${study.id}.webp`} alt={study.alt} width="960" height="600" loading="lazy" onError={() => setPosterFailure(true)} />}
                {posterFailure && !ready && <div className="ms-still-fallback"><span>{study.name}</span><p>{study.caption}</p></div>}
                <video ref={player} className={`ms-video${ready ? ' ms-video-ready' : ''}`} width="960" height="600" preload="none" muted playsInline loop aria-hidden="true" onLoadedMetadata={metadata} onLoadedData={() => setReady(true)} onPlay={() => { setPlaying(true); setBlocked(false); }} onPause={() => setPlaying(false)} onTimeUpdate={() => { if (intent.current !== 'pause') setTime(player.current.currentTime); }} />
                {failed && <div className="ms-scene-status" role="status">{posterFailure ? 'The film and still view could not load. Explore 3D and the concept description remain available.' : 'The film could not load. The still view and Explore 3D remain available.'}</div>}
                {blocked && !failed && <div className="ms-scene-status" role="status">Press Play study to start the film.</div>}
            </div>
            <figcaption className="ms-film-caption"><div className="ms-film-caption-copy"><span>{study.name}</span><p>{study.caption}</p></div><div className="ms-player-controls" role="group" aria-label={`${study.name} playback`}><button type="button" onClick={toggle} disabled={failed} aria-label={`${playing ? 'Pause' : 'Play'} study: ${study.name}`}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{playing ? 'Pause' : 'Play'} study</button><button type="button" onClick={replay} disabled={failed} aria-label={`Replay study: ${study.name}`}><RotateCcw size={15} aria-hidden="true" />Replay</button></div></figcaption>
            <div className="ms-timeline"><label htmlFor={timelineId} className="ms-visually-hidden">Explore the {study.name} timeline</label><input id={timelineId} type="range" min="0" max={Math.max(0.1, duration - 0.01)} step="0.05" value={Math.min(time, duration - 0.01)} onChange={scrub} disabled={failed} aria-valuetext={`${time.toFixed(1)} of ${duration.toFixed(0)} seconds`} /><span aria-hidden="true">{String(Math.floor(time)).padStart(2, '0')} / {duration.toFixed(0)} s</span></div>
            <ol className="ms-story-beats" aria-label="What the scene reveals">{study.beats.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol>
        </figure>
    );
}

function StudyPlayer({ study }) {
    const captureMode = new URLSearchParams(window.location.search).get('capture') === '1';
    const [presentation, setPresentation] = useState(captureMode ? '3d' : 'film');
    return (
        <div className="ms-presentation">
            {!captureMode && <div className="ms-presentation-switch" role="group" aria-label="Study presentation"><button type="button" aria-pressed={presentation === 'film'} onClick={() => setPresentation('film')}>Film</button><button type="button" aria-pressed={presentation === '3d'} onClick={() => setPresentation('3d')}>Explore 3D</button>{presentation === '3d' && <span>Drag or zoom to inspect.</span>}</div>}
            {presentation === '3d' ? <InteractivePlayer study={study} /> : <FilmPlayer study={study} />}
        </div>
    );
}

function navigateStudies(event, index, tabs, select) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % STUDIES.length;
    else if (event.key === 'ArrowLeft') next = (index + STUDIES.length - 1) % STUDIES.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = STUDIES.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
}

export function CaseStudyShowcase() {
    const [active, setActive] = useState(0);
    const tabs = useRef([]);
    const id = useId();
    const study = STUDIES[active];
    return (
        <section className="ms-home-showcase" aria-labelledby={`${id}-heading`}>
            <div className="ms-showcase-toolbar">
                <h2 className="ms-showcase-label" id={`${id}-heading`}>Selected work</h2>
                <div className="ms-showcase-tabs" role="tablist" aria-label="Selected engineering work">{STUDIES.map((item, index) => <button ref={(element) => { tabs.current[index] = element; }} key={item.id} type="button" role="tab" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => navigateStudies(event, index, tabs, setActive)}>{item.shortName}</button>)}</div>
            </div>
            <div id={`${id}-panel`} className="ms-showcase-layout" role="tabpanel" aria-labelledby={`${id}-tab-${study.id}`} tabIndex={0}>
                <StudyPlayer key={study.id} study={study} />
                <aside className="ms-showcase-aside" aria-label={`${study.project} project context`}>
                    <p className="ms-showcase-client">{study.client}</p>
                    <h3>{study.project}</h3>
                    <p className="ms-showcase-brief">{study.description}</p>
                    <p className="ms-showcase-stack">{study.year} · {study.stack}</p>
                    <dl className="ms-outcomes">{study.outcomes.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
                    <p className="ms-outcomes-note">Reported project outcomes. The film illustrates the engineering process.</p>
                    <a className="ms-showcase-detail" href={`/motion-studies?study=${study.id}`}>Explore the motion study <ArrowUpRight size={15} aria-hidden="true" /></a>
                </aside>
            </div>
        </section>
    );
}

export default function MotionStudies() {
    const [active, setActive] = useState(() => {
        const requested = new URLSearchParams(window.location.search).get('study');
        return Math.max(0, STUDIES.findIndex((study) => study.id === requested));
    });
    const tabs = useRef([]);
    const id = useId();
    const study = STUDIES[active];

    return (
        <div className="berix-site ms-page" data-theme="light">
            <a href="#motion-studies-main" className="berix-skip-link">Skip to the studies</a>
            <header className="ms-header">
                <a href="/" className="berix-wordmark" aria-label="BERIX home">BERIX</a>
                <span>Engineering in motion</span>
                <a className="ms-home-link" href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to the landing page</a>
            </header>
            <main id="motion-studies-main" className="ms-main" tabIndex={-1}>
                <div className="ms-intro">
                    <p className="ms-kicker">Concept studies</p>
                    <h1>Engineering, <span>made visible.</span></h1>
                    <p className="ms-intro-text">Three visual studies of the systems BERIX builds: integration, retrieval, and decisions at the edge.</p>
                </div>
                <div className="ms-study-tabs" role="tablist" aria-label="Explore the three motion studies">{STUDIES.map((item, index) => <button ref={(element) => { tabs.current[index] = element; }} type="button" key={item.id} id={`${id}-tab-${item.id}`} role="tab" aria-controls={`${id}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onKeyDown={(event) => navigateStudies(event, index, tabs, setActive)} onClick={() => setActive(index)}><span className="ms-tab-number">{item.number}</span><span><strong>{item.name}</strong><small>{item.discipline}</small></span><ArrowUpRight size={18} aria-hidden="true" /></button>)}</div>
                <section className="ms-study-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${study.id}`} tabIndex={0}>
                    <div className="ms-study-heading"><p>{study.client}</p><h2>{study.title}</h2><p className="ms-study-description">{study.description}</p></div>
                    <StudyPlayer key={study.id} study={study} />
                    <div className="ms-context">
                        <div className="ms-concept-description"><h3>The visual mechanism</h3><p>{study.mechanism}</p><p>{study.material}</p></div>
                        <div className="ms-project-evidence"><h3>{study.project}</h3><p className="ms-project-meta">{study.year} · {study.stack}</p><dl className="ms-outcomes">{study.outcomes.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl><p className="ms-outcomes-note">Reported project outcomes from the BERIX website. The scene illustrates the engineering process; it is not a timing simulation.</p></div>
                    </div>
                </section>
            </main>
            <footer className="ms-footer"><span>BERIX · Original motion studies</span><a href="https://berixsystems.com/#work" target="_blank" rel="noreferrer">Read the selected work <ArrowUpRight size={14} aria-hidden="true" /></a></footer>
        </div>
    );
}

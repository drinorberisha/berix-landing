import { useId, useRef, useState } from 'react';
import SystemMotion from './SystemMotion';
import './software-visuals.css';

const systemViews = [
    {
        id: 'software',
        label: 'Software',
        title: 'A dependable application',
        inputs: ['Web application', 'Internal tools'],
        center: 'APIs & business logic',
        centerDetail: 'Clear interfaces. Tested behavior.',
        outputs: ['Business records', 'Connected services'],
        note: 'Keep the interface, business rules, and data connected through clear, maintainable boundaries.',
        inputLabel: 'Your team’s interfaces',
        outputLabel: 'The systems behind the work',
    },
    {
        id: 'data',
        label: 'Data',
        title: 'A useful data foundation',
        inputs: ['Operational systems', 'Files & event streams'],
        center: 'Pipelines & quality checks',
        centerDetail: 'Structure, validation, and context.',
        outputs: ['Shared data models', 'Reporting & decisions'],
        note: 'Bring sources together, check their quality, and give the business a shared view it can use.',
        inputLabel: 'Information at its source',
        outputLabel: 'Information ready to use',
    },
    {
        id: 'ai',
        label: 'Applied AI',
        title: 'AI grounded in your workflow',
        inputs: ['Approved knowledge', 'A specific business need'],
        center: 'Retrieval & evaluation',
        centerDetail: 'Relevant context. Checked output.',
        outputs: ['Human review', 'A useful next action'],
        note: 'Connect the right context to a specific task, evaluate the output, and keep people in control.',
        inputLabel: 'Context with a purpose',
        outputLabel: 'Useful, inspectable outcomes',
    },
];

export function SoftwareSystem() {
    const [active, setActive] = useState(0);
    const [presentation, setPresentation] = useState('animation');
    const tabs = useRef([]);
    const id = useId();
    const view = systemViews[active];

    function navigate(event, index) {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % systemViews.length;
        else if (event.key === 'ArrowLeft') next = (index + systemViews.length - 1) % systemViews.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = systemViews.length - 1;
        else return;
        event.preventDefault();
        setActive(next);
        tabs.current[next]?.focus();
    }

    return (
        <section className="sv-system" aria-label="Explore an example of a connected system">
            <div className="sv-system-toolbar">
                <p className="sv-example-label">An example of a connected system</p>
                <div className="sv-system-tabs" role="tablist" aria-label="Engineering discipline">
                    {systemViews.map((item, index) => (
                        <button key={item.id} ref={(element) => { tabs.current[index] = element; }} type="button" role="tab" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onKeyDown={(event) => navigate(event, index)} onClick={() => setActive(index)}>{item.label}</button>
                    ))}
                </div>
            </div>
            <div className="sv-system-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${view.id}`} tabIndex={0}>
                <div className="sv-system-heading">
                    <p className="sv-system-title">{view.title}</p>
                    <div className="sv-presentation-controls" role="group" aria-label="System presentation">
                        <button type="button" aria-pressed={presentation === 'animation'} onClick={() => setPresentation('animation')}>Animation</button>
                        <button type="button" aria-pressed={presentation === 'diagram'} onClick={() => setPresentation('diagram')}>Diagram</button>
                    </div>
                </div>
                {presentation === 'animation' ? (
                    <div className="sv-motion-layout">
                        <SystemMotion discipline={view.id} onUnavailable={() => setPresentation('diagram')} />
                        <dl className="sv-system-overview">
                            <div><dt>Inputs</dt><dd>{view.inputs.map((item) => <span key={item}>{item}</span>)}<small>{view.inputLabel}</small></dd></div>
                            <div><dt>Engineering</dt><dd><strong>{view.center}</strong><small>{view.centerDetail}</small></dd></div>
                            <div><dt>Outcomes</dt><dd>{view.outputs.map((item) => <span key={item}>{item}</span>)}<small>{view.outputLabel}</small></dd></div>
                        </dl>
                    </div>
                ) : <ol className="sv-system-flow" aria-label={`${view.label} example flow`}>
                    <li className="sv-stage sv-stage-input">
                        <span className="sv-stage-label">Inputs</span>
                        <div className="sv-node-stack">{view.inputs.map((input) => <div className="sv-small-node" key={input}>{input}</div>)}</div>
                        <p className="sv-stage-caption">{view.inputLabel}</p>
                    </li>
                    <li className="sv-stage sv-stage-core">
                        <span className="sv-stage-label">Engineering</span>
                        <div className="sv-core-node"><span className="sv-code-symbol" aria-hidden="true">{'{ }'}</span><strong>{view.center}</strong><span>{view.centerDetail}</span></div>
                    </li>
                    <li className="sv-stage sv-stage-output">
                        <span className="sv-stage-label">Outcomes</span>
                        <div className="sv-node-stack">{view.outputs.map((output) => <div className="sv-small-node" key={output}>{output}</div>)}</div>
                        <p className="sv-stage-caption">{view.outputLabel}</p>
                    </li>
                </ol>}
                <p className="sv-system-note">{view.note}</p>
            </div>
        </section>
    );
}

const documents = [
    { id: 'api', title: 'API handover', kind: 'Engineering', text: 'Keep service contracts, ownership, and deployment decisions together so the next engineer can work with context.' },
    { id: 'quality', title: 'Data quality checks', kind: 'Data', text: 'Record source definitions and validation rules alongside the data model, with a clear path for investigating exceptions.' },
    { id: 'workflow', title: 'Workflow ownership', kind: 'Operations', text: 'Link each recurring process to its owner, inputs, and next action so important work does not depend on memory.' },
];

export function KnowledgeExample() {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState('api');
    const id = useId();
    const filtered = documents.filter((document) => `${document.title} ${document.kind} ${document.text}`.toLowerCase().includes(query.toLowerCase().trim()));
    const current = filtered.find((document) => document.id === selected) ?? filtered[0];

    return (
        <section className="sv-knowledge" aria-label="Interactive knowledge retrieval example">
            <div className="sv-mini-heading"><span>Knowledge retrieval</span><span className="sv-example-tag">Illustrative documents</span></div>
            <label className="sv-search-label" htmlFor={`${id}-search`}>Search the example knowledge</label>
            <input id={`${id}-search`} className="sv-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “data” or “workflow”" />
            <div className="sv-knowledge-body">
                {filtered.length ? (
                    <>
                        <ul className="sv-document-list" aria-label="Matching example documents">{filtered.map((document) => <li key={document.id}><button type="button" aria-pressed={current?.id === document.id} onClick={() => setSelected(document.id)}><span className="sv-document-icon" aria-hidden="true">≡</span><span>{document.title}<small>{document.kind}</small></span><span className="sv-document-arrow" aria-hidden="true">↗</span></button></li>)}</ul>
                        <div className="sv-document-preview" aria-live="polite"><strong>{current.title}</strong><p>{current.text}</p></div>
                    </>
                ) : <p className="sv-empty" role="status">No example documents match. Try “data”, “API”, or “workflow”.</p>}
            </div>
        </section>
    );
}

const workflowSteps = [
    { title: 'Capture the request', text: 'Keep the original request and the business need together.' },
    { title: 'Review with context', text: 'A person checks the proposed change before it proceeds.' },
    { title: 'Record the outcome', text: 'Keep the decision and next action linked to the request.' },
];

export function WorkflowExample() {
    const [step, setStep] = useState(0);
    return (
        <section className="sv-workflow" aria-label="Interactive human-reviewed workflow example">
            <div className="sv-mini-heading"><span>A connected workflow</span><span className="sv-example-tag">Interactive example</span></div>
            <ol className="sv-workflow-steps">{workflowSteps.map((item, index) => <li className={index === step ? 'sv-current-step' : index < step ? 'sv-complete-step' : ''} key={item.title} aria-current={index === step ? 'step' : undefined}><span className="sv-workflow-marker" aria-hidden="true">{index < step ? '✓' : index + 1}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}</ol>
            <div className="sv-workflow-controls"><p role="status">{step === 2 ? 'Example complete.' : step === 1 ? 'Ready for a human decision.' : 'A request starts the flow.'}</p><button type="button" onClick={() => setStep(step === 2 ? 0 : step + 1)}>{step === 2 ? 'Reset example' : step === 1 ? 'Record example' : 'Review example'}<span aria-hidden="true">→</span></button></div>
        </section>
    );
}

export default SoftwareSystem;

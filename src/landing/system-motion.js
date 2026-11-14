export const SYSTEM_MOTIONS = {
    software: {
        id: 'software',
        title: 'Software',
        video: '/motion/software.mp4',
        poster: '/motion/software.webp',
        posterDescription: 'Software components arranged around a connected application core.',
        phases: [
            { at: 0, label: 'Connected core', description: 'Interfaces, services, and business records form one system.' },
            { at: 0.8, label: 'Separate layers', description: 'The component boundaries become visible.' },
            { at: 2.3, label: 'Assemble software', description: 'Clear interfaces reconnect the application layers.' },
            { at: 6.2, label: 'Connected outcome', description: 'The parts work together as a dependable whole.' },
        ],
    },
    data: {
        id: 'data',
        title: 'Data',
        video: '/motion/data.mp4',
        poster: '/motion/data.webp',
        posterDescription: 'Data packets organized into a connected structured model.',
        phases: [
            { at: 0, label: 'Connected core', description: 'Sources and shared models belong to one data foundation.' },
            { at: 0.8, label: 'Separate packets', description: 'Individual sources and records become visible.' },
            { at: 2.3, label: 'Validate and structure', description: 'Checks and shared definitions bring the data together.' },
            { at: 6.2, label: 'Connected outcome', description: 'Structured information is ready to use.' },
        ],
    },
    ai: {
        id: 'ai',
        title: 'Applied AI',
        video: '/motion/ai.mp4',
        poster: '/motion/ai.webp',
        posterDescription: 'Context components arranged around a connected retrieval and evaluation core.',
        phases: [
            { at: 0, label: 'Connected core', description: 'Knowledge and a specific task give the system its purpose.' },
            { at: 0.8, label: 'Separate context', description: 'The sources and context components become visible.' },
            { at: 2.3, label: 'Evaluate and review', description: 'Relevant context reconnects through evaluation and human review.' },
            { at: 6.2, label: 'Connected outcome', description: 'The system supports an inspectable next action.' },
        ],
    },
};

export function getMotionPhase(phases, time) {
    for (let index = phases.length - 1; index >= 0; index -= 1) {
        if (time >= phases[index].at) return index;
    }
    return 0;
}

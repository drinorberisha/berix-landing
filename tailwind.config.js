/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
                sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            colors: {
                paper: '#F4EFE6',
                paperdeep: '#EDE6D8',
                ink: '#15140F',
                inkmute: '#615C53',
                ember: '#B83A1A',
                emberdeep: '#7C2410',
                line: 'rgba(21,20,15,0.12)',
            },
            letterSpacing: {
                tightest: '-0.045em',
                tighter2: '-0.025em',
            },
        },
    },
    plugins: [],
}

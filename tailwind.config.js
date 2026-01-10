/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nexus: {
                    900: '#0f172a',
                    800: '#1e293b',
                    accent: '#6366f1',
                    accentHover: '#4f46e5',
                }
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out',
                'slide-up': 'slideUp 0.8s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' },
                    '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' },
                }
            }
        },
    },
    plugins: [],
}

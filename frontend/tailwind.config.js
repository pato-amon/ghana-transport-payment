// frontend/tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // Ghana Flag Colors + Transport Theme
                primary: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    900: '#7c2d12',
                },
                ghana: {
                    red: '#CF0921',
                    gold: '#FCD116',
                    green: '#006B3F',
                    black: '#000000',
                },
                transport: {
                    bus: '#1e40af',
                    success: '#16a34a',
                    warning: '#ca8a04',
                    danger: '#dc2626',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Poppins', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'bounce-slow': 'bounce 2s infinite',
                'pulse-green': 'pulseGreen 2s infinite',
            }
        },
    },
    plugins: [],
};
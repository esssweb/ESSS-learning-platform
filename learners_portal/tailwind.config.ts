import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			SofiaProSemiBoldItalic: ["SofiaProSemiBoldItalic", "sans-serif"],
  			SofiaProSemiBold: ["SofiaProSemiBold", "sans-serif"],
  			SofiaProMediumItalic: ["SofiaProMediumItalic", "sans-serif"],
  			SofiaProMedium: ["SofiaProMedium", "sans-serif"],
  			SofiaProBlackItalic: ["SofiaProBlackItalic", "sans-serif"],
  			SofiaProBlack: ["SofiaProBlack", "sans-serif"],
  			SofiaProBoldItalic: ["SofiaProBoldItalic", "sans-serif"],
  			SofiaProBold: ["SofiaProBold", "sans-serif"],
  			SofiaProUltraLightItalic: ["SofiaProUltraLightItalic", "sans-serif"],
  			SofiaProUltraLight: ["SofiaProUltraLight", "sans-serif"],
  			SofiaProRegularItalic: ["SofiaProRegularItalic", "sans-serif"],
  			SofiaProRegular: ["SofiaProRegular", "sans-serif"],
  			SofiaProExtraLightItalic: ["SofiaProExtraLightItalic", "sans-serif"],
  			SofiaProExtraLight: ["SofiaProExtraLight", "sans-serif"],
  			SofiaProLightItalic: ["SofiaProLightItalic", "sans-serif"],
  			SofiaProLight: ["SofiaProLight", "sans-serif"],
  			AbolitionTestRegular: ["AbolitionTestRegular"]
  		},
  		colors: {
  			Quinary: '#707070',
  			Quaternary: '#ADADAD',
  			Tertiary: '#F8F7F4',
  			Secondary: '#E0F869',
  			Primary: '#072434',
  			Senary: '#03800C',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
  	keyframes: {
  		shimmer: {
  			'100%': {
  				transform: 'translateX(100%)'
  			}
  		},
  		popupin: {
  			to: {
  				right: '4px'
  			}
  		}
  	},
  	plugins: []
  },
    plugins: [require("tailwindcss-animate")]
};
export default config;

# Frontend - React Application

React frontend for the Skin Cancer Detection System.

## Tech Stack

React 18 • Vite • React Router • Tailwind CSS • Lucide Icons

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API (if different from default)
VITE_API_URL=http://localhost:5001
```

**Get your Clerk key:** [https://dashboard.clerk.com](https://dashboard.clerk.com) → API Keys → React

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### 4. Start the Backend API

In a separate terminal:

```bash
cd ..
python app.py
```

Backend runs at **http://localhost:5001**

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # App entry point with ClerkProvider
│   ├── App.jsx               # Root component with routing
│   ├── index.css             # Global styles (Tailwind)
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Analysis.jsx      # Image upload and analysis
│   │   └── Results.jsx       # Display predictions
│   └── services/
│       └── api.js            # Backend API client
├── public/                   # Static assets
├── .env.local               # Environment variables (not committed)
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── README.md               # This file
```

## Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Setup

See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed Clerk integration instructions.

### Quick Auth Setup

1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your Publishable Key
4. Add to `.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
5. Restart dev server

## API Integration

### Endpoints Used

- `POST /analyze` - Submit image for analysis
  - Body: `FormData` with `file` and optional metadata
  - Response: Predictions, ensemble results, and explainability

### API Client

Located in `src/services/api.js`:

```javascript
import { analyzeImage } from './services/api'

const result = await analyzeImage(file, {
  age: 45,
  gender: 'male',
  location: 'arm'
})
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk authentication key | `pk_test_...` |
| `VITE_API_URL` | ❌ No | Backend API URL | `http://localhost:5001` |

**Note:** The `VITE_` prefix is required for Vite to expose variables to the client.

## Pages

### Home (`/`)
- Hero section with feature highlights
- Statistics and metrics
- How it works guide
- Public access (no login required)

### Analysis (`/analysis`)
- Image upload (file or camera)
- Patient metadata form
- Real-time analysis trigger
- **Protected:** Requires sign-in

### Results (`/results`)
- Primary prediction with confidence
- Ensemble analysis with uncertainty
- All model predictions breakdown
- Explainability visualizations (saliency, LIME)
- AI-generated insights
- Risk-based recommendations
- **Protected:** Requires sign-in

## Styling

Uses **Tailwind CSS** with custom design tokens:

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#eff6ff',
    600: '#2563eb',
    // ... more shades
  }
}
```

Custom utility classes in `index.css`:
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.card` - Content card with shadow

## Protected Routes

Routes are protected using Clerk's `<SignedIn>` component:

```jsx
<SignedIn>
  <Route path="/analysis" element={<Analysis />} />
</SignedIn>
```

Unauthenticated users see a sign-in prompt.

## Building for Production

```bash
npm run build
```

Output is in `dist/` folder. Deploy to:
- **Vercel** (recommended for Vite)
- **Netlify**
- **AWS S3 + CloudFront**
- Any static hosting service

### Environment Variables in Production

Set `VITE_CLERK_PUBLISHABLE_KEY` in your deployment platform:

**Vercel:**
```bash
vercel env add VITE_CLERK_PUBLISHABLE_KEY
```

**Netlify:**
Site settings → Environment variables

## Security

- ✅ Clerk handles all authentication securely
- ✅ No sensitive keys in client code
- ✅ `.env.local` is gitignored
- ✅ CORS properly configured in backend
- ✅ File uploads validated on server

## Troubleshooting

### "Missing Clerk Publishable Key"
- Ensure `.env.local` exists in `frontend/` directory
- Key must start with `VITE_CLERK_PUBLISHABLE_KEY=`
- Restart dev server after changes

### API Connection Errors
- Verify backend is running on port 5001
- Check CORS settings in `app.py`
- Ensure Flask API is accessible

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist .vite`
- Check Node version: `node --version` (18+ required)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Create a feature branch
2. Make your changes
3. Test authentication flow
4. Submit a pull request

## License

See main project [LICENSE](../LICENSE)

## Resources

- [Clerk React Documentation](https://clerk.com/docs/quickstarts/react)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## Support

For issues or questions:
1. Check the [Clerk Setup Guide](./CLERK_SETUP.md)
2. Review backend API documentation
3. Open an issue in the repository


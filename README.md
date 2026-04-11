# CitySync — React App
 
A fully functional civic issue reporting platform built with **React 18**, **React Router v6**, **Tailwind CSS v3**, and **Vite**.
 
## 🗂️ Folder Structure
 
```
citysync/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router & provider setup
    ├── index.css             # Global styles + Tailwind imports
    ├── context/
    │   └── AppContext.jsx    # Global state (reports, selected category, active dept)
    ├── data/
    │   ├── categories.js     # Issue categories data
    │   ├── classifierData.js # AI classifier rules & logic
    │   └── reportStore.js    # Initial reports, dept config, status colors
    ├── hooks/
    │   └── useScrollReveal.js # Intersection Observer scroll animation
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx    # Top navigation bar
    │   │   └── Footer.jsx    # Site footer
    │   └── ui/
    │       ├── CustomCursor.jsx  # Animated custom cursor
    │       ├── InnerNav.jsx      # Inner screen nav with back button
    │       ├── StatusBadge.jsx   # Reusable status pill badge
    │       └── AIClassifier.jsx  # AI classifier interactive widget
    └── pages/
        ├── Home.jsx           # Landing page (hero, stats, gallery, CTA)
        ├── Login.jsx          # Role selection (Citizen / Gov Official)
        ├── Categories.jsx     # Issue category picker
        ├── Channel.jsx        # Report channel (Website / WhatsApp)
        ├── ReportForm.jsx     # Complaint form (desc, location, photo, phone)
        ├── Success.jsx        # Submission success screen
        ├── TrackComplaint.jsx # Complaint tracking with demo timeline
        ├── GovLogin.jsx       # Government portal login
        ├── Dashboard.jsx      # Department dashboard (Municipal/Roadways/Railway)
        └── IssueDetail.jsx    # Individual issue detail with embedded map
```
 
## 🚀 Getting Started
 
### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
 
### Installation
 
```bash
# 1. Navigate to the project folder
cd citysync
 
# 2. Install dependencies
npm install
 
# 3. Start the development server
npm run dev
```
 
Open [http://localhost:5173](http://localhost:5173) in your browser.
 
### Build for Production
 
```bash
npm run build
npm run preview
```
 
## 🔑 Demo Credentials
 
**Government Portal Login** (`/gov-login`):
 
| Department ID | Password   | Dashboard Access       |
|---------------|------------|------------------------|
| MUNICIPAL     | GOVERNMENT | Water, Garbage, Drainage |
| ROADWAYS      | GOVERNMENT | Road Issues, Accidents |
| RAILWAY       | GOVERNMENT | Rail Track Issues      |
 
## 🛠️ Tech Stack
 
| Tool             | Version  | Purpose                    |
|------------------|----------|----------------------------|
| React            | 18.3     | UI framework               |
| React Router DOM | 6.23     | Client-side routing        |
| Tailwind CSS     | 3.4      | Utility-first styling      |
| Vite             | 5.2      | Dev server & bundler       |
| PostCSS          | 8.4      | CSS processing             |
| Autoprefixer     | 10.4     | CSS vendor prefixes        |
 
## 🌟 Features
 
- ✅ Custom animated cursor
- ✅ Scroll-reveal animations
- ✅ AI issue classifier (keyword-based routing)
- ✅ GPS location detection with IP fallback
- ✅ Photo upload with preview
- ✅ WhatsApp integration
- ✅ Government department dashboards
- ✅ Issue detail view with embedded Google Maps
- ✅ Status management (Pending → In Progress → Resolved)
- ✅ Complaint tracking with timeline
- ✅ Floating photo gallery
- ✅ Fully responsive design
 
## 📡 Google Maps Integration
 
To enable real map embeds, add your Google Maps API key in `src/pages/IssueDetail.jsx`:
 
```js
const GMAPS_KEY = 'YOUR_API_KEY_HERE'
```
 
Get a key at [Google Cloud Console](https://console.cloud.google.com) → Enable Maps Embed API.
 
Without a key, a keyless fallback embed is used (works for demos).re responsive.**

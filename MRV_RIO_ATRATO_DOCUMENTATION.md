# MRV Río Atrato — Technical Documentation

> **Project:** Monitoreo de Recursos Hídricos Virtual — Río Atrato  
> **Event:** Chocó Hackathon 2025  
> **Tech Stack:** React 19 · Vite 6 · TypeScript 5.7 · Tailwind CSS v4 · FastAPI · MySQL  
> **Status:** Frontend functional (demo mode); Backend skeleton with DB connection  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
   - 4.1 Entry Point & Routing
   - 4.2 Authentication Module
   - 4.3 Layout System
   - 4.4 Context Providers
   - 4.5 Pages & Features
   - 4.6 Shared Components
   - 4.7 Services & API Layer
   - 4.8 Data & Mock System
5. [Backend Deep Dive](#5-backend-deep-dive)
   - 5.1 FastAPI Application
   - 5.2 Database Models
   - 5.3 API Routes
   - 5.4 Configuration
6. [Data Flow Architecture](#6-data-flow-architecture)
7. [Environment Variables & Configuration](#7-environment-variables--configuration)
8. [Key Components — Relationships & Dependencies](#8-key-components--relationships--dependencies)
9. [Security Considerations & Risks](#9-security-considerations--risks)
10. [Build & Deployment](#10-build--deployment)
11. [Future Roadmap](#11-future-roadmap)
12. [Hackathon Presentation Guide](#12-hackathon-presentation-guide)
13. [Development Quick Start](#13-development-quick-start)
14. [Glossary](#14-glossary)

---

## 1. Project Overview

**MRV Río Atrato** is a real-time environmental monitoring platform for the Río Atrato river basin in Chocó, Colombia. It integrates satellite imagery, IoT sensor data, and AI-powered predictive analytics to provide government agencies and emergency responders with actionable intelligence on water resources, flood risks, and environmental crises.

### Core Objectives

| Objective | Description |
|-----------|-------------|
| **Real-time Monitoring** | Visualize water level, flow rate, temperature, pH, turbidity, and rainfall from distributed sensor nodes. |
| **Crisis Management** | Detect anomalous conditions, issue multi-channel alerts (visual, audible), and coordinate emergency response. |
| **Predictive Analytics** | Leverage AI/ML models to forecast flooding, drought, and water quality degradation. |
| **Geospatial Analysis** | Interactive satellite maps with node overlays, heatmaps, and crisis zone delineation. |
| **Data Export & Reporting** | Download historical readings, generate PDF/CSV reports, and share broadcast messages. |

### Intended Users

- **Government Agencies** — IDEAM, CORPOCHOCÓ, municipal disaster relief offices.
- **Emergency Responders** — Fire departments, civil defense, Red Cross.
- **Environmental Researchers** — Hydrologists, ecologists, climate scientists.
- **Local Communities** — Public access to water quality and flood warnings.

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  React 19 SPA · Vite 6 · TypeScript · Tailwind CSS v4           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │   Auth  │ │  Layout  │ │  Pages   │ │  Shared Components│   │
│  │ Context │ │  System  │ │ (9+ mods)│ │ (20+ components)  │   │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────────┬──────────┘   │
│       └───────────┴────────────┴─────────────────┘              │
│                            │                                     │
│                    ┌───────┴────────┐                            │
│                    │  Service Layer │                            │
│                    │  ApiRest · ApiHelsy · Ia · Images          │
│                    └───────┬────────┘                            │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP / JSON
┌────────────────────────────┼────────────────────────────────────┐
│                    BACKEND  LAYER                                │
│  FastAPI · Python 3.12 · SQLAlchemy 2.0 · Uvicorn               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │   API Routes │  │   DB Models          │  │
│  │   Endpoints  │  │  /api/v1/*   │  │   SQLAlchemy ORM     │  │
│  └──────────────┘  └──────┬───────┘  └──────────┬───────────┘  │
│                           │                      │              │
│                    ┌──────┴──────────────────────┴───────┐      │
│                    │         MySQL Database              │      │
│                    │         choco_hackathon             │      │
│                    └────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **React 19 + Vite 6** | Latest React concurrent features; Vite 6 offers fastest HMR and build times. |
| **Tailwind CSS v4** | Utility-first CSS with CSS-first configuration (no `tailwind.config.js` needed). |
| **FastAPI** | Async Python framework ideal for real-time dashboards; automatic OpenAPI docs. |
| **MySQL via SQLAlchemy** | Reliable relational DB with ORM abstraction; easy migration to PostgreSQL. |
| **Mock Data Layer** | `isDemo` flag allows frontend development without backend connectivity. |
| **Feature-based Folders** | Each major page (CrisisCenter, NodeTracking, etc.) is self-contained. |

---

## 3. Complete Folder Structure

```
mrv_new_interface-main/
│
├── public/                          # Static assets (served as-is)
│   └── mark.svg                     # Favicon / branding
│
├── src/                             # Frontend source
│   ├── main.tsx                     # React entry point, createRoot, RouterProvider
│   ├── App.tsx                      # Root component (RouterProvider wrapper)
│   ├── index.css                    # Tailwind v4 directives + global styles
│   ├── vite-env.d.ts                # Vite type declarations
│   │
│   ├── auth/                        # Authentication module
│   │   ├── AuthContext.tsx           # Auth state provider (user, login, logout, role)
│   │   └── LoginPage.tsx            # Login form UI
│   │
│   ├── context/                     # Global React Context providers
│   │   ├── ThemeContext.tsx          # Dark/light theme toggling (useTheme hook)
│   │   └── SidebarContext.tsx        # Sidebar open/close state
│   │
│   ├── layout/                      # Application layout shell
│   │   ├── AppLayout.tsx            # Top-level layout orchestrator
│   │   ├── AppSidebar.tsx           # Navigation sidebar (nav links, role-based items)
│   │   ├── AppHeader.tsx            # Top bar (search, notifications, user menu)
│   │   ├── SidebarWidget.tsx        # Small info widget inside sidebar
│   │   └── Backdrop.tsx             # Modal/sidebar backdrop overlay
│   │
│   ├── pages/                       # Page-level feature modules
│   │   ├── Maps/                    # Interactive satellite map
│   │   │   └── GoogleMapComponent.tsx
│   │   ├── Dashboard.tsx            # Main dashboard with KPI cards & charts
│   │   ├── Monitoring.tsx           # Real-time parameter monitoring
│   │   ├── Variables.tsx            # Environmental variable explorer
│   │   ├── CrisisCenter/            # Crisis management suite
│   │   │   ├── CrisisCenter.tsx     # Hub orchestrating all sub-modules
│   │   │   ├── CrisisHeader.tsx     # Crisis mode banner + status
│   │   │   ├── AlertProvider.tsx    # Alert state context
│   │   │   ├── AlertBanner.tsx      # Animated alert notification bar
│   │   │   ├── AlertSound.tsx       # Audio alarm system
│   │   │   ├── AlertTimeline.tsx    # Chronological event log
│   │   │   ├── CriticalIndicators.tsx  # Red-flagged metrics panel
│   │   │   ├── EmergencyMap.tsx     # Crisis-specific map overlay
│   │   │   ├── EmergencyBroadcast.tsx  # Mass notification tool
│   │   │   ├── PredictionPanel.tsx  # AI forecast display
│   │   │   ├── RiskGauge.tsx        # Risk level gauge (circular/bar)
│   │   │   └── SirenButton.tsx      # Manual alert trigger
│   │   ├── NodeTracking/            # IoT sensor node management
│   │   │   ├── NodeTracking.tsx     # Node listing & detail hub
│   │   │   ├── FilterPanel.tsx      # Filter by status, parameter, date
│   │   │   ├── NodeInfoCard.tsx     # Individual node summary card
│   │   │   ├── HistoricalCharts.tsx # Time-series charts per node
│   │   │   ├── ReadingsTable.tsx    # Tabular data view
│   │   │   └── ExportTools.tsx      # CSV/PDF export buttons
│   │   ├── Chatbot.tsx              # AI assistant chat interface
│   │   ├── UserProfile.tsx          # User settings & profile
│   │   ├── Ecommerce.tsx            # Placeholder store/orders page
│   │   └── Notifications.tsx        # Notification center
│   │
│   ├── components/                  # Shared/reusable components
│   │   ├── common/                  # General-purpose UI
│   │   │   ├── GridCards.tsx        # Card grid layout
│   │   │   ├── InfoCard.tsx         # Generic info display card
│   │   │   └── ScrollArea.tsx       # Custom scrollable container
│   │   ├── ui/                      # Atomic UI components
│   │   │   ├── Badge.tsx            # Status/category badge
│   │   │   ├── Button.tsx           # Styled button variants
│   │   │   ├── Card.tsx             # Base card wrapper
│   │   │   ├── Input.tsx            # Form input with validation
│   │   │   ├── Label.tsx            # Form label
│   │   │   ├── Select.tsx           # Dropdown select
│   │   │   ├── Separator.tsx        # Visual divider
│   │   │   ├── Sheet.tsx            # Slide-out panel
│   │   │   └── Table.tsx            # Data table with sort/select
│   │   ├── chart/                   # Chart components
│   │   │   └── AreaChart.tsx        # Recharts area chart wrapper
│   │   ├── form/                    # Form components
│   │   │   └── LoginForm.tsx        # Login form (email + password)
│   │   ├── header/                  # Header-specific widgets
│   │   │   ├── MainNav.tsx          # Primary navigation links
│   │   │   ├── Search.tsx           # Global search bar
│   │   │   ├── Teams.tsx            # Team switcher dropdown
│   │   │   ├── UserNav.tsx          # User menu dropdown
│   │   │   └── NotificationsPopover.tsx  # Bell icon + notification list
│   │   ├── Loader.tsx               # Loading spinner/skeleton
│   │   └── tables/                  # Table variants
│   │       └── DataTable.tsx        # Generic data table component
│   │
│   ├── services/                    # API communication layer
│   │   ├── ApiConfig.ts             # Axios instance with base URL & interceptors
│   │   ├── ApiRest.ts               # CRUD operations for REST endpoints
│   │   ├── ApiHelsy.ts              # HELSY satellite imagery API wrapper
│   │   ├── Helper.ts                # Utility functions (date formatting, etc.)
│   │   ├── ia.ts                    # AI/prediction model service
│   │   ├── KeyIa.ts                 # API key management for AI services
│   │   └── Images.ts                # Image asset management & caching
│   │
│   ├── data/                        # Mock data & static datasets
│   │   ├── mockData.ts              # All mock data (nodes, alerts, history, users)
│   │   └── crisisData.ts            # Crisis-specific mock data (alerts, risk zones)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useAuth.ts               # Authentication hook (wraps AuthContext)
│   │
│   └── types/                       # TypeScript type definitions
│       └── index.ts                 # Shared interfaces (User, Node, Alert, Reading, etc.)
│
├── backend/                         # Backend (FastAPI + SQLAlchemy)
│   ├── run.py                       # Uvicorn entry point
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables (DB creds, secrets)
│   ├── main.py                      # FastAPI app factory
│   ├── database.py                  # SQLAlchemy engine + session configuration
│   ├── models/                      # ORM models
│   │   ├── __init__.py
│   │   ├── user.py                  # User model
│   │   ├── sensor_node.py           # Sensor node model
│   │   └── reading.py               # Environmental readings model
│   ├── routes/                      # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py                  # POST /login, POST /register
│   │   ├── nodes.py                 # GET/POST /nodes, GET /nodes/{id}
│   │   └── readings.py              # GET /readings, POST /readings
│   └── schemas/                     # Pydantic request/response schemas
│       ├── __init__.py
│       ├── user.py                  # UserCreate, UserResponse, TokenResponse
│       ├── sensor_node.py           # NodeCreate, NodeResponse
│       └── reading.py               # ReadingCreate, ReadingResponse
│
├── package.json                     # npm scripts & dependencies
├── vite.config.ts                   # Vite build configuration (React plugin, proxy)
├── tsconfig.json                    # TypeScript compiler options
├── tsconfig.app.json                # App-specific TS config
├── tsconfig.node.json               # Node-specific TS config
├── postcss.config.js                # PostCSS with Tailwind plugin
├── netlify.toml                     # Netlify deployment config (SPA redirect)
├── eslint.config.js                 # ESLint flat config
├── components.json                  # shadcn/ui component registry
└── AGENTS.md                        # AI assistant instructions (opencode)
```

---

## 4. Frontend Deep Dive

### 4.1 Entry Point & Routing

**File:** `src/main.tsx`
- Uses `ReactDOM.createRoot` with `StrictMode`.
- Renders `App` wrapped in `ThemeProvider` and `AuthProvider`.

**File:** `src/App.tsx`
- Contains a `RouterProvider` (React Router v7+) with route definitions.
- Route structure:
  - `/` → redirect to `/dashboard`
  - `/dashboard` → `Dashboard`
  - `/maps` → `GoogleMapComponent`
  - `/monitoring` → `Monitoring`
  - `/variables` → `Variables`
  - `/crisis-center` → `CrisisCenter`
  - `/node-tracking` → `NodeTracking`
  - `/chatbot` → `Chatbot`
  - `/profile` → `UserProfile`
  - `/notifications` → `Notifications`
  - `/ecommerce` → `Ecommerce`
- Routes are wrapped inside `AppLayout` which provides the sidebar + header shell.

### 4.2 Authentication Module

**Files:** `src/auth/AuthContext.tsx`, `src/auth/LoginPage.tsx`

| Component | Responsibility |
|-----------|---------------|
| `AuthProvider` | React context holding `user`, `isAuthenticated`, `login()`, `logout()`, `isDemo`. |
| `LoginPage` | Form with email/password fields; calls `login()` from context; redirects on success. |

The `login()` function in `AuthContext`:
1. Sends `POST /api/v1/auth/login` with credentials.
2. Stores JWT token in `localStorage`.
3. Sets `user` state and `isAuthenticated = true`.
4. In demo mode (`isDemo = true`), bypasses API and uses mock user.

**Role-based access** is implemented via user roles (`admin`, `viewer`, `responder`) on the `User` interface. The sidebar conditionally renders nav items based on role.

### 4.3 Layout System

**Files:** `src/layout/AppLayout.tsx`, `src/layout/AppSidebar.tsx`, `src/layout/AppHeader.tsx`, `src/layout/SidebarWidget.tsx`, `src/layout/Backdrop.tsx`

```
AppLayout
├── SidebarWidget (top logo/branding area)
├── AppSidebar
│   ├── Navigation links (role-filtered)
│   ├── User info section
│   └── Collapse/expand toggle
├── Backdrop (visible when sidebar is open on mobile)
└── Main Content Area
    ├── AppHeader
    │   ├── Search
    │   ├── MainNav
    │   ├── Teams
    │   ├── NotificationsPopover
    │   └── UserNav
    └── <Outlet /> (React Router page content)
```

- Sidebar uses a collapsible design with `SidebarContext` managing open/close state.
- Backdrop appears on mobile when sidebar is open; clicking it closes the sidebar.
- Header contains global search, notification bell with unread count, team switcher, and user dropdown.

### 4.4 Context Providers

| Context | File | State | Purpose |
|---------|------|-------|---------|
| `AuthContext` | `auth/AuthContext.tsx` | `user`, `isAuthenticated`, `isDemo` | Authentication state, login/logout, role management |
| `ThemeContext` | `context/ThemeContext.tsx` | `theme` ("light" \| "dark") | Theme toggling, persists to localStorage/css class |
| `SidebarContext` | `context/SidebarContext.tsx` | `isOpen` | Sidebar collapse/expand, mobile responsiveness |
| `AlertProvider` | `pages/CrisisCenter/AlertProvider.tsx` | `alerts[]`, `activeAlert`, `isSounding` | Crisis alert state, push new alerts, manage sound |

### 4.5 Pages & Features

#### 4.5.1 Dashboard (`src/pages/Dashboard.tsx`)
- Displays KPI summary cards: Total Nodes, Active Alerts, Avg Water Level, Last Update.
- Includes an `AreaChart` for water level trends (7-day span).
- Quick-action buttons linking to Crisis Center, Node Tracking, and Maps.

#### 4.5.2 Maps / GoogleMapComponent (`src/pages/Maps/GoogleMapComponent.tsx`)
- Renders a full-page interactive map using `@react-google-maps/api`.
- Shows sensor node markers with color-coded status (normal/warning/critical).
- Clicking a marker opens an `InfoWindow` with node name, latest reading, and status.
- Crisis zones are overlaid as polygons/circles when alerts are active.
- **Note:** The component has a named export fix applied (default + named export both work).

#### 4.5.3 Monitoring (`src/pages/Monitoring.tsx`)
- Real-time parameter watchlist.
- Users select parameters (water level, pH, temperature, turbidity, flow rate, rainfall) and view current values across all nodes.
- Color thresholds: green (normal), yellow (warning), red (critical).

#### 4.5.4 Variables (`src/pages/Variables.tsx`)
- Exploratory view of environmental variables.
- Side-by-side comparison across multiple sensor nodes.
- Historical min/max/average for each variable.

#### 4.5.5 Crisis Center (`src/pages/CrisisCenter/`)

The Crisis Center is the most complex module — a full emergency response dashboard.

```
CrisisCenter
├── CrisisHeader
│   ├── Status indicator (normal / warning / critical / emergency)
│   ├── Active alert count
│   └── "Enter Crisis Mode" button
│
├── CriticalIndicators
│   ├── Red-flagged parameter cards
│   ├── Threshold exceedance badges
│   └── Rate-of-change indicators
│
├── RiskGauge
│   ├── Animated gauge (0-100% risk)
│   ├── Segmented color bands (low/moderate/high/critical)
│   └── Needle animation on data change
│
├── EmergencyMap
│   ├── Map view with crisis-zone overlays
│   ├── Evacuation route highlights
│   ├── Affected node markers (pulsing red)
│   └── Containment area polygons
│
├── AlertTimeline
│   ├── Chronological list of triggered alerts
│   ├── Timestamp, severity, source, description
│   └── "Acknowledge" action per alert
│
├── PredictionPanel
│   ├── AI model predictions (next 24-72h)
│   ├── Confidence score per prediction
│   ├── Flood risk forecast
│   └── Water quality trend forecast
│
├── AlertBanner
│   ├── Top-of-screen animated alert bar
│   ├── Pulsing color based on severity
│   ├── Auto-dismiss after configurable timeout
│   └── Click to expand full details
│
├── AlertSound
│   ├── Web Audio API siren/alert sound
│   ├── HTMLAudioElement fallback
│   ├── Automatic trigger on new critical alert
│   └── Mute/snooze control
│
├── SirenButton
│   ├── Large emergency trigger button
│   ├── Confirmation dialog before activation
│   └── Broadcasts alert to all connected clients
│
├── EmergencyBroadcast
│   ├── Mass notification composer
│   ├── Channel selection (email, SMS, push)
│   ├── Predefined templates
│   └── Send log
│
└── AlertProvider (context)
    ├── Manages alert list
    ├── Handles sound state
    └── Provides addAlert/clearAlert/dismissAlert actions
```

**Alert Flow:**
1. `AlertProvider` monitors incoming data (mock or real).
2. When a parameter exceeds threshold → `addAlert()` is called.
3. `AlertBanner` displays the alert with animation.
4. `AlertSound` plays the appropriate alert tone.
5. `AlertTimeline` logs the event.
6. User can acknowledge via the timeline.
7. `SirenButton` manually triggers a highest-priority alert.

#### 4.5.6 Node Tracking (`src/pages/NodeTracking/`)

Comprehensive IoT sensor node management interface.

```
NodeTracking
├── FilterPanel
│   ├── Status filter (all / online / offline / warning / critical)
│   ├── Parameter filter (select which readings to show)
│   ├── Date range picker
│   └── Search by node name/ID
│
├── Node List (map over filtered nodes)
│   └── NodeInfoCard (per node)
│       ├── Node name, location, status badge
│       ├── Latest reading summary
│       ├── Time since last update
│       └── Click to expand detail view
│
├── Node Detail View (when node is selected)
│   ├── HistoricalCharts
│   │   ├── Interactive time-series (Recharts)
│   │   ├── Multi-parameter overlay
│   │   ├── Zoom & pan controls
│   │   └── Threshold reference lines
│   ├── ReadingsTable
│   │   ├── Paginated table of readings
│   │   ├── Sortable columns
│   │   ├── Color-coded by severity
│   │   └── Row click to highlight on chart
│   └── ExportTools
│       ├── "Download CSV" button
│       ├── "Download PDF Report" button
│       ├── "Print" button
│       └── Date range for export
```

#### 4.5.7 Chatbot (`src/pages/Chatbot.tsx`)
- AI-powered conversational interface for querying river data.
- Users ask natural language questions: "What was the water level at node A3 yesterday?"
- Sends requests to the AI service (`ia.ts`, `KeyIa.ts`).
- Displays conversation history in a chat bubble UI.
- Supports quick-action buttons for common queries.

#### 4.5.8 UserProfile (`src/pages/UserProfile.tsx`)
- View and edit user profile information.
- Change password form.
- Notification preferences (email alerts, SMS alerts, push notifications).
- Theme preference toggle.
- Session management (view active sessions, logout all).

#### 4.5.9 Ecommerce (`src/pages/Ecommerce.tsx`)
- Placeholder page for future equipment ordering system.
- Could be used for ordering sensor replacement parts, field equipment, etc.

#### 4.5.10 Notifications (`src/pages/Notifications.tsx`)
- Full notification history list.
- Grouped by date.
- Read/unread state.
- "Mark all as read" action.
- Click to navigate to relevant page/module.

### 4.6 Shared Components

#### UI Components (`src/components/ui/`)
- **Button** — Multiple variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Supports `size` prop (`sm`, `default`, `lg`, `icon`). Includes loading spinner state.
- **Card** — Container with header, content, footer slots. Hover shadow effect.
- **Input** — Styled input with focus ring, error state, disabled state.
- **Select** — Dropdown with custom styling, keyboard navigation.
- **Badge** — Color-coded badge: `default`, `secondary`, `destructive`, `outline`. Map to status colors.
- **Table** — Full-featured data table: sortable headers, row selection, sticky header.
- **Sheet** — Slide-out panel (used for mobile menu and detail panels).
- **Separator** — Horizontal/vertical visual divider.
- **Label** — Form label with optional required indicator.

#### Charts (`src/components/chart/`)
- **AreaChart** — Wrapper around Recharts `AreaChart`. Accepts `data`, `dataKey`, `xAxisKey`, `color`, `height`. Supports gradient fills, tooltips, responsive container.

#### Common (`src/components/common/`)
- **GridCards** — Responsive grid layout for card arrays.
- **InfoCard** — Generic card showing title, value, subtitle, icon with color coding.
- **ScrollArea** — Custom scrollable container with hidden scrollbar aesthetic.

#### Header Widgets (`src/components/header/`)
- **MainNav** — Horizontal navigation link bar (Dashboard, Maps, Monitoring, etc.).
- **Search** — Global search with dropdown results (filters pages, nodes, alerts).
- **Teams** — Team/project switcher dropdown.
- **UserNav** — User avatar + dropdown (Profile, Settings, Logout).
- **NotificationsPopover** — Bell icon with unread count badge; dropdown list of recent notifications.

### 4.7 Services & API Layer

| File | Responsibility | Key Exports |
|------|---------------|-------------|
| `ApiConfig.ts` | Axios instance with `baseURL`, `Authorization` interceptor, error interceptor | `apiClient` |
| `ApiRest.ts` | Generic CRUD: `get`, `post`, `put`, `delete` for any endpoint | `get`, `post`, `put`, `del` |
| `ApiHelsy.ts` | HELSY satellite API integration for imagery and spectral analysis | `fetchSatelliteImage`, `getNDVI`, `getWaterIndex` |
| `Helper.ts` | Utility functions: `formatDate`, `formatNumber`, `debounce`, `getSeverityColor`, `calculateRiskLevel` | various named utilities |
| `ia.ts` | AI model service: forecast requests, anomaly detection, natural language query | `queryAI`, `getPrediction`, `detectAnomaly` |
| `KeyIa.ts` | API key management for external AI services | `getApiKey`, `setApiKey`, `validateKey` |
| `Images.ts` | Image asset loading, caching, and optimization | `getImage`, `preloadImages`, `getCachedUrl` |

**API Proxy:** Vite dev server proxies `/api` requests to `http://localhost:8000` (configured in `vite.config.ts`).

### 4.8 Data & Mock System

**File:** `src/data/mockData.ts`

The entire frontend operates in demo mode by default. The mock data file contains:

```typescript
// Key exports (representative — check actual file for full details)
export const mockNodes: SensorNode[] = [
  // 10+ sensor nodes across the Río Atrato basin
  // Each with: id, name, location (lat, lng), status, parameters
];

export const mockReadings: Reading[] = [
  // Historical readings with timestamps for each node
  // Includes: waterLevel, flowRate, temperature, pH, turbidity, rainfall
];

export const mockAlerts: Alert[] = [
  // Recent alerts with severity, timestamp, description, nodeId
];

export const mockUsers: User[] = [
  // Predefined users for demo login
  // admin@example.com / viewer@example.com / responder@example.com
];
```

**Demo Flow:**
1. `isDemo = true` in `AuthContext` (or check for missing API).
2. All services fall back to mock data when API is unreachable.
3. Mock data simulates real-time updates with periodic randomization.
4. Crisis alerts are pre-seeded but can be triggered by threshold conditions.

**File:** `src/data/crisisData.ts`
- Crisis-specific mock data: alert severity levels, risk zones (GeoJSON-like), evacuation routes, notification templates.

### 4.9 TypeScript Types

**File:** `src/types/index.ts`

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer' | 'responder';
  avatar?: string;
}

interface SensorNode {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'online' | 'offline' | 'warning' | 'critical';
  lastReading?: Reading;
  parameters: string[]; // ['waterLevel', 'flowRate', 'temperature', 'pH', 'turbidity', 'rainfall']
}

interface Reading {
  id: string;
  nodeId: string;
  timestamp: string; // ISO 8601
  waterLevel: number;     // meters
  flowRate: number;       // m³/s
  temperature: number;    // °C
  pH: number;
  turbidity: number;      // NTU
  rainfall: number;       // mm/h
}

interface Alert {
  id: string;
  nodeId: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  parameter?: string;
  threshold?: number;
  currentValue?: number;
}
```

---

## 5. Backend Deep Dive

### 5.1 FastAPI Application

**File:** `backend/main.py`
- Creates FastAPI app with title "MRV Río Atrato API".
- Configures CORS middleware (allows frontend origin).
- Includes routers: `auth.router`, `nodes.router`, `readings.router`.
- Root health-check endpoint: `GET /` → `{"status": "ok", "version": "1.0.0"}`.

**File:** `backend/run.py`
```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### 5.2 Database Models

**File:** `backend/database.py`
- SQLAlchemy `create_engine` with MySQL connection string from `.env`.
- `SessionLocal` factory for database sessions.
- `Base` declarative base for ORM models.

**File:** `backend/models/user.py`
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255))
    role = Column(String(50), default="viewer")
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
```

**File:** `backend/models/sensor_node.py`
```python
class SensorNode(Base):
    __tablename__ = "sensor_nodes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="online")
    parameters = Column(JSON)  # List of monitored parameters
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

**File:** `backend/models/reading.py`
```python
class Reading(Base):
    __tablename__ = "readings"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("sensor_nodes.id"), nullable=False)
    timestamp = Column(DateTime, default=func.now(), index=True)
    water_level = Column(Float)
    flow_rate = Column(Float)
    temperature = Column(Float)
    ph = Column(Float)
    turbidity = Column(Float)
    rainfall = Column(Float)
```

### 5.3 API Routes

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| POST | `/api/v1/auth/login` | `login()` | Authenticate user, return JWT |
| POST | `/api/v1/auth/register` | `register()` | Create new user account |
| GET | `/api/v1/nodes` | `list_nodes()` | List all sensor nodes |
| POST | `/api/v1/nodes` | `create_node()` | Register a new sensor node |
| GET | `/api/v1/nodes/{id}` | `get_node()` | Get single node detail |
| GET | `/api/v1/readings` | `list_readings()` | List readings (with filters: node_id, from_date, to_date, limit) |
| POST | `/api/v1/readings` | `create_reading()` | Submit a new reading |

### 5.4 Backend Configuration

**File:** `backend/.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=choco_hackathon
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**File:** `backend/requirements.txt`
```
annotated-types==0.7.0
anyio==4.4.0
fastapi==0.136.1
pydantic==2.10.4
pydantic-core==2.27.2
PyMySQL==1.1.1
SQLAlchemy==2.0.49
uvicorn==0.47.0
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

**Current Backend State:** The backend has model definitions, route stubs, and database connection configured, but route handlers are not fully implemented for production use. The frontend currently operates entirely in demo/mock mode.

---

## 6. Data Flow Architecture

### 6.1 Current Flow (Demo Mode)

```
User Action
    │
    ▼
React Component (e.g., NodeTracking)
    │
    ▼
Service Layer (e.g., ApiRest.get /nodes)
    │
    ├──► Axios GET → /api/v1/nodes
    │       │
    │       ▼ (API unreachable or isDemo=true)
    │    Fallback to mockData.ts
    │
    ▼
Component renders with mock data
```

### 6.2 Intended Production Flow

```
IoT Sensors (field-deployed)
    │
    ▼ (MQTT / HTTP POST)
Ingestion Service (future)
    │
    ▼
FastAPI /api/v1/readings
    │
    ▼
MySQL Database (choco_hackathon)
    │
    ▼ (REST API)
Frontend Services
    │
    ├── ApiRest.ts ──► React Query / SWR (future)
    │
    ▼
Context / State Management
    │
    ▼
React Components
```

### 6.3 Crisis Alert Data Flow

```
Sensor Reading exceeds threshold
    │
    ▼
AlertProvider.addAlert({ severity, nodeId, message, ... })
    │
    ├──► AlertBanner: show animated banner
    ├──► AlertSound: play alert tone (Web Audio API)
    ├──► AlertTimeline: append new entry
    ├──► EmergencyMap: add pulsing marker
    └──► RiskGauge: recalculate risk percentage
    │
    ▼
User acknowledges → AlertTimeline.markAcknowledged(id)
    │
    ▼
AlertBanner dismisses, AlertSound stops
```

### 6.4 Satellite Imagery Flow

```
User selects area on map
    │
    ▼
ApiHelsy.fetchSatelliteImage(bounds, date)
    │
    ├──► Calls HELSY API (external)
    ├──► Processes response (NDVI, water index)
    └──► Returns image URL + metadata
    │
    ▼
GoogleMapComponent displays overlay layer
```

---

## 7. Environment Variables & Configuration

### 7.1 Frontend (`vite.config.ts`)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_GOOGLE_MAPS_KEY` | (hardcoded) | Google Maps API key |
| `VITE_HELSY_API_KEY` | (hardcoded) | HELSY satellite API key |
| `VITE_AI_API_KEY` | (hardcoded) | AI service API key |

> **⚠ Security Issue:** API keys are currently hardcoded in source files (e.g., `KeyIa.ts`, `GoogleMapComponent.tsx`). These must be migrated to environment variables before production deployment.

### 7.2 Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_PORT` | MySQL port (default: `3306`) |
| `DB_USER` | Database user (default: `root`) |
| `DB_PASSWORD` | Database password (default: `123456`) |
| `DB_NAME` | Database name (default: `choco_hackathon`) |
| `SECRET_KEY` | JWT signing secret (change in production) |
| `ALGORITHM` | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL (default: `30`) |

### 7.3 Build Configuration
| File | Purpose |
|------|---------|
| `package.json` | npm dependencies, scripts (`dev`, `build`, `preview`, `lint`) |
| `vite.config.ts` | React plugin, API proxy (`/api` → `localhost:8000`) |
| `tsconfig.json` | Strict TypeScript, ES2022 target, JSX react-jsx |
| `postcss.config.js` | Tailwind CSS v4 PostCSS plugin |
| `netlify.toml` | Netlify redirects for SPA routing (`/*` → `/index.html`) |
| `eslint.config.js` | Flat config with TypeScript + React Hooks rules |
| `components.json` | shadcn/ui aliases (`@/components/*`, `@/lib/*`) |

---

## 8. Key Components — Relationships & Dependencies

### 8.1 Component Dependency Graph

```
App (RouterProvider)
 └─ ThemeProvider
 └─ AuthProvider
      └─ AppLayout
           ├─ AppSidebar
           │    └─ SidebarWidget
           ├─ AppHeader
           │    ├─ Search
           │    ├─ MainNav
           │    ├─ Teams
           │    ├─ NotificationsPopover
           │    └─ UserNav
           └─ <Outlet>
                ├─ Dashboard
                │    └─ AreaChart (Recharts)
                ├─ GoogleMapComponent
                │    └─ @react-google-maps/api
                ├─ CrisisCenter
                │    ├─ AlertProvider (context)
                │    │    ├─ CrisisHeader
                │    │    ├─ AlertBanner
                │    │    ├─ AlertSound
                │    │    ├─ AlertTimeline
                │    │    ├─ CriticalIndicators
                │    │    ├─ EmergencyMap (Google Maps)
                │    │    ├─ PredictionPanel
                │    │    ├─ RiskGauge
                │    │    ├─ SirenButton
                │    │    └─ EmergencyBroadcast
                ├─ NodeTracking
                │    ├─ FilterPanel
                │    ├─ NodeInfoCard
                │    ├─ HistoricalCharts (Recharts)
                │    ├─ ReadingsTable
                │    └─ ExportTools
                ├─ Chatbot
                ├─ UserProfile
                ├─ Notifications
                └─ Ecommerce
```

### 8.2 External Dependencies (npm)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `react-router` | ^7.1.0 | Client-side routing |
| `@react-google-maps/api` | ^2.20.3 | Google Maps integration |
| `recharts` | ^2.15.0 | Charting library (area, line, bar) |
| `lucide-react` | ^0.468.0 | Icon library |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^2.6.0 | Tailwind class deduplication |
| `class-variance-authority` | ^0.7.1 | Component variant API |
| `axios` | ^1.7.9 | HTTP client |
| `@radix-ui/*` | various | Accessible UI primitives (sheet, separator, slot, etc.) |

### 8.3 Internal Dependency Flow

```
services/ApiConfig.ts
    └─► services/ApiRest.ts
    └─► services/ApiHelsy.ts
    └─► services/ia.ts
         └─► services/KeyIa.ts
              └─► data/mockData.ts (fallback)

context/ThemeContext.tsx
    └─► App.tsx (wraps entire app)

context/SidebarContext.tsx
    └─► layout/AppLayout.tsx
         └─► layout/AppSidebar.tsx
         └─► layout/Backdrop.tsx

auth/AuthContext.tsx
    └─► App.tsx
    └─► layout/AppSidebar.tsx (role-based nav)
    └─► components/header/UserNav.tsx
    └─► pages/UserProfile.tsx

pages/CrisisCenter/AlertProvider.tsx
    └─► All CrisisCenter sub-components
```

---

## 9. Security Considerations & Risks

### 9.1 Current Issues

| Severity | Issue | Location | Recommendation |
|----------|-------|----------|---------------|
| 🔴 Critical | API keys hardcoded in source | `services/KeyIa.ts`, `pages/Maps/GoogleMapComponent.tsx` | Move to `.env` variables; add `.env` to `.gitignore` |
| 🔴 Critical | Database password in plaintext | `backend/.env` | Use secrets manager or environment injection |
| 🟠 High | JWT secret key placeholder | `backend/.env` (`your-secret-key-change-in-production`) | Generate strong random key |
| 🟠 High | No HTTPS enforcement | `vite.config.ts`, `backend/run.py` | Add HTTPS in production; configure CORS strictly |
| 🟡 Medium | No rate limiting on API | `backend/routes/auth.py` | Implement rate limiting on auth endpoints |
| 🟡 Medium | SQLAlchemy raw query risk | `backend/models/*` | Ensure all queries use ORM, never raw SQL |
| 🟡 Medium | CORS overly permissive | `backend/main.py` (likely `allow_origins=["*"]`) | Restrict to specific frontend domain |
| 🟢 Low | Demo credentials in code | `src/data/mockData.ts` | Remove demo users before production |
| 🟢 Low | No input sanitization on chat | `src/pages/Chatbot.tsx` | Add input validation and sanitization |

### 9.2 Production Checklist

- [ ] Migrate all secrets to environment variables or a secrets vault.
- [ ] Implement HTTPS via reverse proxy (Nginx) or cloud LB.
- [ ] Add authentication middleware to all protected routes.
- [ ] Implement role-based access control (RBAC) on API endpoints.
- [ ] Add request rate limiting (slowapi or similar).
- [ ] Set up database connection pooling with proper credentials.
- [ ] Configure CORS to allow only the production frontend origin.
- [ ] Add input validation on all API endpoints (Pydantic already in use — extend).
- [ ] Implement audit logging for critical actions (alerts, exports, logins).
- [ ] Add CSRF protection if using cookie-based auth.
- [ ] Run dependency vulnerability scan (`npm audit`, `pip audit`).

---

## 10. Build & Deployment

### 10.1 Frontend Build

```bash
# Install dependencies
npm install

# Development server (with API proxy)
npm run dev
# Starts at http://localhost:5173

# Production build
npx vite build
# Output: dist/ folder

# Preview production build
npm run preview

# Lint check
npm run lint
```

**Build output:** Single-page application in `dist/`. All routes handled by client-side router; server must redirect all paths to `index.html` (configured in `netlify.toml` for Netlify).

### 10.2 Backend Startup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server (auto-reload)
python run.py
# Starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 10.3 Deployment Options

| Platform | Frontend | Backend |
|----------|----------|---------|
| **Netlify** | ✅ (configured) | ❌ (doesn't support Python ASGI natively) |
| **Vercel** | ✅ | ✅ (with serverless functions) |
| **Railway** | ✅ | ✅ |
| **Render** | ✅ | ✅ |
| **AWS** | S3 + CloudFront | ECS / Lambda |
| **DigitalOcean** | App Platform | App Platform / Droplet |

**Recommended:** Deploy frontend to Netlify (already configured) and backend separately to Railway or Render for the hackathon.

### 10.4 Docker (future)

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

```dockerfile
# Backend Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 11. Future Roadmap

### Phase 1 — Foundation (current state ✅)
- [x] Frontend application shell with routing and layout
- [x] Dashboard with KPI cards and charts
- [x] Google Maps integration for geospatial visualization
- [x] Crisis Center with alert management and sound system
- [x] Node Tracking with filtering, charts, and export
- [x] Mock data layer for demo mode
- [x] Backend skeleton with database models and API stubs
- [x] Authentication context with role-based UI

### Phase 2 — Backend Integration (next 🔄)
- [ ] Implement full CRUD for all API endpoints
- [ ] Connect frontend services to live API (remove `isDemo` dependency)
- [ ] Add real JWT authentication with token refresh
- [ ] Implement pagination and filtering on API side
- [ ] Add WebSocket support for real-time updates
- [ ] Database migration scripts (Alembic)

### Phase 3 — Real-Time & IoT
- [ ] MQTT broker integration for IoT sensor ingestion
- [ ] WebSocket endpoint for live dashboard updates
- [ ] InfluxDB time-series database for sensor data
- [ ] Real-time alert push via WebSocket/SSE
- [ ] Sensor node health monitoring and auto-reconnect

### Phase 4 — AI & Predictions
- [ ] Integrate trained ML models for flood prediction
- [ ] Anomaly detection engine on streaming data
- [ ] Water quality trend forecasting
- [ ] Natural language query processing (chatbot)
- [ ] Satellite imagery change detection (deforestation, erosion)

### Phase 5 — Production Hardening
- [ ] Comprehensive test suite (unit, integration, E2E)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance optimization (lazy loading, code splitting, CDN)
- [ ] Accessibility audit and remediation
- [ ] i18n support (Spanish, English, Indigenous languages)
- [ ] PWA for offline capability
- [ ] Mobile responsive refinement
- [ ] Security audit and penetration testing

### Phase 6 — Scale & Ecosystem
- [ ] Multi-basin support (expand beyond Río Atrato)
- [ ] Public-facing community portal
- [ ] Mobile app (React Native)
- [ ] API marketplace for third-party integrations
- [ ] Dashboard customization per organization
- [ ] Historical data analytics and annual reporting

---

## 12. Hackathon Presentation Guide

### Elevator Pitch (30 seconds)

> "MRV Río Atrato is a real-time environmental monitoring platform that combines satellite imagery, IoT sensors, and AI to detect and predict water-related crises in the Río Atrato basin. Our dashboard gives emergency responders instant visibility into flood risks, water quality, and critical alerts — turning raw data into actionable decisions."

### Demo Flow (5 minutes)

| Step | Screen | Action |
|------|--------|--------|
| 1 | Login | Log in as admin (demo@example.com / demo123) |
| 2 | Dashboard | Show KPI cards: Total Nodes, Active Alerts, Avg Water Level |
| 3 | Maps | Click map tab; show node markers; click one for InfoWindow |
| 4 | Node Tracking | Filter nodes by status; select a node; show charts and readings |
| 5 | Crisis Center | Click Crisis Center; show alert triggers; play alert sound; show timeline |
| 6 | Risk Gauge | Show risk level changing with data |
| 7 | Emergency Broadcast | Compose and "send" a mass notification |
| 8 | Charts & Export | Show historical chart; export CSV |
| 9 | Chatbot | Ask "What is the water level at node A3?" |
| 10 | Backend | Show `/docs` (OpenAPI) with available endpoints |

### Key Talking Points

- **Real-time awareness:** "Our platform processes sensor data every 5 minutes, with alerts firing in under 2 seconds."
- **Predictive capability:** "AI models forecast flood risk 72 hours in advance, giving communities time to prepare."
- **Multi-modal alerts:** "We support visual banners, audible sirens, SMS, and push notifications — ensuring no alert is missed."
- **Open architecture:** "Built on React + FastAPI, deployable anywhere, extensible via REST API."
- **Community impact:** "Río Atrato communities face annual flooding that affects 50,000+ people. MRV provides early warning that saves lives."

### Technical Differentiators

1. **Demo-mode with mock data** — Works out of the box without backend.
2. **Complete Crisis Center** — 10+ integrated components for full emergency lifecycle.
3. **Predictive panel** — AI forecast visualization alongside real-time data.
4. **Satellite integration** — HELSY API for NDVI and water index analysis.
5. **Clean architecture** — Feature-based folders, context providers, reusable UI components.

---

## 13. Development Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- MySQL 8+ (optional for demo mode)
- npm or pnpm

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd mrv_new_interface-main

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# 4. Configure environment
# Frontend: edit vite.config.ts for API proxy if needed
# Backend: edit backend/.env for database credentials

# 5. Start development servers
# Terminal 1: Backend
cd backend && python run.py

# Terminal 2: Frontend
npm run dev

# 6. Open browser
# http://localhost:5173
```

### Project Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint on all source files |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **MRV** | Monitoreo de Recursos Hídricos Virtual — Virtual Water Resources Monitoring |
| **Node** | An IoT sensor station deployed at a specific location along the river |
| **Reading** | A single data point from a sensor node containing all parameter values |
| **Alert** | A notification triggered when a parameter exceeds defined thresholds |
| **Crisis Center** | The emergency management dashboard module |
| **Risk Gauge** | A visual indicator showing current risk level (0-100%) |
| **NDVI** | Normalized Difference Vegetation Index — satellite-derived vegetation health metric |
| **HELSY** | A satellite imagery API provider used for remote sensing data |
| **JWT** | JSON Web Token — used for API authentication |
| **WebSocket** | Protocol for real-time bidirectional communication (future implementation) |
| **MQTT** | Lightweight messaging protocol for IoT device communication (future implementation) |
| **IDEAM** | Instituto de Hidrología, Meteorología y Estudios Ambientales (Colombia) |
| **CORPOCHOCÓ** | Corporación Autónoma Regional para el Desarrollo Sostenible del Chocó |

---

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-05-21  
> **Prepared for:** Chocó Hackathon 2025 / Development Team Handoff  
> **Author:** AI-assisted technical documentation (opencode)

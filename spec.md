# Nucleus - Technical Specification

Nucleus is a highly modular personal management environment. The core architectural philosophy is "Components as Tools," where each functionality is a self-contained widget.

## 🛠 Technology Stack

### Frontend Framework & Language
- **Vue 3 (Composition API)**: Chosen for its reactivity system.
- **TypeScript**: Used throughout the project to provide type safety, especially for the Tool Interface and global state.
- **Vite**: Ultra-fast build tool and HMR.

### State Management
- **Pinia**: Official state management for Vue.
- **Core Store**: Manages the registry of tools, including visibility (`active`) and windowing state (`detached`).

### Environment Security
- **dotenv (.env)**: Vite-native environment variable support.
    - **Variables**: `VITE_WAQI_TOKEN` for the Air Quality API.
    - **Exposure**: Only variables prefixed with `VITE_` are exposed to the client-side code.

### UI Architecture
- **Shadcn Vue**: Built on Radix UI for accessible, premium components.
- **Styling**: Tailwind CSS v4 with custom theme tokens.
- **Icons**: Lucide Vue Next for consistent iconography.

## 🏗 Modular Architecture Details

### 1. Unified Tool Interface (TypeScript Definitions)
```typescript
interface Tool {
    id: string;
    name: string;
    component: string;
    active: boolean;
    detached: boolean;
}

interface ToolProps {
    id: string;
    isDetached: boolean;
}
```

### 2. Global Tool Registry (Pinia)
The `useCoreStore` maintains a `tools` state to track active and detached tools.

## 🚀 Feature: AQI Tool
- **Data Source**: WAQI API.
- **Localization**:
    - **Taiwan Stations**: Includes a dedicated registry of Taiwan-specific stations (`taiwan_stations.ts`) for manual selection.
    - **Multilingual Support**: Status labels and station names available in both English and Traditional Chinese.
- **Features**:
    - **Auto-location**: Uses browser geolocation to fetch the nearest station.
    - **Manual Selection**: Dropdown menu to switch between specific Taiwan stations.
- **UI**: Shadcn `Card`, `Badge`, `Select`, and `Skeleton` for a premium loading experience.
- **Visuals**: Dynamic color-coded status indices and glassmorphism styling.

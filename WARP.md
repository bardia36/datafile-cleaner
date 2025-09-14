# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Data-Cleaner is a Next.js 15 web application that provides intelligent data cleaning capabilities. It's built with TypeScript, React 18, and uses HeroUI components with Tailwind CSS for styling. The application follows a three-step wizard interface for cleaning CSV and Excel files by comparing them against template files.

## Core Architecture

### Frontend Stack
- **Framework**: Next.js 15 with Turbopack and App Router (`app/` directory structure)
- **UI Library**: HeroUI (NextUI) components with custom theming
- **Styling**: Tailwind CSS with custom color schemes and variants
- **Animation**: Framer Motion for smooth transitions and micro-interactions
- **File Processing**: Papa Parse (CSV) and SheetJS/xlsx (Excel) for client-side file parsing
- **State Management**: React hooks with localStorage persistence for file data

### Project Structure
```
app/                    # Next.js App Router pages
  page.tsx             # Main application (1200+ lines of core logic)
  layout.tsx           # Root layout with theme providers
  providers.tsx        # Theme and UI providers
components/
  application/         # Feature-specific components
    file-upload/       # Drag-and-drop file upload system
  base/               # Reusable UI primitives
  foundations/        # Core design system components
config/               # Site configuration and fonts
styles/              # Global CSS and Tailwind imports
utils/               # Utility functions and helpers
types/               # TypeScript type definitions
```

### Key Components
- **File Upload System**: Complex drag-and-drop component with file validation, type detection, and progress tracking
- **Three-Step Wizard**: Card-based interface with smooth animations and state transitions
- **Data Processing Engine**: Client-side data cleaning with multiple configurable options
- **Template Detection**: Automatic file role assignment based on row count and file size heuristics

## Common Development Commands

### Development Server
```bash
# Start development server with Turbopack (recommended)
bun run dev
# or
npm run dev

# Server runs on http://localhost:3000
```

### Build and Production
```bash
# Build for production
bun run build
# or 
npm run build

# Start production server
bun run start
# or
npm start
```

### Code Quality
```bash
# Run ESLint with auto-fix
bun run lint
# or
npm run lint
```

### Package Management
```bash
# Install dependencies (Bun recommended for speed)
bun install
# or
npm install
```

## Data Processing Logic

### File Type Detection Algorithm
The application automatically assigns file roles based on:
1. **Primary**: Row count (file with more rows = data file)
2. **Fallback**: File size (larger file = data file if row counts equal)
3. **Manual Override**: Users can reassign roles via UI buttons

### Column Cleaning Process
1. **Template Matching**: Keeps only columns that exist in both data and template files
2. **Order Preservation**: Final output follows template file column order
3. **Configurable Options**: 10 different cleaning operations (all optional)

### Cleaning Options Available
- Remove duplicate rows (exact match comparison)
- Remove empty rows/columns
- Trim whitespace from cells
- Text case conversion (upper/lower)
- Remove special characters
- Remove leading zeros from numeric strings
- Date standardization (placeholder for future implementation)

## File Processing Specifications

### Supported Formats
- **CSV**: Comma-separated values with UTF-8 encoding
- **Excel**: .xlsx files (first worksheet only)
- **Size Limit**: 5MB per file maximum
- **Requirements**: First row must contain headers

### File Validation
- MIME type and extension validation
- File size checking with user feedback
- Parse validation before processing
- Error handling for corrupted or invalid files

## Component Architecture Patterns

### File Upload Component Structure
- **Compound Component Pattern**: `FileUpload.Root`, `FileUpload.DropZone`, etc.
- **Event-Driven Architecture**: Callback props for file handling
- **Progressive Enhancement**: Works without JavaScript for basic functionality

### State Management Patterns
- **Local State**: React hooks for component-specific state
- **Persistence**: localStorage for file metadata (not actual file contents)
- **Derived State**: Automatic template detection and column preview generation

### UI Patterns
- **Card-based Layout**: Three expandable cards representing process steps
- **Progressive Disclosure**: Only current step content is fully visible
- **Status Indicators**: Visual feedback for step completion and current focus
- **Responsive Design**: Works across all screen sizes with touch support

## Testing Strategy

### Sample Files for Testing
The repository includes test files in root directory:
- `sample-data.csv` / `sample-data.xlsx`: Contains extra columns and duplicate rows
- `sample-template.csv` / `sample-template.xlsx`: Clean template with desired structure

### Manual Testing Flow
1. Upload both sample files using drag-and-drop
2. Verify automatic template detection (template file should be smaller)
3. Check column preview showing keep/remove decisions
4. Select cleaning options and process data
5. Verify results summary and download functionality

## Theme and Styling

### Color System
- **Primary**: Keppel color palette (#04c8aa) with full 50-950 range
- **Theme Support**: Light and dark themes with consistent primary colors
- **Component Theming**: HeroUI theme customization in `tailwind.config.js`

### Animation Guidelines
- **Framer Motion**: Used for page transitions, card expansions, and micro-interactions
- **Duration Standards**: 300ms for quick transitions, 500ms for major state changes
- **Easing**: `ease-linear` for progress indicators, `easeInOut` for content transitions

## Error Handling Patterns

### File Processing Errors
- Parse errors display with specific file name and error message
- Unsupported file types show user-friendly messages
- Size limit violations provide clear feedback
- Processing failures don't break overall application state

### User Experience
- **Error Dismissal**: All errors can be dismissed by user
- **Error Recovery**: Users can retry failed operations
- **State Preservation**: Errors don't clear successfully uploaded files

## Performance Considerations

### File Processing
- **Client-Side**: All processing happens in browser (no server dependencies)
- **Memory Management**: Files are processed in chunks where possible
- **Progressive Loading**: UI updates during processing for large files

### Bundle Size
- **Tree Shaking**: Unused HeroUI components are automatically excluded
- **Dynamic Imports**: Consider lazy loading for heavy file processing libraries
- **Asset Optimization**: Images and icons are optimized for web

## Browser Compatibility

### Minimum Requirements
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- JavaScript enabled for core functionality
- File API support for drag-and-drop operations
- LocalStorage for file metadata persistence

### Progressive Enhancement
- Basic file input falls back if drag-and-drop unavailable
- Core functionality works without animations
- Responsive design adapts to various screen sizes

## Code Style Guidelines

### ESLint Configuration
- TypeScript strict mode enabled
- React hooks rules enforced
- Import ordering and unused import removal
- Prettier integration for consistent formatting
- JSX accessibility rules for better UX

### TypeScript Patterns
- Strict type checking enabled
- Interface definitions in `types/` directory
- Props interfaces defined inline with components
- Utility type helpers for common patterns

### Component Organization
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Prefer composition over inheritance
- **Reusability**: Base components support various use cases
- **Accessibility**: ARIA labels and keyboard navigation support
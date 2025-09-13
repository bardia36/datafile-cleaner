# Data Cleaner - Usage Guide

## New Card-Based Step System

The Data Cleaner now features an intuitive three-card interface where each card represents a step in the data cleaning process. The cards expand and collapse automatically as you progress through the workflow.

## How the Card System Works

### 🎯 **Visual States**

1. **Active Step** (Current):
   - Blue ring and enhanced shadow
   - Blue step number badge
   - "Current" status label
   - Card content fully expanded
   - Slightly scaled up for emphasis

2. **Completed Step**:
   - Green checkmark in step badge
   - "Complete" status label
   - Collapsed with summary of what was completed
   - Slightly scaled down and faded

3. **Upcoming Step**:
   - Gray step number badge
   - Locked indicator message
   - Most faded appearance
   - Shows "Complete the previous step to unlock"

### 📋 **Step Flow**

#### Step 1: Quick Data Cleanup Tool
- **Purpose**: File upload, validation, and file type detection
- **Status**: Active on page load
- **Actions**: 
  - Upload data files via drag-and-drop or by clicking anywhere on the upload zone
  - View uploaded file details with automatic data/template detection
  - Manually reassign file types using Data/Template buttons if needed
  - Wait for 5-second auto-advance countdown or click "Next" manually
- **Completion**: Automatically moves to Step 2 after countdown or manual click
- **New Features**:
  - **Fully clickable upload zone** with content2 background
  - **Automatic file detection**: Larger files (more rows) = Data, Smaller files = Template
  - **Manual override**: Click Data/Template buttons to reassign file types
  - **Auto-advance countdown**: 5-second timer starts when ≥2 files uploaded
  - **Multiple file support**: Handles >2 files with smart selection tips

#### Step 2: Data Transformation  
- **Purpose**: Template selection and comprehensive cleaning configuration
- **Activation**: When Step 1 is completed
- **Actions**:
  - Review uploaded files with detailed information
  - Template is auto-selected based on Step 1 detection
  - Preview column changes (keep vs remove)
  - **NEW**: Configure comprehensive cleaning options (none selected by default):
    - Remove duplicates, empty rows/columns
    - Trim whitespace, normalize text
    - Remove special characters, standardize dates
    - Convert case, remove leading zeros
  - Click "Clean the Data" to process
- **Completion**: Automatically moves to Step 3 when processing is finished
- **New Features**:
  - **10 cleaning criteria** with detailed descriptions
  - **Default: No options selected** - user must choose what to apply
  - **Grid layout** for better organization of options

#### Step 3: Data Validation
- **Purpose**: Results review and download
- **Activation**: When Step 2 processing is completed
- **Actions**:
  - Review processing summary statistics
  - Download cleaned data in CSV or Excel format
  - Option to "Start Over" for new files

## 🎨 **Visual Enhancements**

### Dynamic Header
- Shows context-aware subtitle based on current step
- Progress indicator with dots showing completion status
- Step counter (e.g., "2/3")

### Smooth Animations
- Cards animate in on page load with staggered timing
- Smooth transitions when expanding/collapsing content
- Content slides in from the right when steps advance
- Completed steps show with scale and fade animations

### Status Indicators
- Color-coded step badges (gray → blue → green)
- Checkmarks for completed steps
- Status labels ("Current", "Complete")
- Visual locks on upcoming steps

## 🔄 **User Experience**

### Auto-Progression
- Steps automatically advance when prerequisites are met
- No manual navigation needed between steps
- Clear visual feedback for completion status

### Error Handling
- Errors display at the top of the active card
- Dismissible error messages
- Processing errors don't break the flow

### Responsive Design
- Works on all screen sizes
- Touch-friendly interactions
- Accessible keyboard navigation

## 📁 **Testing the System**

1. **Load the page** - Only Step 1 should be active
2. **Upload files** - Use the provided sample files:
   - `sample-data.csv` (larger file with duplicates)
   - `sample-template.csv` (smaller template file)
3. **Watch the transition** - Step 1 collapses, Step 2 becomes active
4. **Configure and process** - Review settings, click "Clean the Data"
5. **Download results** - Step 3 becomes active with download options
6. **Start over** - Resets to Step 1 for new workflow

## 🛠 **Technical Implementation**

- Uses Framer Motion for smooth animations
- State management with React hooks
- Conditional rendering based on `currentStep`
- Auto-detection logic for template selection
- Real-time file processing with progress feedback

This new system provides a much more intuitive and guided experience for users, making the data cleaning process feel like a natural progression through clearly defined steps.

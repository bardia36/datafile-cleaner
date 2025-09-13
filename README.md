# Data Cleaner Web Application

A powerful, user-friendly web-based data cleaning tool that standardizes data by removing unwanted columns and duplicate rows using a template file as reference.

## Features

🧹 **Smart Data Cleaning**
- Remove unwanted columns based on template comparison
- Eliminate duplicate rows with intelligent detection
- Support for both CSV and Excel (.xlsx) formats

🎯 **Three-Step Process**
1. **File Upload**: Drag-and-drop or browse to upload data and template files
2. **Template Selection**: Auto-detection with manual override options
3. **Download**: Get cleaned data in CSV or Excel format

📊 **Intelligent Template Detection**
- Automatically selects file with fewer rows as template
- Falls back to smaller file size if row counts are equal
- Manual override available for custom selection

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: HeroUI (NextUI)
- **Styling**: Tailwind CSS
- **File Processing**: 
  - CSV: Papa Parse
  - Excel: SheetJS (xlsx)
- **Build Tool**: Turbopack (Next.js)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Data-Cleaner
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Start the development server:
```bash
bun run dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

### Step 1: Upload Files
1. Drag and drop your data file and template file onto the upload area
2. Or click "Click to upload" to browse and select files
3. Supported formats: `.csv` and `.xlsx` files (max 5MB each)
4. You need at least 2 files to proceed

### Step 2: Template Selection & Review
1. Review the uploaded files with their details (name, size, row count)
2. The application automatically selects the optimal template file:
   - File with fewer rows is selected as template
   - If row counts are equal, smaller file is selected
3. You can manually override the selection by clicking on a different file
4. Review the column preview showing which columns will be kept vs removed
5. Toggle the "Delete duplicated rows" option if needed (enabled by default)
6. Click "Clean the Data" to start processing

### Step 3: Download Results
1. Review the processing summary showing:
   - Number of rows processed
   - Number of columns removed
   - Number of duplicate rows removed
2. Download your cleaned data in your preferred format:
   - **CSV**: Universal format, works with any spreadsheet application
   - **Excel**: Native Microsoft Excel format with proper formatting

## Sample Files

The repository includes sample files for testing:
- `sample-data.csv` / `sample-data.xlsx`: Employee data with extra columns and duplicates
- `sample-template.csv` / `sample-template.xlsx`: Template with desired columns only

## Data Processing Logic

### Column Cleaning
The application compares columns between your data file and template file:
- **Keeps**: Columns that exist in both files
- **Removes**: Columns that exist in data file but not in template file
- **Order**: Follows the template file's column order

### Duplicate Detection
- Compares entire rows for exact matches
- Case-sensitive comparison
- Preserves the first occurrence, removes subsequent duplicates
- Only processes data rows (excludes header)

## File Support

### Supported Formats
- **CSV**: Comma-separated values (.csv)
- **Excel**: Microsoft Excel (.xlsx)

### File Size Limits
- Maximum file size: 5MB per file
- No limit on number of rows/columns within size constraint

### File Requirements
- Files must have headers in the first row
- CSV files should use comma as separator
- Excel files should have data in the first worksheet

## Error Handling

The application provides helpful error messages for:
- Unsupported file formats
- File parsing errors
- Missing or corrupted data
- Processing failures
- Network issues

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

Contributions are welcome! Please see the `CONTRIBUTING.md` for details on how to contribute.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

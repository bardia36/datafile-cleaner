"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button, Checkbox } from "@heroui/react";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  rowCount?: number;
  columns?: string[];
  id: string;
  data?: any[][];
  headers?: string[];
  isDataFile?: boolean;
  isTemplateFile?: boolean;
}

interface CleaningResult {
  totalRowsCleaned: number;
  columnsDeleted: number;
  duplicateRowsRemoved: number;
  cleanedData: any[][];
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [cleaningOptions, setCleaningOptions] = useState({
    removeDuplicates: false,
    removeEmptyRows: false,
    removeEmptyColumns: false,
    trimWhitespace: false,
    normalizeText: false,
    removeSpecialCharacters: false,
    standardizeDates: false,
    convertToUppercase: false,
    convertToLowercase: false,
    removeLeadingZeros: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        // Validate that the saved files have the required structure
        const validFiles = parsedFiles.filter((file: any) => 
          file && file.name && file.size && typeof file.rowCount === 'number'
        );
        setUploadedFiles(validFiles);
      } catch (error) {
        console.error('Error loading saved files:', error);
        localStorage.removeItem('uploadedFiles'); // Clear corrupted data
      }
    }
  }, []);

  // Save files to localStorage whenever uploadedFiles changes
  // Note: We don't save the actual file data to avoid localStorage size limits
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const filesToSave = uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        rowCount: file.rowCount,
        columns: file.columns,
        headers: file.headers,
        id: file.id,
        // We don't save the actual File object or data array
      }));
      localStorage.setItem('uploadedFiles', JSON.stringify(filesToSave));
    } else {
      localStorage.removeItem('uploadedFiles');
    }
  }, [uploadedFiles]);

  const cardData = [
    {
      title: "Quick Data Cleanup Tool",
      subtitle: "Upload your files",
      description: "Upload your data sheet and template file to get started. The tool will automatically detect and prepare your files for cleaning.",
      instructions: "Just drop your data sheet and template files right here, or hit upload to browse for them.",
      step: 1
    },
    {
      title: "Data Transformation",
      subtitle: "Review and configure",
      description: "Review your uploaded files, select the template, and configure cleaning options. Preview what changes will be made to your data.",
      step: 2
    },
    {
      title: "Data Validation",
      subtitle: "Download cleaned data",
      description: "Your data has been successfully cleaned! Review the processing summary and download your cleaned data in your preferred format.",
      step: 3
    }
  ];

  const handleFileUpload = async (files: FileList) => {
    await processFiles(Array.from(files));
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFiles(Array.from(files));
      // Reset the input to allow selecting the same file again
      event.target.value = '';
    }
  };

  // Auto-advance countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      interval = setInterval(() => {
        setAutoAdvanceCountdown(prev => prev! - 1);
      }, 1000);
    } else if (autoAdvanceCountdown === 0) {
      handleNextStep();
      setAutoAdvanceCountdown(null);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoAdvanceCountdown]);

  // Detect data and template files
  const detectFileTypes = (files: UploadedFile[]) => {
    if (files.length < 2) return files;
    
    // Sort by row count (descending) then by file size (descending)
    const sortedFiles = [...files].sort((a, b) => {
      if (a.rowCount !== b.rowCount) {
        return (b.rowCount || 0) - (a.rowCount || 0);
      }
      return b.size - a.size;
    });
    
    // Mark files
    const updatedFiles = files.map(file => {
      const isLargest = file.id === sortedFiles[0].id;
      return {
        ...file,
        isDataFile: isLargest,
        isTemplateFile: !isLargest && file.id === sortedFiles[1].id
      };
    });
    
    return updatedFiles;
  };

  const processFiles = async (fileArray: File[]) => {
    const newFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const uploadedFile: UploadedFile = {
          file,
          name: file.name,
          size: file.size,
          id: fileId
        };

        // Parse file to get row count, columns, headers, and data
        try {
          const { rowCount, columns, data, headers } = await parseFile(file);
          uploadedFile.rowCount = rowCount;
          uploadedFile.columns = columns;
          uploadedFile.data = data;
          uploadedFile.headers = headers;
        } catch (error) {
          console.error('Error parsing file:', error);
          setError(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        newFiles.push(uploadedFile);
      }
    }

    const allFiles = [...uploadedFiles, ...newFiles];
    const detectedFiles = detectFileTypes(allFiles);
    setUploadedFiles(detectedFiles);
    
    // Start countdown if we have 2 or more files
    if (detectedFiles.length >= 2) {
      setAutoAdvanceCountdown(5);
    }
  };

  const parseFile = async (file: File): Promise<{ rowCount: number; columns: string[]; data: any[][]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          let data: any[][] = [];
          let headers: string[] = [];
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = result as string;
            const parsed = Papa.parse(text, {
              header: false,
              skipEmptyLines: true
            });
            
            data = parsed.data as any[][];
            headers = data[0] || [];
            const rowCount = Math.max(0, data.length - 1); // Exclude header row
            
            resolve({ rowCount, columns: headers, data, headers });
          } else if (file.name.endsWith('.xlsx')) {
            // Parse Excel
            const arrayBuffer = result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            
            // Convert to array of arrays
            data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
            headers = data[0] || [];
            const rowCount = Math.max(0, data.length - 1); // Exclude header row
            
            resolve({ rowCount, columns: headers, data, headers });
          } else {
            reject(new Error('Unsupported file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const detectedFiles = detectFileTypes(newFiles);
    setUploadedFiles(detectedFiles);
    
    // Cancel countdown if less than 2 files
    if (detectedFiles.length < 2) {
      setAutoAdvanceCountdown(null);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setError(null);
    setAutoAdvanceCountdown(null);
    localStorage.removeItem('uploadedFiles');
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const toggleFileType = (fileId: string, newType: 'data' | 'template') => {
    const updatedFiles = uploadedFiles.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          isDataFile: newType === 'data',
          isTemplateFile: newType === 'template'
        };
      } else if (newType === 'data' && file.isDataFile) {
        // If setting another file as data, unset the previous data file
        return { ...file, isDataFile: false };
      } else if (newType === 'template' && file.isTemplateFile) {
        // If setting another file as template, unset the previous template file
        return { ...file, isTemplateFile: false };
      }
      return file;
    });
    
    setUploadedFiles(updatedFiles);
  };

  const scrollToCard = (step: number) => {
    // Small delay to allow animation to start
    setTimeout(() => {
      const cardElement = document.querySelector(`[data-card-step="${step}"]`);
      if (cardElement) {
        const yOffset = -20; // Offset to show card header at top with some padding
        const rect = cardElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top + yOffset;
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleStepChange = (newStep: number) => {
    // Only allow going to previous steps or current step
    // Step 2 is only accessible if step 1 is complete (has 2+ files)
    // Step 3 is only accessible if step 2 is complete (data cleaning done)
    const canAccessStep2 = uploadedFiles.length >= 2;
    const canAccessStep3 = cleaningResult !== null;
    
    if (newStep === 1 || 
        (newStep === 2 && (newStep <= currentStep || canAccessStep2)) ||
        (newStep === 3 && (newStep <= currentStep || canAccessStep3))) {
      setCurrentStep(newStep);
      setAutoAdvanceCountdown(null); // Clear countdown
      scrollToCard(newStep);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && uploadedFiles.length >= 2) {
      handleStepChange(2);
    }
  };

  const cleanData = (dataFile: UploadedFile, templateFile: UploadedFile, options: typeof cleaningOptions) => {
    if (!dataFile.data || !templateFile.data || !dataFile.headers || !templateFile.headers) {
      throw new Error('File data is not available');
    }

    const templateHeaders = templateFile.headers;
    const dataHeaders = dataFile.headers;
    const originalData = dataFile.data.slice(); // Create a copy

    // Step 1: Find columns to keep (intersection of data and template columns)
    const columnsToKeep: number[] = [];
    const keptHeaders: string[] = [];
    
    templateHeaders.forEach(templateHeader => {
      const dataIndex = dataHeaders.indexOf(templateHeader);
      if (dataIndex !== -1) {
        columnsToKeep.push(dataIndex);
        keptHeaders.push(templateHeader);
      }
    });

    // Step 2: Filter columns
    const filteredData = originalData.map(row => 
      columnsToKeep.map(colIndex => row[colIndex] || '')
    );

    let cleanedData = filteredData;
    let duplicateRowsRemoved = 0;

    // Step 3: Apply cleaning options
    if (cleanedData.length > 1) {
      const header = cleanedData[0];
      let dataRows = cleanedData.slice(1);
      
      // Remove duplicates if requested
      if (options.removeDuplicates) {
        const uniqueRows: any[][] = [];
        const seenRows = new Set<string>();

        dataRows.forEach(row => {
          const rowKey = JSON.stringify(row);
          if (!seenRows.has(rowKey)) {
            seenRows.add(rowKey);
            uniqueRows.push(row);
          } else {
            duplicateRowsRemoved++;
          }
        });
        
        dataRows = uniqueRows;
      }
      
      // Remove empty rows if requested
      if (options.removeEmptyRows) {
        dataRows = dataRows.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
      }
      
      // Apply text transformations if requested
      if (options.trimWhitespace || options.convertToUppercase || options.convertToLowercase || options.removeSpecialCharacters || options.removeLeadingZeros) {
        dataRows = dataRows.map(row => 
          row.map(cell => {
            let cellValue = cell?.toString() || '';
            
            if (options.trimWhitespace) {
              cellValue = cellValue.trim();
            }
            
            if (options.convertToUppercase) {
              cellValue = cellValue.toUpperCase();
            } else if (options.convertToLowercase) {
              cellValue = cellValue.toLowerCase();
            }
            
            if (options.removeSpecialCharacters) {
              cellValue = cellValue.replace(/[^a-zA-Z0-9\s]/g, '');
            }
            
            if (options.removeLeadingZeros && /^0+\d/.test(cellValue)) {
              cellValue = cellValue.replace(/^0+/, '');
            }
            
            return cellValue;
          })
        );
      }
      
      cleanedData = [header, ...dataRows];
    }

    const result: CleaningResult = {
      totalRowsCleaned: cleanedData.length - 1, // Exclude header
      columnsDeleted: dataHeaders.length - keptHeaders.length,
      duplicateRowsRemoved,
      cleanedData
    };

    return result;
  };

  const handleCleanData = async () => {
    const templateFile = uploadedFiles.find(file => file.isTemplateFile);
    const dataFile = uploadedFiles.find(file => file.isDataFile);
    
    if (!templateFile || !dataFile) {
      setError('Please assign Template and Data labels to files before proceeding.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = cleanData(dataFile, templateFile, cleaningOptions);
      
      setCleaningResult(result);
      handleStepChange(3);
    } catch (error) {
      console.error('Error cleaning data:', error);
      setError(`Failed to process data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!cleaningResult?.cleanedData) return;
    
    const data = cleaningResult.cleanedData;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `cleaned-data-${timestamp}`;
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = Papa.unparse(data, {
        quotes: true,
        header: false
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'xlsx') {
      // Convert to Excel
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const renderStep1 = () => (
    <>
      <p className="text-sm text-default-500 mb-4">{cardData[0].instructions}</p>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <Button 
            size="sm" 
            color="danger" 
            variant="light" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}
      
      <FileUpload.Root>
        <FileUpload.DropZone
          onDropFiles={handleFileUpload}
          hint="CSV, XLSX (Max. 5MB)"
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
          maxSize={5 * 1024 * 1024}
        />
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <FileUpload.List>
              {uploadedFiles.map((file, fileIndex) => (
                <div key={file.id} className="space-y-2">
                  <FileUpload.ListItemProgressBar
                    name={file.name}
                    size={file.size}
                    progress={100}
                    type={getFileExtension(file.name).toLowerCase() as any}
                    onDelete={() => removeFile(fileIndex)}
                  />
                  
                  {/* File Info */}
                  <div className="flex items-center justify-between px-4 py-2 bg-content2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground-500">
                        {file.rowCount} rows
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </FileUpload.List>
            
          </div>
        )}
        {uploadedFiles.length > 0 && (
          <div className="flex justify-end gap-2">
            <Button color="danger" variant="light" onClick={clearAllFiles}>
              Clear All Files
            </Button>
          </div>
        )}
      </FileUpload.Root>

      {/* File count and Next Button */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-foreground-600 mb-2">
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            {uploadedFiles.length < 2 && ' (need at least 2 files)'}
          </p>
          
          {uploadedFiles.length >= 2 && (
            <div className="space-y-3">
              {autoAdvanceCountdown !== null && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      Auto-advancing to next step in {autoAdvanceCountdown} seconds...
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    variant="light"
                    color="primary"
                    className="mt-2 text-xs"
                    onClick={() => setAutoAdvanceCountdown(null)}
                  >
                    Cancel Auto-advance
                  </Button>
                </div>
              )}
              
            <Button 
              color="primary"
              className="w-full"
              onClick={handleNextStep}
            >
                {autoAdvanceCountdown !== null ? 'Next (Skip Countdown)' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Template Selection and Review</h3>
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <Button 
              size="sm" 
              color="danger" 
              variant="light" 
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}
        
        {/* File Details */}
        <div className="space-y-3">
          {uploadedFiles.map((file, index) => (
            <div 
              key={file.id}
              className="p-4 rounded-lg bg-content1 hover:ring-2 hover:ring-default-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-foreground-500">
                        Size: {formatFileSize(file.size)} | Rows: {file.rowCount || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Template/Data Selection Chips */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={file.isDataFile ? "solid" : "bordered"}
                      color={file.isDataFile ? "primary" : "default"}
                      onClick={() => toggleFileType(file.id, 'data')}
                      className="h-6 px-2 text-xs min-w-0"
                    >
                      Data
                    </Button>
                    <Button
                      size="sm"
                      variant={file.isTemplateFile ? "solid" : "bordered"}
                      color={file.isTemplateFile ? "success" : "default"}
                      onClick={() => toggleFileType(file.id, 'template')}
                      className="h-6 px-2 text-xs min-w-0"
                    >
                      Template
                    </Button>
                  </div>
                </div>
                
                {/* Column Preview */}
                {file.headers && file.headers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Columns ({file.headers.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {file.headers.slice(0, 6).map((header, headerIndex) => (
                        <span 
                          key={headerIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {header}
                        </span>
                      ))}
                      {file.headers.length > 6 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{file.headers.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Column Preview */}
        {uploadedFiles.length >= 2 && (
          <div className="mt-4 p-4 bg-content2 rounded-lg">
            <h4 className="font-medium text-foreground mb-3">Processing Preview</h4>
            {(() => {
              const templateFile = uploadedFiles.find(file => file.isTemplateFile);
              const dataFile = uploadedFiles.find(file => file.isDataFile);
              
              if (!templateFile || !dataFile || !templateFile.headers || !dataFile.headers) {
                return (
                  <p className="text-sm text-foreground-500">Please assign Template and Data labels to files to see preview.</p>
                );
              }
              
              const keptColumns = templateFile.headers.filter(col => dataFile.headers!.includes(col));
              const removedColumns = dataFile.headers.filter(col => !templateFile.headers!.includes(col));
              
              return (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-success mb-1">
                      Columns to keep ({keptColumns.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {keptColumns.map((col, idx) => (
                        <span key={idx} className="px-2 py-1 bg-success/10 text-success rounded text-xs">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {removedColumns.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-danger mb-1">
                        Columns to remove ({removedColumns.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {removedColumns.map((col, idx) => (
                          <span key={idx} className="px-2 py-1 bg-danger/10 text-danger rounded text-xs">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Cleaning Options */}
        <div className="mt-4">
          <h4 className="font-medium text-foreground mb-3">Data Cleaning Options</h4>
          <p className="text-sm text-foreground-600 mb-4">Select the cleaning operations you want to apply to your data:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Checkbox
              isSelected={cleaningOptions.removeDuplicates}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, removeDuplicates: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Remove Duplicates</span>
                <p className="text-xs text-gray-500">Remove identical rows</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.removeEmptyRows}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, removeEmptyRows: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Remove Empty Rows</span>
                <p className="text-xs text-gray-500">Remove rows with no data</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.removeEmptyColumns}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, removeEmptyColumns: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Remove Empty Columns</span>
                <p className="text-xs text-gray-500">Remove columns with no data</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.trimWhitespace}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, trimWhitespace: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Trim Whitespace</span>
                <p className="text-xs text-gray-500">Remove leading/trailing spaces</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.normalizeText}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, normalizeText: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Normalize Text</span>
                <p className="text-xs text-gray-500">Standardize text formatting</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.removeSpecialCharacters}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, removeSpecialCharacters: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Remove Special Characters</span>
                <p className="text-xs text-gray-500">Remove non-alphanumeric chars</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.standardizeDates}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, standardizeDates: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Standardize Dates</span>
                <p className="text-xs text-gray-500">Convert dates to standard format</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.convertToUppercase}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, convertToUppercase: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Convert to Uppercase</span>
                <p className="text-xs text-gray-500">Convert text to UPPERCASE</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.convertToLowercase}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, convertToLowercase: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Convert to Lowercase</span>
                <p className="text-xs text-gray-500">Convert text to lowercase</p>
              </div>
            </Checkbox>
            
            <Checkbox
              isSelected={cleaningOptions.removeLeadingZeros}
              onValueChange={(value) => setCleaningOptions(prev => ({ ...prev, removeLeadingZeros: value }))}
              color="primary"
            >
              <div>
                <span className="font-medium">Remove Leading Zeros</span>
                <p className="text-xs text-gray-500">Remove zeros at start of numbers</p>
              </div>
            </Checkbox>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm text-gray-600">
                No cleaning options are selected by default. Choose the operations that best suit your data.
              </span>
            </div>
          </div>
        </div>

        {/* Clean Data Button */}
        <div className="mt-6">
        <Button 
          color="primary"
          className="w-full"
          onClick={handleCleanData}
          isLoading={isProcessing}
        >
            {isProcessing ? 'Cleaning Data...' : 'Clean the Data'}
          </Button>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Processing Complete</h3>
        
        {/* Results Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h4 className="font-medium text-green-800">Data Cleaning Complete!</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{cleaningResult?.totalRowsCleaned}</div>
              <div className="text-sm text-green-700">Rows Processed</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-blue-600">{cleaningResult?.columnsDeleted}</div>
              <div className="text-sm text-blue-700">Columns Removed</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-2xl font-bold text-orange-600">{cleaningResult?.duplicateRowsRemoved}</div>
              <div className="text-sm text-orange-700">Duplicates Removed</div>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Download Your Cleaned Data</h4>
          <p className="text-sm text-gray-600">Choose your preferred format to download the processed data.</p>
          <div className="grid grid-cols-2 gap-3">
          <Button 
            color="primary" 
            className="flex-1 font-medium py-3"
            onClick={() => handleDownload('csv')}
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
            >
              Download CSV
            </Button>
          <Button 
            color="success" 
            className="flex-1 font-medium py-3"
            onClick={() => handleDownload('xlsx')}
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
            >
              Download Excel
            </Button>
          </div>
        </div>

        {/* Start Over Button */}
        <div className="mt-6">
          <Button 
            color="default" 
            variant="bordered"
            className="w-full"
            onClick={() => {
              setCurrentStep(1);
              setUploadedFiles([]);
              setCleaningResult(null);
              setError(null);
              setIsProcessing(false);
              setAutoAdvanceCountdown(null);
              setCleaningOptions({
                removeDuplicates: false,
                removeEmptyRows: false,
                removeEmptyColumns: false,
                trimWhitespace: false,
                normalizeText: false,
                removeSpecialCharacters: false,
                standardizeDates: false,
                convertToUppercase: false,
                convertToLowercase: false,
                removeLeadingZeros: false
              });
              clearAllFiles();
            }}
          >
            Start Over
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("/assets/images/bg1.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground drop-shadow-lg mb-2">Data Cleaner</h1>
          <p className="text-lg text-foreground/80 drop-shadow">
            {currentStep === 1 && "Upload your files to get started"}
            {currentStep === 2 && "Review and configure your data transformation"}
            {currentStep === 3 && "Download your cleaned data"}
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 bg-content1/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-foreground text-sm">Progress:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-foreground' : 'bg-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-foreground text-sm">{currentStep}/3</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {cardData.map((card, index) => {
            const isActiveStep = currentStep === card.step;
            const isCompletedStep = currentStep > card.step;
            const isUpcomingStep = currentStep < card.step;
            
            // Determine if step is accessible
            const canAccessStep2 = uploadedFiles.length >= 2;
            const canAccessStep3 = cleaningResult !== null;
            const isAccessible = card.step === 1 || 
                                (card.step === 2 && (card.step <= currentStep || canAccessStep2)) ||
                                (card.step === 3 && (card.step <= currentStep || canAccessStep3));
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card 
                  data-card-step={card.step}
                  className={`w-full rounded-3xl transition-all duration-500 ${
                    isActiveStep 
                      ? 'shadow-2xl scale-[1.02] border-none' 
                      : isCompletedStep
                        ? 'shadow-md opacity-75 scale-[0.98]'
                        : 'shadow-lg opacity-60 scale-[0.96]'
                  }`}
                  radius="lg"
                >
                <CardHeader 
                  className={`flex gap-3 justify-between items-center ${
                    !isActiveStep && isAccessible ? 'cursor-pointer hover:bg-content1 transition-colors duration-200' : 
                    !isAccessible && !isActiveStep ? 'cursor-not-allowed opacity-60' : ''
                  }`}
                  onClick={() => !isActiveStep && isAccessible && handleStepChange(card.step)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCompletedStep 
                        ? 'bg-success text-success-foreground'
                        : isActiveStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-default-300 text-default-600'
                    }`}>
                      {isCompletedStep ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        card.step
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className={`text-md font-semibold transition-colors duration-300 ${
                        isActiveStep ? 'text-primary' : isCompletedStep ? 'text-success' : 'text-foreground-500'
                      }`}>{card.title}</p>
                      <p className="text-small text-foreground-500">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActiveStep && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                    {isCompletedStep && (
                      <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                        Complete
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {isActiveStep && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <Divider />
                      <CardBody>
                        <p className="text-sm text-default-600 mb-4">{card.description}</p>
                        
                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                          {card.step === 1 && (
                            <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {renderStep1()}
                            </motion.div>
                          )}
                          {card.step === 2 && (
                            <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {renderStep2()}
                            </motion.div>
                          )}
                          {card.step === 3 && (
                            <motion.div
                              key="step3"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {renderStep3()}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardBody>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Upcoming Step Hint */}
                <AnimatePresence>
                  {isUpcomingStep && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Divider />
                      <CardBody>
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                        >
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span className="text-sm font-medium">Complete the previous step to unlock</span>
                          </div>
                        </motion.div>
                      </CardBody>
                    </motion.div>
                  )}
                </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Cat SVG fixed to viewport */}
      <div className="fixed bottom-4 right-4 z-50">
        <img 
          src="/assets/images/cat.svg" 
          alt="Cat" 
          className="w-20 h-20 opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  );
}


/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { uploadTransactions } from '../services/api';

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
}

interface TransactionUploadProps {
  onSuccess?: () => void;
}

const TransactionUpload = ({ onSuccess }: TransactionUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      // Get all headers first
      const allHeaders = lines[0].split(',').map(h => h.trim());
      
      // Find non-empty columns by checking all rows
      const nonEmptyColumns = allHeaders.map((_, colIndex) => {
        // Check if any row has data in this column (excluding header)
        return lines.slice(1).some(line => {
          const cells = line.split(',');
          return cells[colIndex] && cells[colIndex].trim() !== '';
        });
      });

      // Filter headers and create column index mapping
      const validHeaders = allHeaders.filter((_, index) => nonEmptyColumns[index]);
      setHeaders(validHeaders);
      
      // Process preview data, filtering out empty columns
      const previewData = lines.slice(1, 6).map(line => {
        const cells = line.split(',').map(cell => cell.trim());
        return cells.filter((_, index) => nonEmptyColumns[index]);
      });
      setPreview(previewData);
      
      // Try to auto-map columns
      const autoMapping: Partial<ColumnMapping> = {};
      validHeaders.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('date')) autoMapping.date = header;
        if (lowerHeader.includes('desc')) autoMapping.description = header;
        if (lowerHeader.includes('amount')) autoMapping.amount = header;
      });
      
      setMapping(prev => ({ ...prev, ...autoMapping }));
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(file);
      readCSV(file);
      setError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Validate mapping
    const requiredFields = ['date', 'description', 'amount'] as const;
    const missingFields = requiredFields.filter(field => !mapping[field]);
    
    if (missingFields.length > 0) {
      setError(`Please map the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(mapping));

      await uploadTransactions(formData);
      setUploadSuccess(true);
      
      // Reset form
      setFile(null);
      setPreview([]);
      setHeaders([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFile(file);
      readCSV(file);
      setError('');
      setUploadSuccess(false);
    } else {
      setError('Please upload a CSV file');
    }
  };

  const handleBoxClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Transactions</h2>

      {/* File Upload Area */}
      <div
        onClick={handleBoxClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        
        {!file ? (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click here or drag and drop your CSV file
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <span className="text-sm text-gray-600">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setPreview([]);
                setHeaders([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="mt-4 p-3 bg-green-50 rounded-md flex items-center text-green-700">
          <Check className="h-5 w-5 mr-2" />
          <span className="text-sm">Transactions uploaded successfully!</span>
        </div>
      )}

      {/* Column Mapping */}
      {headers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Map Columns</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(mapping).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <select
                  value={mapping[field as keyof ColumnMapping]}
                  onChange={(e) => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select column</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:bg-indigo-400"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Transactions'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionUpload;
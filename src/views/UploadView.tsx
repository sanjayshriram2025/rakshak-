import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle, 
  Sparkles, 
  ArrowRight,
  Shield,
  FileCheck
} from 'lucide-react';
import { ProcessingPipeline } from '../components/upload/ProcessingPipeline';
import { AnalysisSummary } from '../types';
import { apiService } from '../services/api';

interface UploadViewProps {
  onAnalysisComplete: (summary: AnalysisSummary) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onAnalysisComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('FIR / Police Report');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const dataCategories = [
    'FIR / Police Report',
    'CDR Call Detail Record',
    'Financial Transaction Data',
    'Surveillance Report',
    'Criminal History Record',
    'Intelligence Note',
    'Other Authorized Records'
  ];

  const handleSimulateUpload = () => {
    const mockFile = new File(['FIR-1024 text contents...'], 'FIR_1024_Patna_Hawala_Report.pdf', { type: 'application/pdf' });
    setFile(mockFile);
    setIsProcessing(true);
    setStep(1);

    // Simulate multi-stage pipeline progression
    let s = 1;
    const interval = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= 8) {
        clearInterval(interval);
        setIsProcessing(false);
        apiService.analysis.uploadAndAnalyzeFir(mockFile).then((summary) => {
          onAnalysisComplete(summary);
        });
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-sky-400" />
          Upload & Analyze Crime Data
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingest unstructured FIR reports, CDR dumps, and financial statements for NLP entity & graph triplet extraction.
        </p>
      </div>

      {/* Category Selection Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">Select Record Category:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dataCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Area */}
      {!file ? (
        <div 
          onClick={handleSimulateUpload}
          className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-12 text-center bg-slate-900/50 hover:bg-slate-900/80 cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center mx-auto shadow-glow-primary group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Click or Drag & Drop Crime Data File</h3>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT, CSV, JSON (Up to 500 MB)</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>Supported: FIR Reports • CDR Dumps • FIU Financials</span>
          </div>
        </div>
      ) : (
        /* Processing Visualizer */
        <ProcessingPipeline
          fileName={file.name}
          isProcessing={isProcessing}
          currentStep={step}
          onComplete={onAnalysisComplete}
        />
      )}

    </div>
  );
};

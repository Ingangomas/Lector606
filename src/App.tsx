import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowLeft, XCircle, FileImage, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { processInvoice, InvoiceData } from './utils/gemini';
import { exportToExcel, exportToPDF } from './utils/export';

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState('');
  const [companyRnc, setCompanyRnc] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  } as any);

  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    setStep(3);
    setIsProcessing(true);

    const initialInvoices: InvoiceData[] = files.map(f => ({
      id: Math.random().toString(36).substring(7),
      fileName: f.name,
      proveedor: '',
      rncProveedor: '',
      ncf: '',
      subTotal: '',
      itbis: '',
      total: '',
      formaPago: '',
      rncCliente: '',
      ocrError: false,
      mismatchRnc: false,
      status: 'PENDING',
      fileUrl: URL.createObjectURL(f)
    }));

    setInvoices(initialInvoices);

    for (let i = 0; i < files.length; i++) {
      setInvoices(prev => prev.map((inv, idx) => idx === i ? { ...inv, status: 'PROCESSING' } : inv));
      
      try {
        const result = await processInvoice(files[i], companyRnc);
        setInvoices(prev => prev.map((inv, idx) => idx === i ? { 
          ...inv, 
          ...result, 
          status: 'SUCCESS' 
        } : inv));
      } catch (error: any) {
        setInvoices(prev => prev.map((inv, idx) => idx === i ? { 
          ...inv, 
          status: 'ERROR',
          errorMsg: error.message || 'Error processing file'
        } : inv));
      }
    }
    setIsProcessing(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetApp = () => {
    setStep(1);
    setFiles([]);
    setInvoices([]);
    setCompanyName('');
    setCompanyRnc('');
  };

  const ocrErrors = invoices.filter(i => i.ocrError && i.status === 'SUCCESS');
  const rncMismatches = invoices.filter(i => i.mismatchRnc && i.status === 'SUCCESS');
  const successfulInvoices = invoices.filter(i => i.status === 'SUCCESS');

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full py-6 flex justify-center items-center z-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Lector 606
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto w-full bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl rounded-3xl p-8"
            >
              <h2 className="text-xl font-medium mb-6 text-center">Configuración Inicial</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nombre de la Compañía</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Ej: Constructora Angomas Tejeda S.R.L."
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">RNC de la Compañía</label>
                  <input
                    type="text"
                    value={companyRnc}
                    onChange={e => setCompanyRnc(e.target.value)}
                    placeholder="Ej: 132621468"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!companyName || !companyRnc}
                  className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Siguiente
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl rounded-3xl p-8"
            >
              <div className="flex items-center mb-6">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors mr-2">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-xl font-medium">Cargar Facturas</h2>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'}`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Arrastra y suelta tus facturas aquí</p>
                <p className="text-slate-400 text-sm mt-1">Soporta Imágenes (JPG, PNG) y PDFs</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Archivos Seleccionados ({files.length})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {file.type.includes('pdf') ? <FileText className="w-5 h-5 text-red-500 shrink-0" /> : <FileImage className="w-5 h-5 text-blue-500 shrink-0" />}
                          <span className="text-sm truncate font-medium">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleStartProcessing}
                    className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
                  >
                    Procesar {files.length} Facturas
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex justify-between items-center bg-white/70 backdrop-blur-2xl border border-white/50 shadow-sm rounded-2xl p-4 px-6">
                <div>
                  <h2 className="text-xl font-medium">Resultados del Procesamiento</h2>
                  <p className="text-sm text-slate-500">{companyName} (RNC: {companyRnc})</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportToExcel(successfulInvoices, companyName)}
                    disabled={isProcessing || successfulInvoices.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                  <button
                    onClick={() => exportToPDF(successfulInvoices, companyName)}
                    disabled={isProcessing || successfulInvoices.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={resetApp}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    Nueva Carga
                  </button>
                </div>
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ocrErrors.length > 0 && (
                  <div className="bg-orange-50/80 backdrop-blur-md border border-orange-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-orange-800">Errores de Lectura OCR ({ocrErrors.length})</h3>
                        <p className="text-sm text-orange-600 mt-1">Se encontraron caracteres ilegibles (marcados con 'x') en las siguientes facturas. Por favor, revise manualmente.</p>
                        <ul className="mt-2 text-sm text-orange-700 list-disc pl-4">
                          {ocrErrors.map(inv => <li key={inv.id}>{inv.fileName}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {rncMismatches.length > 0 && (
                  <div className="bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-800">Discrepancia de RNC ({rncMismatches.length})</h3>
                        <p className="text-sm text-red-600 mt-1">El RNC del cliente en estas facturas no coincide con el RNC de {companyName} ({companyRnc}).</p>
                        <ul className="mt-2 text-sm text-red-700 list-disc pl-4">
                          {rncMismatches.map(inv => <li key={inv.id}>{inv.fileName} (Encontrado: {inv.rncCliente})</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Archivo</th>
                        <th className="px-4 py-3 font-medium">Proveedor</th>
                        <th className="px-4 py-3 font-medium">RNC Prov.</th>
                        <th className="px-4 py-3 font-medium">NCF</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 max-w-[150px] truncate" title={inv.fileName}>
                            {inv.fileName}
                          </td>
                          <td className="px-4 py-3">{inv.proveedor || '-'}</td>
                          <td className="px-4 py-3">{inv.rncProveedor || '-'}</td>
                          <td className="px-4 py-3">{inv.ncf || '-'}</td>
                          <td className="px-4 py-3 text-right">{inv.total || '-'}</td>
                          <td className="px-4 py-3">
                            {inv.status === 'PENDING' && <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">Pendiente</span>}
                            {inv.status === 'PROCESSING' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Procesando</span>}
                            {inv.status === 'ERROR' && <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium" title={inv.errorMsg}>Error</span>}
                            {inv.status === 'SUCCESS' && (
                              <div className="flex gap-1">
                                {inv.mismatchRnc ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">MISMATCH_RNC</span>
                                ) : inv.ocrError ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-medium">ERROR_OCR</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">OK</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-slate-400 z-10">
        Developed by Dominican AI Studio LLC
      </footer>
    </div>
  );
}

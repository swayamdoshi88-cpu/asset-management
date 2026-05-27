/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  Check, 
  MapPin, 
  User, 
  AlertTriangle, 
  Smile, 
  RefreshCw, 
  Play, 
  CheckCircle,
  HelpCircle,
  Smartphone,
  Barcode
} from 'lucide-react';
import { Asset, AuditSession, VarianceItem } from '../types';

interface VerificationSimulatorProps {
  assets: Asset[];
  sessions: AuditSession[];
  onAddVariance: (variance: VarianceItem) => void;
  onUpdateAssetAudit: (assetId: string, lastAuditDate: string) => void;
  onIncrementSessionScan: (sessionId: string) => void;
}

export default function VerificationSimulator({
  assets,
  sessions,
  onAddVariance,
  onUpdateAssetAudit,
  onIncrementSessionScan
}: VerificationSimulatorProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  
  // Scanning engine states
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [activeScannedAsset, setActiveScannedAsset] = useState<Asset | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [varianceAlert, setVarianceAlert] = useState(false);

  // Reality simulation parameters (what the auditor physically observes on the desk)
  const [observedLocation, setObservedLocation] = useState('');
  const [observedCustodian, setObservedCustodian] = useState('');
  const [observedStatus, setObservedStatus] = useState<'Allocated' | 'In Storage' | 'In Transit' | 'Retired' | 'Maintenance'>('Allocated');

  // Load selected session
  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Shortcut scanning buttons (helps user demo the app with zero typing!)
  const sessionAssets = assets.filter(asset => {
    if (!currentSession) return true;
    const locPrefix = currentSession.targetLocation.split(' - ')[0]; // E.g., HQ Server Room
    return asset.location.includes(locPrefix) || currentSession.targetLocation === 'All HQ Buildings';
  });

  const handleScanShortcut = (asset: Asset) => {
    setScannedCodeInput(asset.tagCode);
    handleProcessScan(asset.tagCode, asset);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCodeInput.trim()) return;
    
    // Find asset match by tagCode or ID
    const foundAsset = assets.find(a => 
      a.tagCode.toLowerCase() === scannedCodeInput.trim().toLowerCase() ||
      a.id.toLowerCase() === scannedCodeInput.trim().toLowerCase()
    );

    if (foundAsset) {
      handleProcessScan(foundAsset.tagCode, foundAsset);
    } else {
      setErrorMessage(`Unrecognized tag or EPC: "${scannedCodeInput}". Please use one of the shortcuts or input a valid code.`);
      setActiveScannedAsset(null);
      setVarianceAlert(false);
    }
  };

  const handleProcessScan = (tagCode: string, asset: Asset) => {
    setErrorMessage('');
    setActiveScannedAsset(asset);
    
    // Pre-fill the observed fields with standard book parameters
    // This allows the user to either accept them as "perfectly matching" OR alter them to simulate differences!
    setObservedLocation(asset.location);
    setObservedCustodian(asset.custodian);
    setObservedStatus(asset.status);
    setVarianceAlert(false);
  };

  const handleCommitScanReality = () => {
    if (!activeScannedAsset) return;

    // Check if there is a discrepancy between actual records and scanning observations
    const isLocationMismatch = observedLocation.trim() !== activeScannedAsset.location;
    const isCustodianMismatch = observedCustodian.trim() !== activeScannedAsset.custodian;
    const isStatusMismatch = observedStatus !== activeScannedAsset.status;

    const hasAnyDiscrepancy = isLocationMismatch || isCustodianMismatch || isStatusMismatch;

    if (hasAnyDiscrepancy) {
      // Determine what type of mismatch occurred
      let vType: VarianceItem['type'] = 'Location Mismatch';
      if (isCustodianMismatch) vType = 'Custodian Mismatch';
      else if (isStatusMismatch) vType = 'Status Mismatch';

      const nextVarId = `VAR-2026-${Math.floor(200 + Math.random() * 800)}`;
      const varianceRecord: VarianceItem = {
        id: nextVarId,
        assetId: activeScannedAsset.id,
        assetName: activeScannedAsset.name,
        type: vType,
        severity: isStatusMismatch || isLocationMismatch ? 'High' : 'Medium',
        bookValue: {
          location: activeScannedAsset.location,
          custodian: activeScannedAsset.custodian,
          status: activeScannedAsset.status
        },
        scannedValue: {
          location: observedLocation,
          custodian: observedCustodian,
          status: observedStatus
        },
        scannedAt: new Date().toISOString(),
        resolved: false,
        notes: `Simulated scan discrepancy at ${currentSession?.title || 'Standalone Scan'}. Observed location: "${observedLocation}", observed custodian: "${observedCustodian}".`
      };

      // Add variance exceptions
      onAddVariance(varianceRecord);
      setVarianceAlert(true);
      
      // Still update last audit date on asset to acknowledge scan completion
      onUpdateAssetAudit(activeScannedAsset.id, new Date().toISOString().split('T')[0]);
      if (currentSession) {
        onIncrementSessionScan(currentSession.id);
      }
    } else {
      // Matched beautifully! Mark compliant
      setSuccessAnimation(true);
      onUpdateAssetAudit(activeScannedAsset.id, new Date().toISOString().split('T')[0]);
      if (currentSession) {
        onIncrementSessionScan(currentSession.id);
      }
      setTimeout(() => {
        setSuccessAnimation(false);
      }, 3000);
    }

    // Reset simulator after commit
    setActiveScannedAsset(null);
    setScannedCodeInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column - Simulator Settings & Shortcuts */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Session Selector */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <label className="block text-xs font-mono font-bold text-zinc-500 tracking-wider uppercase mb-2">
            1. CHOOSE AUDIT RUN TARGET
          </label>
          <select
            id="select-audit-run"
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setActiveScannedAsset(null);
              setErrorMessage('');
            }}
            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg p-2.5 text-sm font-medium focus:ring-1 focus:outline-hidden"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.id}: {s.title}
              </option>
            ))}
          </select>

          {currentSession && (
            <div className="mt-3 bg-zinc-50/50 rounded-lg p-3 border border-zinc-100 space-y-2 text-xs text-zinc-650">
              <div className="flex justify-between">
                <span className="font-mono">Expected Location Scope:</span>
                <span className="font-medium text-zinc-900">{currentSession.targetLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono">Completion Status:</span>
                <span className="font-semibold text-emerald-700">
                  {currentSession.scannedCount} of {currentSession.totalCount} verified
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Asset Shortcut Scans */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h4 id="shortcuts-title" className="text-xs font-mono font-bold text-zinc-500 tracking-wider uppercase mb-1">
              2. SIMULATE PHYSICAL STAMMING / SCAN
            </h4>
            <p className="text-xs text-zinc-400">
              Pick any cataloged workspace item to mimic scanning its QR barcode badge with an audit device.
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sessionAssets.map(asset => (
              <button
                key={asset.id}
                id={`btn-shortcut-scan-${asset.id}`}
                onClick={() => handleScanShortcut(asset)}
                className="w-full text-left border border-zinc-150 hover:border-emerald-500 rounded-lg p-2.5 hover:bg-emerald-50/30 transition-all text-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                    {asset.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    ID: {asset.id} | Tag: <span className="text-zinc-700 font-bold">{asset.tagCode}</span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-zinc-100 group-hover:bg-emerald-500 group-hover:text-zinc-950 font-mono font-bold rounded-md text-[9px] text-zinc-600 transition-colors flex items-center gap-1">
                  <Scan size={10} /> SCAN
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column - Scanning terminal display & discrepancies simulator */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Verification Hub Workbench Terminal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl text-zinc-100 flex flex-col min-h-[460px]">
          
          {/* Simulated hardware bezel header */}
          <div className="bg-zinc-950 px-4 py-3 flex items-center justify-between border-b border-zinc-855 select-none text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono tracking-widest uppercase font-semibold">Verification System Terminal V1.9</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-sm">CAMERA ID: 104</span>
              <span>BATTERY: 98%</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            
            {/* Camera feed finder layout OR manual search input */}
            <div className="space-y-4">
              <form onSubmit={handleManualScanSubmit} className="flex gap-2">
                <input
                  id="input-terminal-scan"
                  type="text"
                  placeholder="Input Tag Code manually (e.g. QR-MBP-9812A)..."
                  value={scannedCodeInput}
                  onChange={(e) => setScannedCodeInput(e.target.value)}
                  className="bg-zinc-950 text-white font-mono placeholder-zinc-500 text-xs border border-zinc-805 rounded-lg px-4 py-2.5 flex-1 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  id="btn-manual-scan-submit"
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Scan size={14} /> SCAN CODE
                </button>
              </form>

              {/* Error label */}
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-900/60 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="shrink-0 text-rose-400 mt-0.5" size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Notification element */}
              {successAnimation && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-950/40 border border-emerald-900/70 p-4 rounded-xl text-center space-y-2"
                >
                  <div className="w-10 h-10 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle size={22} />
                  </div>
                  <h5 className="font-bold text-emerald-400 text-sm">Asset Compliant & Verified</h5>
                  <p className="text-[11px] text-zinc-300">
                    Physical variables exact match book balances. Audit date timestamped dynamically.
                  </p>
                </motion.div>
              )}

              {/* Variance logged alert element */}
              {varianceAlert && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-amber-950/40 border border-amber-900/70 p-4 rounded-xl text-center space-y-2"
                >
                  <div className="w-10 h-10 bg-amber-500 text-zinc-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <AlertTriangle size={22} className="animate-bounce" />
                  </div>
                  <h5 className="font-bold text-amber-400 text-sm">Discrepancy Exception Logged</h5>
                  <p className="text-[11px] text-zinc-300">
                    Mismatched physical variables recorded in the Variance Reconciliation Queue for governance review.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Simulated Live Viewfinder Frame / Scanning Screen */}
            {!activeScannedAsset ? (
              <div className="border border-dashed border-zinc-750 rounded-xl bg-zinc-950/50 flex-1 min-h-[220px] flex flex-col items-center justify-center relative p-6 text-center select-none overflow-hidden">
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-zinc-700"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-zinc-700"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-zinc-700"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-zinc-700"></div>
                
                {/* Horizontal dynamic scan sweeping beam */}
                <div className="absolute inset-x-0 h-0.5 bg-emerald-500/25 top-1/2 shadow-xs animate-pulse"></div>

                <div className="space-y-4 max-w-sm pointer-events-none relative z-10 text-zinc-400">
                  <div className="w-12 h-12 rounded-full border border-dashed border-zinc-650 flex items-center justify-center mx-auto text-zinc-400">
                    <Smartphone size={22} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">Awaiting Physical Tag Scan</p>
                    <p className="text-[10px] text-zinc-500 font-sans">
                      Select any asset shortcut on the left panel or type a valid Tag/Asset ID code above to simulate on-grounds verification.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Reality Verification Module - Screen with Book matches and adjustable reality sliders
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-5"
              >
                {/* Book specifications header */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">SCANNED TAG MATCHED</span>
                    <h4 className="text-sm font-bold text-white font-mono">{activeScannedAsset.id}</h4>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-zinc-300">{activeScannedAsset.name}</div>
                    <div className="text-[10px] text-zinc-500">S/N: {activeScannedAsset.serialNumber}</div>
                  </div>
                </div>

                {/* Left side book value, right side physical user realities */}
                <div className="space-y-4 text-xs">
                  <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                    Compare Physical Reality with Ledger Books
                  </div>

                  <div className="space-y-3">
                    {/* Location Mismatch Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="space-y-1">
                        <span className="text-zinc-500 font-mono text-[9px] block">LEDGER BOOK VALUE (LOCATION)</span>
                        <div className="font-medium text-[11px] truncate flex items-center gap-1">
                          <MapPin size={11} className="text-zinc-500" />
                          {activeScannedAsset.location}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-emerald-400 font-mono text-[9px] block font-bold">PHYSICAL REALITY (OBSERVED LOCATION)</label>
                        <select
                          id="select-obs-loc"
                          value={observedLocation}
                          onChange={(e) => setObservedLocation(e.target.value)}
                          className="w-full bg-zinc-950 text-white border border-zinc-805 rounded-md p-1.5 focus:outline-hidden"
                        >
                          <option value={activeScannedAsset.location}>{activeScannedAsset.location} (Confirmed Match)</option>
                          <option value="HQ Building A - Floor 4 (Desk 412)">HQ Building A - Floor 4 (Desk 412)</option>
                          <option value="HQ Server Room - Rack 01">HQ Server Room - Rack 01</option>
                          <option value="HQ Building B - Floor 5 (Office 511)">HQ Building B - Floor 5 (Office 511)</option>
                          <option value="Offsite - Employee Residence Remote">Offsite - Employee Residence Remote</option>
                        </select>
                      </div>
                    </div>

                    {/* Custodian Mismatch controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-900 border border-zinc-805 rounded-lg">
                      <div className="space-y-1">
                        <span className="text-zinc-500 font-mono text-[9px] block">LEDGER BOOK VALUE (CUSTODIAN)</span>
                        <div className="font-medium text-[11px] truncate flex items-center gap-1">
                          <User size={11} className="text-zinc-500" />
                          {activeScannedAsset.custodian}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-emerald-400 font-mono text-[9px] block font-bold">PHYSICAL REALITY (OBSERVED CUSTODIAN)</label>
                        <select
                          id="select-obs-cust"
                          value={observedCustodian}
                          onChange={(e) => setObservedCustodian(e.target.value)}
                          className="w-full bg-zinc-950 text-white border border-zinc-805 rounded-md p-1.5 focus:outline-hidden"
                        >
                          <option value={activeScannedAsset.custodian}>{activeScannedAsset.custodian} (Confirmed Match)</option>
                          <option value="Alex Rivera">Alex Rivera</option>
                          <option value="Sarah Jenkins">Sarah Jenkins</option>
                          <option value="Jessica Morris">Jessica Morris</option>
                          <option value="Marcus Sterling">Marcus Sterling</option>
                        </select>
                      </div>
                    </div>

                    {/* Status mismatch controllers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-900 border border-zinc-805 rounded-lg">
                      <div className="space-y-1">
                        <span className="text-zinc-500 font-mono text-[9px] block">LEDGER BOOK VALUE (STATUS)</span>
                        <span className="font-semibold text-zinc-300 font-mono text-[10px] block mt-0.5">{activeScannedAsset.status}</span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-emerald-400 font-mono text-[9px] block font-bold font-semibold uppercase">PHYSICAL DEVICE CONDITION</label>
                        <select
                          id="select-obs-status"
                          value={observedStatus}
                          onChange={(e) => setObservedStatus(e.target.value as any)}
                          className="w-full bg-zinc-950 text-white border border-zinc-850 rounded-md p-1.5 focus:outline-hidden"
                        >
                          <option value="Allocated">Allocated</option>
                          <option value="In Storage">In Storage</option>
                          <option value="Maintenance">Maintenance / Physically Damaged</option>
                          <option value="Retired">Retired / Out of order</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive submit decision bar */}
                <div className="flex gap-2">
                  <button
                    id="btn-commit-obs"
                    onClick={handleCommitScanReality}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs rounded-lg transition-colors"
                  >
                    Commit Scan Results & Log Audit
                  </button>
                  <button
                    onClick={() => {
                      setActiveScannedAsset(null);
                      setScannedCodeInput('');
                    }}
                    className="px-4 py-2.5 bg-zinc-805 hover:bg-zinc-750 text-zinc-300 font-mono text-xs rounded-lg"
                  >
                    Cancel Scan
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

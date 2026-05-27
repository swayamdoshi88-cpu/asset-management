/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Check, 
  Trash2, 
  HelpCircle, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Shuffle,
  ShieldAlert,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { VarianceItem } from '../types';

interface VarianceQueueViewProps {
  variances: VarianceItem[];
  onResolveVariance: (varianceId: string, action: 'approve-transfer' | 'approve-custodian' | 'mark-missing' | 'dismiss', notes?: string) => void;
}

export default function VarianceQueueView({ variances, onResolveVariance }: VarianceQueueViewProps) {
  const [selectedVarianceId, setSelectedVarianceId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showFinishedAlert, setShowFinishedAlert] = useState(false);

  const activeVariances = variances.filter(v => !v.resolved);
  const resolvedVariances = variances.filter(v => v.resolved);

  const handleApplyResolution = (varianceId: string, action: 'approve-transfer' | 'approve-custodian' | 'mark-missing' | 'dismiss') => {
    onResolveVariance(varianceId, action, resolutionNote);
    setSelectedVarianceId(null);
    setResolutionNote('');
    setShowFinishedAlert(true);
    setTimeout(() => setShowFinishedAlert(false), 2500);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      default: return 'bg-zinc-50 text-zinc-500';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-lg font-medium text-zinc-900 font-sans tracking-tight">
          Physical Discrepancy & Variance Queue ({activeVariances.length})
        </h2>
        <p className="text-xs text-zinc-500 max-w-2xl mt-0.5">
          These assets flagged discrepancies during active scans. Under AssetCues protocols, they require administrative settlement (reconciliation actions) to realign corporate registry values with physical reality.
        </p>
      </div>

      {showFinishedAlert && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-800 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="text-emerald-600" size={16} />
          <span>Variance settled successfully! Outstanding ledger books updated permanently in state.</span>
        </motion.div>
      )}

      {/* Main Grid: Active Variances vs Resolution panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Active Variance List */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          {activeVariances.map(item => (
            <div 
              key={item.id} 
              id={`variance-item-${item.id}`}
              onClick={() => setSelectedVarianceId(item.id)}
              className={`border rounded-xl p-5 cursor-pointer transition-all bg-white shadow-3xs hover:border-zinc-350 ${
                selectedVarianceId === item.id ? 'border-zinc-900 ring-1 ring-zinc-900 shadow-sm' : 'border-zinc-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-50 pb-3 mb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-900 font-bold text-xs font-mono square bg-zinc-100 px-2 py-0.5 rounded-sm">{item.id}</span>
                    <span className="text-zinc-900 font-medium text-sm">{item.assetName}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-3">
                    <span>Asset Code: <span className="font-semibold text-zinc-700">{item.assetId}</span></span>
                    <span className="flex items-center gap-0.5"><Clock size={11} /> {new Date(item.scannedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(item.severity)}`}>
                    {item.severity} SEVERITY
                  </span>
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2 py-0.5">
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Physical Comparison boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                
                {/* Book value block */}
                <div className="bg-zinc-50/50 p-3 rounded-lg border border-zinc-100 space-y-2">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 block uppercase">
                    REGISTRY LEDGER BOOKS SAY
                  </span>
                  
                  <div className="space-y-1 text-zinc-700">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-zinc-405 shrink-0" />
                      <span className="truncate">Loc: {item.bookValue.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={11} className="text-zinc-405 shrink-0" />
                      <span className="truncate">Holder: {item.bookValue.custodian}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[10px] font-mono">Status:</span>
                      <span className="bg-zinc-100 text-zinc-600 px-1 py-0.2 rounded-md font-mono text-[9px]">
                        {item.bookValue.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scanned Reality block */}
                <div className="bg-rose-50/25 p-3 rounded-lg border border-rose-100 space-y-2">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-rose-500 block uppercase">
                    PHYSICAL SCANS OBSERVED
                  </span>
                  
                  <div className="space-y-1 text-rose-955 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-rose-400 shrink-0" />
                      <span className="truncate">Loc: {item.scannedValue.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={11} className="text-rose-400 shrink-0" />
                      <span className="truncate">Holder: {item.scannedValue.custodian}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[10px] text-zinc-500 font-mono">Status:</span>
                      <span className="bg-rose-100 text-rose-800 px-1 py-0.2 rounded-md font-mono text-[9px]">
                        {item.scannedValue.status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Audit scan reference description */}
              <p className="text-xs text-zinc-500 italic px-2 border-l border-zinc-200">
                {item.notes}
              </p>

              {/* Quick resolution bar visible on selection */}
              {selectedVarianceId === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t border-zinc-150 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-xs font-mono font-bold text-zinc-500">
                    SETTLEMENT METHOD & COMMENT notes
                  </label>
                  <input
                    id={`input-resolve-note-${item.id}`}
                    type="text"
                    placeholder="Provide compliance approval notation reference (e.g. PO #2931 sign)..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-hidden"
                  />

                  <div className="flex flex-wrap gap-2 text-xs">
                    
                    {/* Approve transfer action */}
                    {item.type === 'Location Mismatch' && (
                      <button
                        id={`btn-action-transfer-${item.id}`}
                        onClick={() => handleApplyResolution(item.id, 'approve-transfer')}
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold rounded-lg px-2 text-center"
                      >
                        Approve Corporate Transfer
                      </button>
                    )}

                    {/* Approve custodial reassignment action */}
                    {item.type === 'Custodian Mismatch' && (
                      <button
                        id={`btn-action-custody-${item.id}`}
                        onClick={() => handleApplyResolution(item.id, 'approve-custodian')}
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold rounded-lg px-2 text-center"
                      >
                        Approve Custody Handover
                      </button>
                    )}

                    {/* Mark Missing Action */}
                    <button
                      id={`btn-action-missing-${item.id}`}
                      onClick={() => handleApplyResolution(item.id, 'mark-missing')}
                      className="py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-mono rounded-lg px-3 text-center text-xs"
                    >
                      Declare Asset Missing
                    </button>

                    {/* Dismiss variant */}
                    <button
                      id={`btn-action-dismiss-${item.id}`}
                      onClick={() => handleApplyResolution(item.id, 'dismiss')}
                      className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono rounded-lg px-3 text-center text-xs"
                    >
                      Ignore (Dismiss Check)
                    </button>

                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {activeVariances.length === 0 && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="text-emerald-500" size={24} />
              </div>
              <h4 className="font-bold text-zinc-900">Variance Queue Settle Free</h4>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                All physical audit scans align precisely with database ledgers. There are no pending inconsistencies to reconcile!
              </p>
            </div>
          )}
        </div>

        {/* Right Audit/Compliance Sidebar explanation */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-mono font-bold text-emerald-400 tracking-wider">RECONCILIATION POLICY ENGINE</h4>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Under corporate asset governance guidelines, discrepancies found in physical location can trigger an audit flag. Admin must reconcile them using one of these authorized actions:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Shuffle className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <span className="font-mono text-white block">Approve Corporate Transfer</span>
                  <span className="text-[11px] text-zinc-400">
                    Schedules internal paperwork and corrects the Book Location to match where the scanner found the hardware.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <span className="font-mono text-white block">Declare Asset Missing</span>
                  <span className="text-[11px] text-zinc-400">
                    Immediately flags status as 'Missing' in registers. Locks MAC address networking access and informs corporate security.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="text-zinc-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <span className="font-mono text-white block">Ignore / Dismiss Check</span>
                  <span className="text-[11px] text-zinc-400">
                    Acknowledges discrepancy but dismisses verification mismatch because of temporary checkout or authorized project travel.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settle Logs section */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-mono font-bold text-zinc-500 tracking-wider uppercase mb-3">
              RECONCILED HISTORY LOG ({resolvedVariances.length})
            </h4>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {resolvedVariances.map(item => (
                <div key={item.id} className="border-b border-zinc-100 pb-2.5 last:border-b-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-zinc-900">{item.id}</span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-100 uppercase">
                      Resolved
                    </span>
                  </div>
                  <p className="text-xs text-zinc-800 font-semibold truncate">{item.assetName}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Type: <span className="font-medium text-zinc-700">{item.type}</span> | Note: <span className="italic">"{item.notes || 'Reconciled manually'}"</span>
                  </p>
                </div>
              ))}
              {resolvedVariances.length === 0 && (
                <div className="text-center py-6 text-[11px] text-zinc-400 italic">
                  No resolved logs recorded this session.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Tag, 
  QrCode, 
  Barcode, 
  Radio, 
  Zap, 
  Printer, 
  AlertCircle,
  HelpCircle,
  XCircle,
  Cpu
} from 'lucide-react';
import { TaggingTask, Asset, TagType } from '../types';

interface TaggingDeskViewProps {
  tasks: TaggingTask[];
  assets: Asset[];
  onCompleteTask: (taskId: string, assetId: string, tagType: TagType) => void;
}

export default function TaggingDeskView({ tasks, assets, onCompleteTask }: TaggingDeskViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [commissioningTagType, setCommissioningTagType] = useState<TagType>('QR');
  
  // Simulated loading states
  const [isCommissioning, setIsCommissioning] = useState(false);
  const [completeTagInfo, setCompleteTagInfo] = useState<{ code: string; name: string } | null>(null);

  // Load selected task details
  const currentTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const handleCommissionTagSubmit = () => {
    if (!currentTask) return;

    setIsCommissioning(true);
    setCompleteTagInfo(null);

    // Simulate encoder/printer communication over 2 seconds
    setTimeout(() => {
      const generatedTagCode = `${commissioningTagType}-${currentTask.assetName.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      onCompleteTask(currentTask.id, currentTask.assetId, commissioningTagType);
      
      setCompleteTagInfo({
        code: generatedTagCode,
        name: currentTask.assetName
      });
      setIsCommissioning(false);
      setSelectedTaskId(null); // Deselect
    }, 2000);
  };

  const getPriorityColor = (lvl: string) => {
    switch (lvl) {
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Urgent': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Scope definition column */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Commissioning Queue Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="border-b border-zinc-100 pb-3 mb-4">
            <h3 className="text-base font-medium text-zinc-900 font-sans">Tagging & Enrollment Queue ({tasks.filter(t => t.status !== 'Tag Verified').length})</h3>
            <p className="text-xs text-zinc-500">Newly received corporate assets that require physical stickers/epcs before allocation</p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {tasks.filter(t => t.status !== 'Tag Verified').map(task => (
              <div
                key={task.id}
                id={`task-queue-item-${task.id}`}
                onClick={() => setSelectedTaskId(task.id)}
                className={`border rounded-lg p-3.5 cursor-pointer transition-all ${
                  selectedTaskId === task.id ? 'border-zinc-900 bg-zinc-50/50 shadow-xs' : 'border-zinc-150 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-zinc-500">{task.id}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md border font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority} Prio
                  </span>
                </div>
                
                <h4 className="font-semibold text-zinc-900 text-xs truncate">{task.assetName}</h4>
                
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-1 pt-1.5 border-t border-zinc-50">
                  <span>ID: {task.assetId}</span>
                  <span className="text-[10px] text-zinc-400">Req: {task.requestedAt}</span>
                </div>
              </div>
            ))}

            {tasks.filter(t => t.status !== 'Tag Verified').length === 0 && (
              <div className="text-center py-10 space-y-2">
                <CheckCircle className="text-emerald-500 mx-auto" size={32} />
                <h5 className="font-semibold text-zinc-900 text-sm">Enrollment Complete</h5>
                <p className="text-zinc-500 text-xs max-w-xs mx-auto">
                  No pending corporate assets are awaiting physical tags. Excellent job tracking hardware tags!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column - Printer simulator & encoder */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Zebra / Zebra RF encoder simulator box */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-base font-medium text-zinc-900 font-sans">Smart RFID/BLE Tag Encoder Drawer</h3>
            <p className="text-xs text-zinc-400">Encode physical serial values on security tags or print barcodes</p>
          </div>

          {currentTask ? (
            <div className="space-y-5">
              
              {/* Task Details panel */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-2">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  ACTIVE COMMISSION TARGET
                </span>
                <div className="font-semibold text-sm text-zinc-900">{currentTask.assetName}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-650 font-mono">
                  <span>Register Asset ID: <span className="text-zinc-900 font-bold">{currentTask.assetId}</span></span>
                  <span>Category: {currentTask.category}</span>
                </div>
              </div>

              {/* Tag Standard configuration selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 font-mono">
                  SELECT PHYSICAL SMART TAG MECHANISM
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* QR option */}
                  <label className={`border-2 rounded-xl p-3.5 flex items-start gap-2 cursor-pointer select-none transition-all ${
                    commissioningTagType === 'QR' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tagTypeSelect" 
                      value="QR" 
                      checked={commissioningTagType === 'QR'} 
                      onChange={() => setCommissioningTagType('QR')}
                      className="mt-0.5 text-zinc-900 focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900">
                        <QrCode size={14} /> QR QR-Code Tag
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">2D matrix physical stamp labels readable with any optical device camera.</p>
                    </div>
                  </label>

                  {/* Barcode option */}
                  <label className={`border-2 rounded-xl p-3.5 flex items-start gap-2 cursor-pointer select-none transition-all ${
                    commissioningTagType === 'Barcode' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tagTypeSelect" 
                      value="Barcode" 
                      checked={commissioningTagType === 'Barcode'} 
                      onChange={() => setCommissioningTagType('Barcode')}
                      className="mt-0.5 text-zinc-900 focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900">
                        <Barcode size={14} /> 1D Barcode Tag
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Linear industrial barcode sticker printing for generic warehouse laser scanner guns.</p>
                    </div>
                  </label>

                  {/* RFID option */}
                  <label className={`border-2 rounded-xl p-3.5 flex items-start gap-2 cursor-pointer select-none transition-all ${
                    commissioningTagType === 'RFID' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tagTypeSelect" 
                      value="RFID" 
                      checked={commissioningTagType === 'RFID'} 
                      onChange={() => setCommissioningTagType('RFID')}
                      className="mt-0.5 text-zinc-900 focus:ring-0 cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900">
                        <Radio size={14} /> Passive RFID EPC
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Gen2 passive RFID radio tag sticker reading without visual line of sight.</p>
                    </div>
                  </label>

                  {/* BLE Option */}
                  <label className={`border-2 rounded-xl p-3.5 flex items-start gap-2 cursor-pointer select-none transition-all ${
                    commissioningTagType === 'BLE' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="tagTypeSelect" 
                      value="BLE" 
                      checked={commissioningTagType === 'BLE'} 
                      onChange={() => setCommissioningTagType('BLE')}
                      className="mt-0.5 text-zinc-900 focus:ring-0"
                    />
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900">
                        <Radio size={14} /> BLE Smart Beacon
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Active, battery-powered Bluetooth tag beacons supporting automatic zone triangulation audits.</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Commissioning trigger button and loader */}
              <div className="pt-3 border-t border-zinc-155">
                {isCommissioning ? (
                  <div className="bg-zinc-950 text-white rounded-xl p-6.5 text-center space-y-4">
                    <div className="relative w-12 h-12 mx-auto">
                      <Cpu size={40} className="text-emerald-500 animate-spin mx-auto" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-white font-mono uppercase tracking-wide">CONNECTING ELECTRONIC TAG PRINTER...</h5>
                      <p className="text-[11px] text-zinc-400 font-sans">
                        Mapping memory bank blocks, compiling QR vectors, and signaling RFID antenna. Please wait.
                      </p>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1 max-w-sm mx-auto overflow-hidden">
                      <div className="bg-emerald-500 h-1 rounded-full animate-infinite-loading"></div>
                    </div>
                  </div>
                ) : (
                  <button
                    id="btn-trigger-commission"
                    onClick={handleCommissionTagSubmit}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Zap size={14} className="text-amber-400" /> Print Sticker & Enroll Device Tag
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 p-10 text-center text-zinc-400 font-mono text-xs flex flex-col justify-center items-center h-48">
              <span>{"< Select an outstanding asset task from queue list to begin physical commissioning >"}</span>
            </div>
          )}

          {/* Success receipt of tag print */}
          <AnimatePresence>
            {completeTagInfo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-50/55 border border-emerald-200 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle size={15} />
                  <span>COMMISSIONING & REGISTRATION CONFIRMED</span>
                </div>
                
                <p className="text-xs text-zinc-700">
                  Tag printed successfully. Memory banks encoded with values of asset.
                </p>

                <div className="bg-white border text-zinc-800 rounded-lg p-3 flex items-center gap-3 max-w-sm">
                  <Printer size={20} className="text-zinc-600" />
                  <div className="text-xs font-mono">
                    <div className="text-[10px] text-zinc-400 block uppercase font-bold text-zinc-500">Tag Sequence Label</div>
                    <div className="font-bold text-zinc-900">{completeTagInfo.code}</div>
                    <div className="text-[10px] text-zinc-500">{completeTagInfo.name}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}

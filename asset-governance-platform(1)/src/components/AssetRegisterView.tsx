/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Tag, 
  Barcode, 
  Radio, 
  Check, 
  X, 
  DollarSign, 
  User, 
  MapPin, 
  Briefcase,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, TagType } from '../types';

interface AssetRegisterViewProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onSimulateScan: (assetCode: string) => void;
}

export default function AssetRegisterView({ 
  assets, 
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset, 
  onSimulateScan 
}: AssetRegisterViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tagStatusFilter, setTagStatusFilter] = useState<string>('All');
  
  // Modals / Details side drawer
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [isTagPrintModalOpen, setIsTagPrintModalOpen] = useState(false);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id' | 'tagStatus' | 'lastAuditDate'>>({
    name: '',
    category: 'Compute',
    status: 'In Storage',
    tagType: 'QR',
    tagCode: '',
    serialNumber: '',
    cost: 1000,
    purchaseDate: new Date().toISOString().split('T')[0],
    custodian: 'Unassigned',
    department: 'Operations',
    location: 'HQ Building A - Floor 1 (IT Storage)',
    notes: ''
  });

  // Filter computation
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tagCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesTagStatus = tagStatusFilter === 'All' || asset.tagStatus === tagStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesTagStatus;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serialNumber) {
      alert('Please fill out Name and Serial Number to commit!');
      return;
    }

    const nextIdNumber = assets.length + 1;
    const formattedId = `AST-2026-${nextIdNumber.toString().padStart(3, '0')}`;
    const generatedTagCode = `${newAsset.tagType}-${newAsset.name.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const assetToSubmit: Asset = {
      ...newAsset,
      id: formattedId,
      tagCode: newAsset.tagCode || generatedTagCode,
      tagStatus: 'Pending', // Awaiting commissioning!
    };

    onAddAsset(assetToSubmit);
    setIsNewAssetModalOpen(false);
    
    // Reset form
    setNewAsset({
      name: '',
      category: 'Compute',
      status: 'In Storage',
      tagType: 'QR',
      tagCode: '',
      serialNumber: '',
      cost: 1200,
      purchaseDate: new Date().toISOString().split('T')[0],
      custodian: 'Unassigned',
      department: 'Operations',
      location: 'HQ Building A - Floor 1 (IT Storage)',
      notes: ''
    });
  };

  const getTagIcon = (type: TagType) => {
    switch (type) {
      case 'QR': return <QrCode size={14} className="text-zinc-600" />;
      case 'Barcode': return <Barcode size={14} className="text-zinc-600" />;
      case 'RFID': return <Radio size={14} className="text-blue-600 animate-pulse" />;
      case 'BLE': return <Radio size={14} className="text-purple-600 animate-pulse" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Onboard Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-900 font-sans tracking-tight">
          Master Asset Register ({filteredAssets.length})
        </h2>
        
        <button
          id="btn-trigger-new-asset"
          onClick={() => setIsNewAssetModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-mono font-medium tracking-tight flex items-center justify-center gap-1.5 self-start md:self-auto shadow-xs"
        >
          <Plus size={14} /> Onboard New Physical Asset
        </button>
      </div>

      {/* Advanced Filter Rail */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={16} />
            <input 
              id="input-asset-search"
              type="text"
              placeholder="Search by Asset ID, Descr, Holder, Serial/EPC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Category SELECT filter */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-100 rounded-lg px-2.5 py-1.5 text-zinc-600 border border-zinc-200">
              <Filter size={12} />
              <span className="font-mono">Category:</span>
              <select
                id="select-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent font-medium border-none focus:outline-hidden text-zinc-800 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Compute">Compute</option>
                <option value="Mobile">Mobile</option>
                <option value="Network">Network</option>
                <option value="Furniture">Furniture</option>
                <option value="Facility">Facility</option>
                <option value="Server">Server</option>
              </select>
            </div>

            {/* Status select filter */}
            <div className="flex items-center gap-1.5 bg-zinc-100 rounded-lg px-2.5 py-1.5 text-zinc-600 border border-zinc-200">
              <Filter size={12} />
              <span className="font-mono">Status:</span>
              <select
                id="select-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium border-none focus:outline-hidden text-zinc-800 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Allocated">Allocated</option>
                <option value="In Storage">In Storage</option>
                <option value="In Transit">In Transit</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Tag state filter */}
            <div className="flex items-center gap-1.5 bg-zinc-100 rounded-lg px-2.5 py-1.5 text-zinc-600 border border-zinc-200">
              <Filter size={12} />
              <span className="font-mono">Tag Status:</span>
              <select
                id="select-tag-filter"
                value={tagStatusFilter}
                onChange={(e) => setTagStatusFilter(e.target.value)}
                className="bg-transparent font-medium border-none focus:outline-hidden text-zinc-800 cursor-pointer"
              >
                <option value="All">All Tags</option>
                <option value="Active">Active Tag</option>
                <option value="Commissioned">Commissioned</option>
                <option value="Pending">Pending Tag</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Grid representing the Books */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-250 bg-zinc-50 text-xs font-mono text-zinc-500 tracking-wider">
                <th className="py-3 px-4 font-semibold">Asset ID</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Operational Status</th>
                <th className="py-3 px-4 font-semibold">Tag ID & Type</th>
                <th className="py-3 px-4 font-semibold">Current Custodian</th>
                <th className="py-3 px-4 font-semibold">Location Coord</th>
                <th className="py-3 px-4 font-semibold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 text-sm">
              {filteredAssets.map(asset => (
                <tr 
                  key={asset.id} 
                  id={`asset-row-${asset.id}`}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono text-zinc-950 font-medium whitespace-nowrap">
                    {asset.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">
                      {asset.name}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      Category: {asset.category} | S/N: {asset.serialNumber}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      asset.status === 'Allocated' ? 'bg-emerald-50 text-emerald-800' :
                      asset.status === 'In Storage' ? 'bg-zinc-100 text-zinc-800' :
                      asset.status === 'In Transit' ? 'bg-blue-50 text-blue-800' :
                      asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-805' :
                      'bg-rose-50 text-rose-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        asset.status === 'Allocated' ? 'bg-emerald-500' :
                        asset.status === 'In Storage' ? 'bg-zinc-400' :
                        asset.status === 'In Transit' ? 'bg-blue-500' :
                        asset.status === 'Maintenance' ? 'bg-amber-505' :
                        'bg-rose-500'
                      }`} />
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTagIcon(asset.tagType)}
                      <span className="font-mono text-zinc-800 text-xs">{asset.tagCode}</span>
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono leading-none rounded-md px-1.5 py-0.5 border ${
                        asset.tagStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        asset.tagStatus === 'Commissioned' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {asset.tagStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-zinc-800">
                      <User size={13} className="text-zinc-400" />
                      <span>{asset.custodian}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{asset.department}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-zinc-700 text-xs">
                      <MapPin size={13} className="text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[160px]">{asset.location}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-zinc-900 font-medium">
                    ${asset.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-mono text-xs">
                    No corporate assets match current filtering combinations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel Drawer for Asset Details & Governance Activities */}
      <AnimatePresence>
        {selectedAsset && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide Drawer panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white border-l border-zinc-200 z-50 shadow-2xl p-6 flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 tracking-wider">ASSET RECORD DETAILS</span>
                  <h3 id="drawer-asset-id" className="text-lg font-mono font-bold text-zinc-900">{selectedAsset.id}</h3>
                </div>
                <button 
                  id="btn-close-drawer"
                  onClick={() => setSelectedAsset(null)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-650"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="space-y-6 flex-1 text-sm text-zinc-800">
                {/* Product header box */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
                  <div className="font-semibold text-base text-zinc-900">{selectedAsset.name}</div>
                  <div className="text-xs text-zinc-500 mt-1 font-mono flex items-center gap-3">
                    <span>S/N: {selectedAsset.serialNumber}</span>
                    <span>Class: {selectedAsset.category}</span>
                  </div>
                </div>

                {/* Tracking & Governance Tag details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono tracking-wider uppercase font-semibold text-zinc-500">Governance & physical tagging</h4>
                  <div className="grid grid-cols-2 gap-3 bg-zinc-50/50 p-3 rounded-lg border border-zinc-100">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">Tag Mechanism</span>
                      <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                        {getTagIcon(selectedAsset.tagType)}
                        {selectedAsset.tagType} Standard
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">Tag Code / EPC</span>
                      <span className="font-mono font-semibold text-xs mt-0.5 block">{selectedAsset.tagCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">Tagging Status</span>
                      <span className="font-semibold mt-0.5 block text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono inline-block ${
                          selectedAsset.tagStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                          selectedAsset.tagStatus === 'Commissioned' ? 'bg-amber-50 text-amber-750' :
                          'bg-zinc-100 text-zinc-650'
                        }`}>
                          {selectedAsset.tagStatus}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block">Last Verification</span>
                      <span className="font-semibold text-zinc-700 text-xs mt-0.5 block">
                        {selectedAsset.lastAuditDate ? `Checked ${selectedAsset.lastAuditDate}` : 'Never Scanned (Pending)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Allocation values */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono tracking-wider uppercase font-semibold text-zinc-500">Asset Assignment</h4>
                  <div className="space-y-2 border-l-2 border-zinc-200 pl-3">
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-zinc-500 text-xs font-mono">Custodian:</span>
                      <span className="col-span-2 font-medium">{selectedAsset.custodian}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-zinc-500 text-xs font-mono">Department:</span>
                      <span className="col-span-2 font-medium">{selectedAsset.department}</span>
                    </div>
                    <div className="grid grid-cols-3 py-1">
                      <span className="text-zinc-500 text-xs font-mono">Physical Loc:</span>
                      <span className="col-span-2 text-zinc-700 text-xs flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-zinc-400 shrink-0" />
                        {selectedAsset.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial stats */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono tracking-wider uppercase font-semibold text-zinc-500">Financial Ledger</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-zinc-100 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-400 font-mono block">Procurement Cost</span>
                      <span className="text-base font-mono font-bold text-zinc-900">${selectedAsset.cost.toLocaleString()}</span>
                    </div>
                    <div className="border border-zinc-100 rounded-lg p-2.5">
                      <span className="text-[10px] text-zinc-400 font-mono block">Onboarding Date</span>
                      <span className="text-xs font-mono font-semibold text-zinc-700 block mt-1">{selectedAsset.purchaseDate}</span>
                    </div>
                  </div>
                </div>

                {/* Operational notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono tracking-wider uppercase font-semibold text-zinc-500">Special Notes / Description</h4>
                  <p className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs text-zinc-650 leading-relaxed font-sans">
                    {selectedAsset.notes || 'No notes defined for this corporate asset record.'}
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-zinc-100 pt-5 space-y-2.5 mt-auto">
                <button
                  id={`btn-drawer-scan-simulate-${selectedAsset.id}`}
                  onClick={() => {
                    onSimulateScan(selectedAsset.id);
                    setSelectedAsset(null);
                  }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode size={15} /> Simulate Physical Verification Scan
                </button>
                
                <div className="flex gap-2">
                  <button
                    id="btn-drawer-print-tag"
                    onClick={() => setIsTagPrintModalOpen(true)}
                    className="flex-1 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium font-sans flex items-center justify-center gap-1.5"
                  >
                    <Tag size={13} /> View Tag Layout
                  </button>
                  <button
                    id={`btn-drawer-delete-${selectedAsset.id}`}
                    onClick={() => {
                      if (confirm('Delete asset from active ledger? This cannot be undone.')) {
                        onDeleteAsset(selectedAsset.id);
                        setSelectedAsset(null);
                      }
                    }}
                    className="py-1.5 px-3 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-medium"
                    title="Retire Asset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Corporate Asset Tag Printer Preview Modal */}
      <AnimatePresence>
        {isTagPrintModalOpen && selectedAsset && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-sm w-full rounded-xl overflow-hidden shadow-2xl p-5 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-mono font-semibold text-emerald-400">CORPORATE PHYSICAL REGISTER</span>
                <button 
                  id="btn-close-print-preview"
                  onClick={() => setIsTagPrintModalOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1 text-center">
                <p className="text-xs text-zinc-400">Simulating physical sticker rendering for asset:</p>
                <p className="font-mono text-sm font-bold text-white">{selectedAsset.id}</p>
              </div>

              {/* Physical Tag Graphic */}
              <div className="bg-white text-zinc-950 p-5 rounded-lg border-2 border-zinc-300 space-y-4 max-w-xs mx-auto shadow-inner select-none font-mono">
                {/* Brand header */}
                <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                  <span className="text-[9px] uppercase font-bold tracking-tighter">ASSETCUES GOVERNANCE</span>
                  <span className="text-[8px] bg-zinc-950 text-white px-1 py-0.2 rounded-sm font-sans">verified</span>
                </div>

                {/* Substantive QR/Barcode representation */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-18 h-18 bg-zinc-100 border border-zinc-300 rounded-md p-1.5 flex flex-col justify-between shrink-0">
                    {/* Simulated vector QR blocks */}
                    <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                      {[1,1,0,1, 1,0,1,0, 0,1,1,1, 1,1,1,1].map((block, idx) => (
                        <div 
                          key={idx} 
                          className={`w-full h-full ${block ? 'bg-zinc-900' : 'bg-transparent'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="text-[10px] font-bold truncate">{selectedAsset.name}</div>
                    <div className="text-[8px] text-zinc-500 uppercase">S/N: {selectedAsset.serialNumber}</div>
                    <div className="text-[8px] text-zinc-500 uppercase">Dept: {selectedAsset.department}</div>
                    <div className="text-[10px] font-bold text-zinc-900 leading-none pt-1">
                      {selectedAsset.tagCode}
                    </div>
                  </div>
                </div>

                {/* Technical barcode element if tagType is Barcode */}
                {selectedAsset.tagType === 'Barcode' && (
                  <div className="space-y-1 pt-1 border-t border-zinc-200">
                    <div className="flex gap-0.5 h-6 w-full items-stretch justify-center bg-zinc-50">
                      {[1,2,1,3,1,1,2,1,2,3,1,1,2,1,1,3,1,2,1,1].map((w, idx) => (
                        <div 
                          key={idx} 
                          className="bg-black shrink-0" 
                          style={{ width: `${w * 2}px` }} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[7px] text-center text-zinc-400 leading-none pt-2 uppercase">
                  Property of Corporate HQ. Do not remove.
                </div>
              </div>

              {/* Print controller buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  id="btn-dialog-mock-print"
                  onClick={() => {
                    alert('Label print stream sent successfully in simulator!');
                    setIsTagPrintModalOpen(false);
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold rounded-lg"
                >
                  Print Sticker
                </button>
                <button
                  onClick={() => setIsTagPrintModalOpen(false)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding New Asset Modal Dialog */}
      <AnimatePresence>
        {isNewAssetModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-zinc-200 text-zinc-900 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 font-sans">Onboard Physical Corporate Asset</h3>
                  <p className="text-xs text-zinc-400">Initiates the tracking record inside the master asset ledger</p>
                </div>
                <button 
                  id="btn-close-new-asset-modal"
                  onClick={() => setIsNewAssetModalOpen(false)}
                  className="p-1.5 hover:bg-zinc-150 rounded-lg text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-sans text-zinc-700">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-zinc-500 font-mono">Asset Name *</label>
                    <input 
                      id="input-new-asset-name"
                      type="text"
                      required
                      placeholder="e.g. Cisco Catalyst switch, HP Laser printer, standing desk"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Category Field */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Classification Category</label>
                    <select
                      id="input-new-asset-category"
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as AssetCategory })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm text-zinc-900 focus:outline-hidden"
                    >
                      <option value="Compute">Compute</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Network">Network</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Facility">Facility</option>
                      <option value="Server">Server</option>
                    </select>
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Serial Number / Asset Tag *</label>
                    <input 
                      id="input-new-asset-serial"
                      type="text"
                      required
                      placeholder="e.g. SN-K981AL09X"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Tag Standard */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Verification Tag Standard</label>
                    <select
                      id="input-new-asset-tagtype"
                      value={newAsset.tagType}
                      onChange={(e) => setNewAsset({ ...newAsset, tagType: e.target.value as TagType })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm text-zinc-900 focus:outline-hidden"
                    >
                      <option value="QR">QR Code Physical Stamp</option>
                      <option value="Barcode">1D Linear Barcode Tag</option>
                      <option value="RFID">Passive Gen2 RFID Sticker</option>
                      <option value="BLE">Active Bluetooth Low Energy Beacon</option>
                    </select>
                  </div>

                  {/* Asset Cost */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Acquisition Cost (USD)</label>
                    <input 
                      id="input-new-asset-cost"
                      type="number"
                      placeholder="1200"
                      value={newAsset.cost}
                      onChange={(e) => setNewAsset({ ...newAsset, cost: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Custodian */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Initial Custodian Holder</label>
                    <input 
                      id="input-new-asset-custodian"
                      type="text"
                      placeholder="e.g. Helen Patel, alex Rivera"
                      value={newAsset.custodian}
                      onChange={(e) => setNewAsset({ ...newAsset, custodian: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="block text-zinc-500 font-mono">Corporate Department</label>
                    <input 
                      id="input-new-asset-dept"
                      type="text"
                      placeholder="e.g. IT, Finance, Operations"
                      value={newAsset.department}
                      onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Target coordinates / building location */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-zinc-500 font-mono">Registered Physical Coordinates / Location</label>
                    <input 
                      id="input-new-asset-loc"
                      type="text"
                      placeholder="e.g. Bldg B - Floor 5 (Office 512)"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Notes */}
                  <div className="col-span-2 space-y-1">
                    <label className="block text-zinc-500 font-mono">Governance Notes / Procurement ID</label>
                    <textarea 
                      id="input-new-asset-notes"
                      rows={2}
                      placeholder="Identify procurement PO reference or specific networking subnets..."
                      value={newAsset.notes}
                      onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                </div>

                {/* Submitting buttons inside dialog */}
                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2 text-xs font-mono font-medium">
                  <button
                    type="button"
                    onClick={() => setIsNewAssetModalOpen(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-new-asset"
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg"
                  >
                    Commit to Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

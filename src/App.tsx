/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Database, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Settings, 
  HelpCircle,
  Clock,
  Menu,
  X,
  RefreshCw,
  TrendingDown
} from 'lucide-react';

import { Asset, AuditSession, VarianceItem, TaggingTask, TagType } from './types';
import { 
  INITIAL_ASSETS, 
  INITIAL_AUDIT_SESSIONS, 
  INITIAL_VARIANCES, 
  INITIAL_TAGGING_TASKS 
} from './mockData';

// Subcomponents
import DashboardView from './components/DashboardView';
import AssetRegisterView from './components/AssetRegisterView';
import VerificationSimulator from './components/VerificationSimulator';
import VarianceQueueView from './components/VarianceQueueView';
import TaggingDeskView from './components/TaggingDeskView';

export default function App() {
  // Navigation active tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'verification' | 'variances' | 'tagging'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core platform States (backed by analytical Local Storage persistence)
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sessions, setSessions] = useState<AuditSession[]>([]);
  const [variances, setVariances] = useState<VarianceItem[]>([]);
  const [tasks, setTasks] = useState<TaggingTask[]>([]);

  // Simulation parameters
  const [fastScanCodeForSimulator, setFastScanCodeForSimulator] = useState<string | null>(null);

  // 1. Load Data on Mount (safe local storage loading)
  useEffect(() => {
    try {
      const storedAssets = localStorage.getItem('assetcues_assets');
      const storedSessions = localStorage.getItem('assetcues_sessions');
      const storedVariances = localStorage.getItem('assetcues_variances');
      const storedTasks = localStorage.getItem('assetcues_tasks');

      if (storedAssets) setAssets(JSON.parse(storedAssets));
      else {
        setAssets(INITIAL_ASSETS);
        localStorage.setItem('assetcues_assets', JSON.stringify(INITIAL_ASSETS));
      }

      if (storedSessions) setSessions(JSON.parse(storedSessions));
      else {
        setSessions(INITIAL_AUDIT_SESSIONS);
        localStorage.setItem('assetcues_sessions', JSON.stringify(INITIAL_AUDIT_SESSIONS));
      }

      if (storedVariances) setVariances(JSON.parse(storedVariances));
      else {
        setVariances(INITIAL_VARIANCES);
        localStorage.setItem('assetcues_variances', JSON.stringify(INITIAL_VARIANCES));
      }

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      else {
        setTasks(INITIAL_TAGGING_TASKS);
        localStorage.setItem('assetcues_tasks', JSON.stringify(INITIAL_TAGGING_TASKS));
      }
    } catch (e) {
      console.error('Failed to initialize mock data from localStorage:', e);
      // Fallback
      setAssets(INITIAL_ASSETS);
      setSessions(INITIAL_AUDIT_SESSIONS);
      setVariances(INITIAL_VARIANCES);
      setTasks(INITIAL_TAGGING_TASKS);
    }
  }, []);

  // Sync state to localstorage whenever state references are modified
  const updateAssetsState = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('assetcues_assets', JSON.stringify(newAssets));
  };

  const updateSessionsState = (newSessions: AuditSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('assetcues_sessions', JSON.stringify(newSessions));
  };

  const updateVariancesState = (newVariances: VarianceItem[]) => {
    setVariances(newVariances);
    localStorage.setItem('assetcues_variances', JSON.stringify(newVariances));
  };

  const updateTasksState = (newTasks: TaggingTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('assetcues_tasks', JSON.stringify(newTasks));
  };

  // State mutation actions
  const handleAddAsset = (asset: Asset) => {
    const nextAssets = [asset, ...assets];
    updateAssetsState(nextAssets);

    // Create a new tagging task if tagStatus is Pending
    if (asset.tagStatus === 'Pending') {
      const nextTask: TaggingTask = {
        id: `TSK-2026-${Math.floor(600 + Math.random() * 300)}`,
        assetId: asset.id,
        assetName: asset.name,
        category: asset.category,
        requestedAt: new Date().toISOString().split('T')[0],
        priority: 'Routine',
        status: 'Pending'
      };
      updateTasksState([nextTask, ...tasks]);
    }
  };

  const handleUpdateAsset = (updated: Asset) => {
    const nextAssets = assets.map(a => a.id === updated.id ? updated : a);
    updateAssetsState(nextAssets);
  };

  const handleDeleteAsset = (id: string) => {
    const nextAssets = assets.filter(a => a.id !== id);
    updateAssetsState(nextAssets);
    // Also clear outstanding tasks and variances related to it
    updateTasksState(tasks.filter(t => t.assetId !== id));
    updateVariancesState(variances.filter(v => v.assetId !== id));
  };

  const handleUpdateAssetAudit = (assetId: string, lastAuditDate: string) => {
    const nextAssets = assets.map(a => 
      a.id === assetId 
        ? { ...a, lastAuditDate, tagStatus: 'Active' as const } 
        : a
    );
    updateAssetsState(nextAssets);
  };

  const handleIncrementSessionScan = (sessionId: string) => {
    const nextSessions = sessions.map(s => 
      s.id === sessionId 
        ? { ...s, scannedCount: Math.min(s.scannedCount + 1, s.totalCount) } 
        : s
    );
    updateSessionsState(nextSessions);
  };

  const handleAddVariance = (variance: VarianceItem) => {
    // Avoid duplicates in active queue for same asset mismatch
    const existingIndex = variances.findIndex(v => v.assetId === variance.assetId && !v.resolved);
    if (existingIndex > -1) {
      const replaced = [...variances];
      replaced[existingIndex] = variance;
      updateVariancesState(replaced);
    } else {
      updateVariancesState([variance, ...variances]);
    }
  };

  // Settle & Reconciliation Engine Decisions matching AssetCues rules
  const handleResolveVariance = (
    varianceId: string, 
    action: 'approve-transfer' | 'approve-custodian' | 'mark-missing' | 'dismiss', 
    notes?: string
  ) => {
    const targetVariance = variances.find(v => v.id === varianceId);
    if (!targetVariance) return;

    // Update variance resolution state
    const nextVariances = variances.map(v => 
      v.id === varianceId 
        ? { ...v, resolved: true, notes: notes ? `${v.notes || ''} [Resolved Note: ${notes}]` : v.notes } 
        : v
    );
    updateVariancesState(nextVariances);

    // Apply outcome back into Master Register
    if (action === 'approve-transfer') {
      const nextAssets = assets.map(a => 
        a.id === targetVariance.assetId 
          ? { ...a, location: targetVariance.scannedValue.location, lastAuditDate: new Date().toISOString().split('T')[0] } 
          : a
      );
      updateAssetsState(nextAssets);
    } else if (action === 'approve-custodian') {
      const nextAssets = assets.map(a => 
        a.id === targetVariance.assetId 
          ? { ...a, custodian: targetVariance.scannedValue.custodian, lastAuditDate: new Date().toISOString().split('T')[0] } 
          : a
      );
      updateAssetsState(nextAssets);
    } else if (action === 'mark-missing') {
      const nextAssets = assets.map(a => 
        a.id === targetVariance.assetId 
          ? { ...a, status: 'Retired' as const, notes: `${a.notes || ''} [FLAGGED MISSING IN VERIFICATION RUN]` } 
          : a
      );
      updateAssetsState(nextAssets);
    }
  };

  // Complete a commissioning task (generates and verifies physical tag)
  const handleCompleteTask = (taskId: string, assetId: string, tagType: TagType) => {
    const generatedTagCode = `${tagType}-${assets.find(a => a.id === assetId)?.name.substring(0, 3).toUpperCase() || 'TAG'}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Complete the task in queue
    const nextTasks = tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: 'Tag Verified' as const } 
        : t
    );
    updateTasksState(nextTasks);

    // Commission tag variables on asset ledger
    const nextAssets = assets.map(a => 
      a.id === assetId 
        ? { ...a, tagStatus: 'Active' as const, tagType, tagCode: generatedTagCode } 
        : a
    );
    updateAssetsState(nextAssets);
  };

  // Direct trigger simulator shorthand link
  const handleDirectScanSimulate = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setFastScanCodeForSimulator(asset.tagCode);
      setActiveTab('verification');
    }
  };

  // Factory reset mock data easily
  const handleRestoreConfigurationData = () => {
    if (confirm('Re-initialize simulator to default AssetCues state? All current changes will run custom reset.')) {
      setAssets(INITIAL_ASSETS);
      setSessions(INITIAL_AUDIT_SESSIONS);
      setVariances(INITIAL_VARIANCES);
      setTasks(INITIAL_TAGGING_TASKS);
      localStorage.setItem('assetcues_assets', JSON.stringify(INITIAL_ASSETS));
      localStorage.setItem('assetcues_sessions', JSON.stringify(INITIAL_AUDIT_SESSIONS));
      localStorage.setItem('assetcues_variances', JSON.stringify(INITIAL_VARIANCES));
      localStorage.setItem('assetcues_tasks', JSON.stringify(INITIAL_TAGGING_TASKS));
      setActiveTab('dashboard');
    }
  };

  // Header active navigation rail selectors helper
  const tabs = [
    { id: 'dashboard', name: 'Operational Dashboard', icon: Database },
    { id: 'register', name: 'Master registers Ledger', icon: FileText },
    { id: 'verification', name: 'Physical verification Run', icon: QrCode },
    { id: 'variances', name: 'Variance Reconciliation', icon: AlertTriangle, count: variances.filter(v => !v.resolved).length },
    { id: 'tagging', name: 'Tag Print & Enrollment', icon: Settings, count: tasks.filter(t => t.status !== 'Tag Verified').length }
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-950">
      
      {/* Prime Workspace header */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-250 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              id="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 md:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500 rounded-lg text-zinc-950 flex shadow-2xs items-center justify-center">
                <Building2 size={16} />
              </span>
              <div>
                <h1 className="text-sm font-sans font-bold tracking-tight text-zinc-950 flex items-center gap-1">
                  AssetCues <span className="font-light text-zinc-400">Governance Console</span>
                </h1>
                <p className="text-[10px] text-zinc-400 font-mono tracking-tighter leading-none xl:block hidden">
                  ACTIVE CORPORATE SYSTEM • INTEGRITY SYNC: ONLINE
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Database indicator */}
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 border border-zinc-200 text-zinc-650 rounded-lg font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Client State Encoded ({assets.length} assets)</span>
            </span>

            {/* Quick configuration reset trigger */}
            <button
              id="btn-factory-reset"
              onClick={handleRestoreConfigurationData}
              className="py-1 px-2 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-mono text-[10px] rounded-md transition-colors flex items-center gap-1"
              title="Factory reset state indicators"
            >
              <RefreshCw size={10} /> Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Structural Layout Content Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-0">
        
        {/* Collapsible Left Navigation rail sidebar */}
        <nav className={`md:block md:w-64 border-r border-zinc-250 bg-white md:bg-transparent shrink-0 z-20 
          md:static fixed inset-y-0 left-0 transition-transform duration-300 transform md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 w-64 shadow-2xl bg-white pt-14' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-2 md:sticky md:top-18">
            <div className="pb-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono pl-3">
              Navigation menu
            </div>
            
            <div className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-nav-${tab["id"]}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono font-medium tracking-tight flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-zinc-900 text-white font-semibold' 
                        : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-100/70'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-zinc-400'} />
                      <span>{tab.name}</span>
                    </span>
                    {/* Badge counters */}
                    {'count' in tab && tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                        isActive ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Content View pane container */}
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  assets={assets}
                  sessions={sessions}
                  variances={variances}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                  }}
                />
              )}

              {activeTab === 'register' && (
                <AssetRegisterView 
                  assets={assets}
                  onAddAsset={handleAddAsset}
                  onUpdateAsset={handleUpdateAsset}
                  onDeleteAsset={handleDeleteAsset}
                  onSimulateScan={handleDirectScanSimulate}
                />
              )}

              {activeTab === 'verification' && (
                <VerificationSimulator 
                  assets={assets}
                  sessions={sessions}
                  onAddVariance={handleAddVariance}
                  onUpdateAssetAudit={handleUpdateAssetAudit}
                  onIncrementSessionScan={handleIncrementSessionScan}
                />
              )}

              {activeTab === 'variances' && (
                <VarianceQueueView 
                  variances={variances}
                  onResolveVariance={handleResolveVariance}
                />
              )}

              {activeTab === 'tagging' && (
                <TaggingDeskView 
                  tasks={tasks}
                  assets={assets}
                  onCompleteTask={handleCompleteTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Corporate branding footer */}
      <footer className="bg-white border-t border-zinc-200 py-3.5 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-zinc-400 font-mono gap-2">
          <div>
            © 2026 Corporate Hardware Register • Powered by AssetCues Workflows. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span>AUDIT STAND: ISO/IEC 27001 COMPLIANT</span>
            <span>SYSTEM VERSION: V1.9-STABLE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

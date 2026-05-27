/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  TrendingUp, 
  Calendar, 
  FileText,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Asset, AuditSession, VarianceItem } from '../types';

interface DashboardViewProps {
  assets: Asset[];
  sessions: AuditSession[];
  variances: VarianceItem[];
  onNavigate: (view: 'register' | 'verification' | 'variances' | 'tagging') => void;
}

export default function DashboardView({ assets, sessions, variances, onNavigate }: DashboardViewProps) {
  // Compute key stats
  const totalAssets = assets.length;
  
  const taggedCount = assets.filter(a => a.tagStatus === 'Active' || a.tagStatus === 'Commissioned').length;
  const taggingCoverage = totalAssets > 0 ? Math.round((taggedCount / totalAssets) * 100) : 0;
  
  const activeVariances = variances.filter(v => !v.resolved).length;
  
  const inProgressAudit = sessions.find(s => s.status === 'In Progress');
  const auditProgress = inProgressAudit 
    ? Math.round((inProgressAudit.scannedCount / inProgressAudit.totalCount) * 100) 
    : 100;

  // Asset counts by category
  const categories = Array.from(new Set(assets.map(a => a.category)));
  const categoryStats = categories.map(cat => {
    const list = assets.filter(a => a.category === cat);
    const sumCost = list.reduce((acc, current) => acc + current.cost, 0);
    return {
      name: cat,
      count: list.length,
      cost: sumCost
    };
  }).sort((a, b) => b.cost - a.cost);

  // Asset counts by location
  const locations = Array.from(new Set(assets.map(a => a.location.split(' - ')[0])));
  const locationStats = locations.map(loc => {
    const count = assets.filter(a => a.location.startsWith(loc)).length;
    return { name: loc, count };
  });

  return (
    <div className="space-y-6">
      {/* Overview Greeting Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-light font-sans tracking-tight">
            Corporate Asset <span className="text-emerald-400 font-medium">Governance Suite</span>
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl">
            Inspired by AssetCues workflows: Plan asset lifecycle stages, automate physical tag audits, and reconcile ledger variances in active locations.
          </p>
        </div>
        <div className="relative z-10 flex gap-3 mt-4 md:mt-0">
          <button 
            id="btn-nav-scan"
            onClick={() => onNavigate('verification')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <QrCode size={16} />
            Simulate Physical Scan
          </button>
          <button 
            id="btn-nav-register"
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg border border-zinc-700 text-sm transition-all"
          >
            View Ledgers
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase font-semibold">Total Corporate Assets</span>
            <span className="p-2 bg-zinc-100 rounded-lg text-zinc-700"><Building2 size={16} /></span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold tracking-tight text-zinc-900">{totalAssets}</span>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium font-mono flex items-center">
                <TrendingUp size={12} className="mr-0.5" /> Ready
              </span>
              for operational allocation
            </div>
          </div>
        </motion.div>

        {/* Tag Coverage */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase font-semibold">Smart Tag Coverage</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><QrCode size={16} /></span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold tracking-tight text-zinc-900">{taggingCoverage}%</span>
            <div className="text-xs text-zinc-500 mt-1">
              <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${taggingCoverage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Unresolved Variances */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase font-semibold">Active Discrepancies</span>
            <span className={`p-2 rounded-lg ${activeVariances > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold tracking-tight text-zinc-900">{activeVariances}</span>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              {activeVariances > 0 ? (
                <span className="text-amber-600 font-mono font-semibold hover:underline cursor-pointer" onClick={() => onNavigate('variances')}>
                  Review queue required →
                </span>
              ) : (
                <span className="text-emerald-600 font-mono">Ledger and physical in sync</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Audit Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase font-semibold">Verification Audit Progress</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={16} /></span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-sans font-bold tracking-tight text-zinc-900">{auditProgress}%</span>
            <div className="text-xs text-zinc-500 mt-1">
              <span className="font-mono text-zinc-700">
                {inProgressAudit ? `${inProgressAudit.scannedCount}/${inProgressAudit.totalCount} Scanned` : 'No active audit sessions'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Section Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Status List / Session Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Audit Session Detail */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-base font-medium text-zinc-900 font-sans">Active Physical Verification Audits</h3>
                <p className="text-xs text-zinc-500">Scheduled scans to conform book parameters to physical reality</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-md font-semibold">
                Workstation Audits Live
              </span>
            </div>

            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="border border-zinc-100 rounded-lg p-4 hover:border-zinc-200 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-900 font-medium text-sm">{session.title}</span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          session.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 items-center text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-zinc-400" /> {session.targetLocation}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={12} className="text-zinc-400" /> {session.startDate}
                        </span>
                        <span className="font-semibold text-zinc-700">
                          ID: {session.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1.5 min-w-[120px]">
                      <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-500">
                        <span>Reconciled</span>
                        <span className="font-semibold text-zinc-900">
                          {Math.round((session.scannedCount / session.totalCount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((session.scannedCount / session.totalCount) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {session.scannedCount} of {session.totalCount} assets matched
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-zinc-100 flex justify-end">
              <button 
                id="btn-goto-audits"
                onClick={() => onNavigate('verification')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-mono font-semibold flex items-center gap-1"
              >
                Launch Verification Simulator <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Ledger Discrepancies Overview Container */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-zinc-900 font-sans">Recent Ledger Discrepancies (Variance Queue)</h3>
                <p className="text-xs text-zinc-500">Flagged mismatches that require immediate action to settle the inventory records</p>
              </div>
              <button 
                id="btn-goto-variances"
                onClick={() => onNavigate('variances')}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
              >
                View Process Queue ({activeVariances})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs text-zinc-400 font-mono bg-zinc-50/50">
                    <th className="py-2.5 px-3">Asset Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Variance Type</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-sm">
                  {variances.filter(v => !v.resolved).slice(0, 3).map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-zinc-900 font-medium">
                        {item.assetId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-800">{item.assetName}</div>
                        <div className="text-[10px] text-zinc-500">Scanned {new Date(item.scannedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-xs text-amber-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                          item.severity === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          item.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-zinc-100 text-zinc-600'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          id={`btn-dashboard-resolve-${item.id}`}
                          onClick={() => onNavigate('variances')}
                          className="text-xs font-mono font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Resolve →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {variances.filter(v => !v.resolved).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-zinc-400 font-mono">
                        No outstanding discrepancies. Excellent governance control!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Metric Rail */}
        <div className="space-y-6">
          
          {/* Asset Category Financials */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-medium text-zinc-900 font-sans mb-1">Financial Classification</h3>
            <p className="text-xs text-zinc-500 mb-4">Capitalized cost allocated across core categories</p>
            
            <div className="space-y-4">
              {categoryStats.map(stat => {
                const percentage = Math.round((stat.cost / assets.reduce((a, b) => a + b.cost, 0)) * 100);
                return (
                  <div key={stat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-700">
                      <span className="font-medium font-sans">{stat.name} ({stat.count})</span>
                      <span className="font-mono text-zinc-900 font-semibold">${stat.cost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-150 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-zinc-800 h-1.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auditing & Compliance Standards Rule */}
          <div className="bg-emerald-950 border border-emerald-900 rounded-xl p-6 text-emerald-100/90 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-emerald-900/40 transform translate-x-3 translate-y-3 pointer-events-none">
              <ShieldCheck size={120} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                <span className="text-xs font-mono tracking-widest uppercase font-bold text-emerald-400">Compliance Audit Stand</span>
              </div>
              
              <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">
                Corporate policy requires physical audits every 180 days. Smart labels (QR codes & active RFID) confirm physical presence back to the Ledger to deter shrinkage and unauthorized device transfers.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>Shrinkage rate is healthy ({"<0.2%"})</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>IT assets verified last 30d</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>Discrepancies resolved within 48h</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-governance-read"
                  onClick={() => onNavigate('tagging')}
                  className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold rounded-lg transition-colors"
                >
                  Commission Pending Tags
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

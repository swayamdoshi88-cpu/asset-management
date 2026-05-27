/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssetCategory = 'Compute' | 'Mobile' | 'Network' | 'Furniture' | 'Facility' | 'Server';

export type AssetStatus = 'Allocated' | 'In Storage' | 'In Transit' | 'Retired' | 'Maintenance';

export type TagType = 'QR' | 'Barcode' | 'RFID' | 'BLE';

export type TagStatus = 'Pending' | 'Commissioned' | 'Active';

export interface Asset {
  id: string; // Asset Code like AST-2026-001
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  tagType: TagType;
  tagStatus: TagStatus;
  tagCode: string; // Sticker/RFID label sequence
  serialNumber: string;
  cost: number;
  purchaseDate: string;
  custodian: string;
  department: string;
  location: string;
  lastAuditDate?: string;
  notes?: string;
}

export interface AuditSession {
  id: string;
  title: string;
  targetLocation: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  startDate: string;
  scannedCount: number;
  totalCount: number;
}

export interface VarianceItem {
  id: string;
  assetId: string;
  assetName: string;
  type: 'Location Mismatch' | 'Custodian Mismatch' | 'Missing Asset' | 'Found Unlisted' | 'Status Mismatch';
  severity: 'Low' | 'Medium' | 'High';
  bookValue: {
    location: string;
    custodian: string;
    status: string;
  };
  scannedValue: {
    location: string;
    custodian: string;
    status: string;
  };
  scannedAt: string;
  resolved: boolean;
  notes?: string;
}

export interface TaggingTask {
  id: string;
  assetId: string;
  assetName: string;
  category: AssetCategory;
  requestedAt: string;
  priority: 'Routine' | 'Urgent' | 'Critical';
  status: 'Pending' | 'Sticker Printed' | 'Tag Verified';
}

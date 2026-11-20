export type CraneStatus = 'ready' | 'in_maintenance' | 'critical';
export type ComponentType = 'cable' | 'brake' | 'hook';

export interface Crane {
  id: string;
  code: string;
  workshop: string;
  maxCapacityTons: number;
  status: CraneStatus;
  commissioningYear: number;
  averageWear?: number;
}

export interface InspectionLog {
  id: string;
  craneId: string;
  inspectionDate: string;
  inspector: string;
  componentType: ComponentType;
  wearPercentage: number;
  notes: string;
}

export interface CraneDetailsResponse {
  crane: Crane;
  metrics: {
    status: CraneStatus;
    averageWear: number;
    mostWornComponent: InspectionLog | null;
  };
  inspections: InspectionLog[];
}

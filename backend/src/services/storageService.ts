import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ComponentType, CraneStatus, Database, InspectionLog } from '../types/crane.types.js';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export async function readData(): Promise<Database> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data) as Database;
  } catch {
    const c1 = uuidv4();
    const c2 = uuidv4();
    const c3 = uuidv4();
    const c4 = uuidv4();

    const defaultDb: Database = {
      cranes: [
        { id: c1, code: 'CR-104-A', workshop: 'Ливарний цех №1', maxCapacityTons: 50, commissioningYear: 2010, status: 'ready' },
        { id: c2, code: 'CR-105-B', workshop: 'Ливарний цех №2', maxCapacityTons: 120, commissioningYear: 2015, status: 'in_maintenance' },
        { id: c3, code: 'CR-106-C', workshop: 'Прокатний стан', maxCapacityTons: 250, commissioningYear: 2020, status: 'critical' },
        { id: c4, code: 'CR-107-D', workshop: 'Склад готової продукції', maxCapacityTons: 15, commissioningYear: 1998, status: 'ready' }
      ],
      inspections: [
        { id: uuidv4(), craneId: c1, inspectionDate: '2026-01-10', inspector: 'Коваленко О.П.', componentType: 'cable', wearPercentage: 20, notes: 'Стан задовільний' },
        { id: uuidv4(), craneId: c1, inspectionDate: '2026-02-15', inspector: 'Коваленко О.П.', componentType: 'brake', wearPercentage: 35, notes: 'Незначний знос колодок' },
        { id: uuidv4(), craneId: c2, inspectionDate: '2026-03-01', inspector: 'Мельник В.І.', componentType: 'hook', wearPercentage: 65, notes: 'Потрібен плановий огляд гака' },
        { id: uuidv4(), craneId: c2, inspectionDate: '2026-03-12', inspector: 'Мельник В.І.', componentType: 'cable', wearPercentage: 40, notes: 'Змащення троса виконано' },
        { id: uuidv4(), craneId: c3, inspectionDate: '2026-04-05', inspector: 'Сидоренко А.М.', componentType: 'cable', wearPercentage: 85, notes: 'Критичний знос! Експлуатацію заборонено' },
        { id: uuidv4(), craneId: c3, inspectionDate: '2026-04-06', inspector: 'Сидоренко А.М.', componentType: 'brake', wearPercentage: 55, notes: 'Підтягнуто гальмівний шків' },
        { id: uuidv4(), craneId: c4, inspectionDate: '2026-05-10', inspector: 'Бондаренко С.В.', componentType: 'hook', wearPercentage: 15, notes: 'Без зауважень' },
        { id: uuidv4(), craneId: c4, inspectionDate: '2026-05-20', inspector: 'Бондаренко С.В.', componentType: 'cable', wearPercentage: 25, notes: 'Норма' }
      ]
    };
    await writeData(defaultDb);
    return defaultDb;
  }
}

export async function writeData(data: Database): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function calculateCraneMetrics(craneId: string, inspections: InspectionLog[]) {
  const craneLogs = inspections.filter(i => i.craneId === craneId);
  if (!craneLogs.length) {
    return { status: 'ready' as CraneStatus, averageWear: 0, mostWornComponent: null };
  }

  const latestByComponent = new Map<ComponentType, InspectionLog>();
  for (const log of craneLogs) {
    latestByComponent.set(log.componentType, log);
  }

  const latestLogs = Array.from(latestByComponent.values());
  const maxWear = Math.max(...latestLogs.map(l => l.wearPercentage));
  const avgWear = Math.round(latestLogs.reduce((acc, l) => acc + l.wearPercentage, 0) / latestLogs.length);
  const mostWorn = latestLogs.reduce((prev, curr) => (curr.wearPercentage > prev.wearPercentage ? curr : prev));

  let status: CraneStatus = 'ready';
  if (maxWear >= 80) status = 'critical';
  else if (maxWear >= 50) status = 'in_maintenance';

  return { status, averageWear: avgWear, mostWornComponent: mostWorn };
}

export function validateCranePayload(body: any): string[] {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (!body.code || typeof body.code !== 'string' || body.code.trim().length < 4 || body.code.trim().length > 12) {
    errors.push('Шифр крана обов’язковий (4–12 символів)');
  }
  if (!body.workshop || typeof body.workshop !== 'string' || !body.workshop.trim()) {
    errors.push('Назва цеху є обов’язковою');
  }
  if (typeof body.maxCapacityTons !== 'number' || body.maxCapacityTons < 1 || body.maxCapacityTons > 250) {
    errors.push('Вантажопідйомність має бути від 1 до 250 тонн');
  }
  if (typeof body.commissioningYear !== 'number' || body.commissioningYear < 1980 || body.commissioningYear > currentYear) {
    errors.push(`Рік введення має бути від 1980 до ${currentYear}`);
  }
  return errors;
}
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Crane, InspectionLog } from '../types/crane.types.js';
import { readData, writeData, calculateCraneMetrics, validateCranePayload } from '../services/storageService.js';

const router = Router();

router.get('/cranes', async (req: Request, res: Response) => {
  const db = await readData();
  const { search, workshop, status, sortBy, sortOrder } = req.query;

  let results = db.cranes.map(crane => {
    const metrics = calculateCraneMetrics(crane.id, db.inspections);
    return { ...crane, status: metrics.status, averageWear: metrics.averageWear };
  });

  if (typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(c => c.code.toLowerCase().includes(q) || c.workshop.toLowerCase().includes(q));
  }
  if (typeof workshop === 'string' && workshop.trim()) {
    results = results.filter(c => c.workshop.toLowerCase().includes(workshop.toLowerCase()));
  }
  if (typeof status === 'string' && status !== 'All' && status !== '') {
    results = results.filter(c => c.status === status);
  }

  if (sortBy === 'capacity') {
    results.sort((a, b) => sortOrder === 'desc' ? b.maxCapacityTons - a.maxCapacityTons : a.maxCapacityTons - b.maxCapacityTons);
  } else if (sortBy === 'year') {
    results.sort((a, b) => sortOrder === 'desc' ? b.commissioningYear - a.commissioningYear : a.commissioningYear - b.commissioningYear);
  }

  res.json(results);
});

router.get('/cranes/:id', async (req: Request, res: Response) => {
  const db = await readData();
  const crane = db.cranes.find(c => c.id === req.params.id);
  if (!crane) return res.status(404).json({ error: 'Кран не знайдено' });

  const metrics = calculateCraneMetrics(crane.id, db.inspections);
  const inspections = db.inspections.filter(i => i.craneId === crane.id);

  res.json({
    crane: { ...crane, status: metrics.status },
    metrics,
    inspections
  });
});

router.post('/cranes', async (req: Request, res: Response) => {
  const errors = validateCranePayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = await readData();
  const newCrane: Crane = {
    id: uuidv4(),
    code: req.body.code.trim(),
    workshop: req.body.workshop.trim(),
    maxCapacityTons: req.body.maxCapacityTons,
    commissioningYear: req.body.commissioningYear,
    status: 'ready'
  };
  db.cranes.push(newCrane);
  await writeData(db);
  res.status(201).json(newCrane);
});

router.put('/cranes/:id', async (req: Request, res: Response) => {
  const errors = validateCranePayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = await readData();
  const index = db.cranes.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Кран не знайдено' });

  db.cranes[index] = {
    ...db.cranes[index],
    code: req.body.code.trim(),
    workshop: req.body.workshop.trim(),
    maxCapacityTons: req.body.maxCapacityTons,
    commissioningYear: req.body.commissioningYear
  };
  await writeData(db);
  res.json(db.cranes[index]);
});

router.delete('/cranes/:id', async (req: Request, res: Response) => {
  const db = await readData();
  const exists = db.cranes.some(c => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Кран не знайдено' });

  db.cranes = db.cranes.filter(c => c.id !== req.params.id);
  db.inspections = db.inspections.filter(i => i.craneId !== req.params.id);
  await writeData(db);
  res.status(204).send();
});

router.post('/cranes/:id/inspections', async (req: Request, res: Response) => {
  const { inspectionDate, inspector, componentType, wearPercentage, notes } = req.body;
  const errors: string[] = [];

  if (!inspectionDate || !/^\d{4}-\d{2}-\d{2}$/.test(inspectionDate)) {
    errors.push('Некоректна дата (формат YYYY-MM-DD)');
  }
  if (!inspector || typeof inspector !== 'string' || inspector.trim().length < 3) {
    errors.push('ПІБ інспектора має містити мінімум 3 символи');
  }
  if (!['cable', 'brake', 'hook'].includes(componentType)) {
    errors.push('Невідомий тип вузла');
  }
  if (typeof wearPercentage !== 'number' || wearPercentage < 0 || wearPercentage > 100) {
    errors.push('Відсоток зносу має бути від 0 до 100');
  }
  if (notes && typeof notes === 'string' && notes.length > 300) {
    errors.push('Примітки не повинні перевищувати 300 символів');
  }

  if (errors.length) return res.status(400).json({ errors });

  const db = await readData();
  if (!db.cranes.some(c => c.id === req.params.id)) {
    return res.status(404).json({ error: 'Кран не знайдено' });
  }

  const newLog: InspectionLog = {
    id: uuidv4(),
    craneId: req.params.id,
    inspectionDate,
    inspector: inspector.trim(),
    componentType,
    wearPercentage,
    notes: notes ? notes.trim() : ''
  };
  db.inspections.push(newLog);
  await writeData(db);
  res.status(201).json(newLog);
});

router.delete('/inspections/:id', async (req: Request, res: Response) => {
  const db = await readData();
  const exists = db.inspections.some(i => i.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Акт огляду не знайдено' });

  db.inspections = db.inspections.filter(i => i.id !== req.params.id);
  await writeData(db);
  res.status(204).send();
});

export default router;
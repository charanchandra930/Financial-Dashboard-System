const { z } = require('zod');

const createRecord = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be a positive number'),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().datetime().optional().or(z.date().optional()),
    notes: z.string().optional(),
  }),
});

const updateRecord = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record ID'),
  }),
  body: z.object({
    amount: z.number().positive('Amount must be a positive number').optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional().or(z.date().optional()),
    notes: z.string().optional(),
  }),
});

const getRecords = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

module.exports = {
  createRecord,
  updateRecord,
  getRecords,
};

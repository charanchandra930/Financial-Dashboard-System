const { z } = require('zod');

const updateUser = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['viewer', 'analyst', 'admin']).optional(),
    isActive: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field (role, isActive) must be provided for update."
  }),
});

module.exports = {
  updateUser,
};

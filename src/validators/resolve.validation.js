import z from 'zod';

export const resolveMarketValidation = z.object({
    marketId: z.string(),
    resolution: z.string().toLowerCase().enum(['yes', 'no'])
})
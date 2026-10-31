import z from 'zod'

export const createMarketValidation = z.object({
    title: z.string(),
    initialWager: z.number().positive(),
    side: z.string().lowercase().enum(['yes', 'no'], { message: 'enter "yes" or "no"' }),
    expirey: z.date()
})

export const createBetValidation = z.object({
    marketId: z.string(),
    betAmount: z.number().positive()
})
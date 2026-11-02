import z from 'zod'

export const createMarketValidation = z.object({
    title: z.string(),
    initialWager: z.number().positive(),
    side: z.enum(['yes', 'no'], { message: 'enter "yes" or "no"' }),
    expirey: z.coerce.date() //use to convert the get string into date
})

export const createBetValidation = z.object({
    marketId: z.string(),
    betAmount: z.number().positive()
})
import z from 'zod';

export const signupValidation = z.object({
    userName: z.string().trim().min(3, { message: 'enter minimum 3 character' }).max(20, { message: 'enter maximum 20 character' }),
    password: z.string().trim().min(6, { message: 'enter minimum 6 character password' }).max(20, { message: 'enter maximum 20 character password' }),
    email: z.string().trim().email().toLowerCase(),
    balance: z.number().positive()
})

export const signinValidation = z.object({
    userName: z.string().trim().min(3, { message: 'enter minimum 3 character' }).max(20, { message: 'enter maximum 20 character' }),
    password: z.string().trim().min(6, { message: 'enter minimum 6 character password' }).max(20, { message: 'enter maximum 20 character password' }),
})

export const addValueValidation = z.object({
    balance: z.number().positive().min(1, { message: 'add minimum 1 rupees' })
})
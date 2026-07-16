import { z } from 'zod'

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(60, 'Name cannot exceed 60 characters')

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email must be valid')
  .max(254, 'Email cannot exceed 254 characters')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/\d/, 'Password must include at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character')
  .max(72, 'Password cannot exceed 72 characters')

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

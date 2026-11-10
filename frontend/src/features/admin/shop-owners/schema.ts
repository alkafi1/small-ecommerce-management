import { z } from 'zod'

const base = z.object({
  name: z.string().trim().min(1, 'Please enter the owner name.').max(120, 'Name is too long.'),
  email: z.string().trim().min(1, 'Please enter an email address.').email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .regex(/^$|^[0-9+\-\s()]{6,30}$/, 'Please enter a valid phone number.'),
  password: z.string(),
  password_confirmation: z.string(),
  is_active: z.boolean(),
})

/** Password is required when creating; on edit an empty password keeps the current one. */
export const shopOwnerSchema = (isEdit: boolean) =>
  base.superRefine((values, ctx) => {
    if (!isEdit && values.password.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Please set a password for the new account.' })
    }
    if (values.password.length > 0 && values.password.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must be at least 8 characters.' })
    }
    if (values.password !== values.password_confirmation) {
      ctx.addIssue({ code: 'custom', path: ['password_confirmation'], message: 'The two passwords do not match.' })
    }
  })

export type ShopOwnerValues = z.infer<typeof base>

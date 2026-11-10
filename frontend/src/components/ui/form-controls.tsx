import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

const controlBase =
  'block w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500'

const controlState = (invalid?: boolean) =>
  invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'

interface FieldProps {
  label: string
  error?: string
  hint?: ReactNode
  required?: boolean
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode
  className?: string
}

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ label, error, hint, required, children, className }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children({ id, invalid: Boolean(error), describedBy: error || hint ? messageId : undefined })}
      {error ? (
        <p id={messageId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...props }, ref) => (
  <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlBase, 'h-10', controlState(invalid), className)} {...props} />
))
Input.displayName = 'Input'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ invalid, className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} aria-invalid={invalid || undefined} className={cn(controlBase, 'py-2', controlState(invalid), className)} {...props} />
))
Textarea.displayName = 'Textarea'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ invalid, className, children, ...props }, ref) => (
  <select ref={ref} aria-invalid={invalid || undefined} className={cn(controlBase, 'h-10 pr-8', controlState(invalid), className)} {...props}>
    {children}
  </select>
))
Select.displayName = 'Select'

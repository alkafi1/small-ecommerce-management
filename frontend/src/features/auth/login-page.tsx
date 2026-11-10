import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/form-controls'
import { env } from '@/config/env'
import { useFormErrors } from '@/hooks/use-form-errors'
import { HOME_BY_ROLE, useAuthStore } from '@/stores/auth.store'
import { useLogin } from './hooks'
import { loginSchema, type LoginValues } from './schema'

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@example.com' },
  { label: 'Shop owner 1', email: 'owner1@example.com' },
  { label: 'Shop owner 2', email: 'owner2@example.com' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const consumeNotice = useAuthStore((state) => state.consumeNotice)
  const [notice] = useState(() => consumeNotice())
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const handleError = useFormErrors(form)
  const login = useLogin()

  useEffect(() => {
    form.setFocus('email')
  }, [form])

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess: ({ user }) => {
        const redirect = searchParams.get('redirect')
        const home = HOME_BY_ROLE[user.role]
        navigate(redirect?.startsWith(home) ? redirect : home, { replace: true })
      },
      onError: (error) => {
        // Wrong credentials / disabled account: show one clear message above the form.
        if (error.status === 401 || error.status === 403 || error.status === 429) setFormError(error.message)
        else handleError(error)
      },
    })
  })

  const { errors } = form.formState

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">S</span>
          {env.appName}
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="text-xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-500">For administrators and shop owners.</p>

          {(formError || notice) && (
            <div role="alert" className={`mt-5 rounded-lg px-4 py-3 text-sm ${formError ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
              {formError ?? notice}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <Field label="Email address" error={errors.email?.message} required>
              {(p) => <Input id={p.id} type="email" autoComplete="email" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('email')} />}
            </Field>
            <Field label="Password" error={errors.password?.message} required>
              {(p) => <Input id={p.id} type="password" autoComplete="current-password" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('password')} />}
            </Field>
            <Button type="submit" className="w-full" loading={login.isPending}>
              Sign in
            </Button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm">
          <p className="font-medium text-slate-700">Demo accounts (password: <code className="rounded bg-slate-100 px-1">password</code>)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700"
                onClick={() => {
                  form.reset({ email: account.email, password: 'password' })
                  setFormError(null)
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Just browsing?{' '}
          <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
            Visit the shops →
          </Link>
        </p>
      </div>
    </div>
  )
}

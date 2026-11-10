import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/form-controls'
import { Modal } from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { useFormErrors } from '@/hooks/use-form-errors'
import type { User } from '@/types/models'
import { useSaveShopOwner } from './hooks'
import { shopOwnerSchema, type ShopOwnerValues } from './schema'

interface Props {
  owner: User | null
  open: boolean
  onClose: () => void
}

export function ShopOwnerFormModal({ owner, open, onClose }: Props) {
  const isEdit = Boolean(owner)
  const form = useForm<ShopOwnerValues>({
    resolver: zodResolver(shopOwnerSchema(isEdit)),
    defaultValues: {
      name: owner?.name ?? '',
      email: owner?.email ?? '',
      phone: owner?.phone ?? '',
      password: '',
      password_confirmation: '',
      is_active: owner?.is_active ?? true,
    },
  })
  const handleError = useFormErrors(form)
  const save = useSaveShopOwner(owner?.id)
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      { ...values, phone: values.phone || null, password: values.password || undefined, password_confirmation: values.password_confirmation || undefined },
      { onSuccess: onClose, onError: handleError },
    )
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit shop owner' : 'New shop owner'}
      description={isEdit ? 'Leave the password empty to keep the current one.' : 'The owner signs in with this email and password.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="shop-owner-form" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create account'}
          </Button>
        </>
      }
    >
      <form id="shop-owner-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Full name" error={errors.name?.message} required className="sm:col-span-2">
          {(p) => <Input id={p.id} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('name')} />}
        </Field>
        <Field label="Email" error={errors.email?.message} required>
          {(p) => <Input id={p.id} type="email" autoComplete="off" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('email')} />}
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          {(p) => <Input id={p.id} type="tel" placeholder="01XXXXXXXXX" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('phone')} />}
        </Field>
        <Field label={isEdit ? 'New password' : 'Password'} error={errors.password?.message} required={!isEdit} hint="At least 8 characters.">
          {(p) => <Input id={p.id} type="password" autoComplete="new-password" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('password')} />}
        </Field>
        <Field label="Confirm password" error={errors.password_confirmation?.message} required={!isEdit}>
          {(p) => <Input id={p.id} type="password" autoComplete="new-password" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('password_confirmation')} />}
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Account active</p>
            <p className="text-xs text-slate-500">Inactive owners cannot sign in.</p>
          </div>
          <Controller control={form.control} name="is_active" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Account active" />} />
        </div>
      </form>
    </Modal>
  )
}

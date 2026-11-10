import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/form-controls'
import { ImageInput } from '@/components/ui/image-input'
import { Modal } from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { useFormErrors } from '@/hooks/use-form-errors'
import type { Shop } from '@/types/models'
import { useShopOwnerOptions } from '../shop-owners/hooks'
import { useSaveShop } from './hooks'

const schema = z.object({
  owner_id: z.string().min(1, 'Please choose a shop owner.'),
  name: z.string().trim().min(1, 'Please enter the shop name.').max(120, 'Name is too long.'),
  description: z.string().max(2000, 'Description is too long.'),
  is_active: z.boolean(),
  logo: z.instanceof(File).nullable(),
})

type Values = z.infer<typeof schema>

export function ShopFormModal({ shop, onClose }: { shop: Shop | null; onClose: () => void }) {
  const owners = useShopOwnerOptions()
  const [removeLogo, setRemoveLogo] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      owner_id: shop ? String(shop.owner_id) : '',
      name: shop?.name ?? '',
      description: shop?.description ?? '',
      is_active: shop?.is_active ?? true,
      logo: null,
    },
  })
  const handleError = useFormErrors(form)
  const save = useSaveShop(shop?.id)
  const { errors } = form.formState

  // The current owner may be inactive (and so missing from the options list); keep them selectable.
  const ownerOptions = [...(owners.data ?? [])]
  if (shop?.owner && !ownerOptions.some((owner) => owner.id === shop.owner_id)) ownerOptions.unshift(shop.owner)

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      { ...values, owner_id: Number(values.owner_id), description: values.description || null, remove_logo: removeLogo },
      { onSuccess: onClose, onError: handleError },
    )
  })

  return (
    <Modal
      open
      onClose={onClose}
      title={shop ? 'Edit shop' : 'New shop'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="shop-form" loading={save.isPending}>
            {shop ? 'Save changes' : 'Create shop'}
          </Button>
        </>
      }
    >
      <form id="shop-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Shop name" error={errors.name?.message} required>
          {(p) => <Input id={p.id} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('name')} />}
        </Field>
        <Field label="Shop owner" error={errors.owner_id?.message} required hint={owners.isError ? 'Could not load owners. Close and try again.' : undefined}>
          {(p) => (
            <Select id={p.id} invalid={p.invalid} aria-describedby={p.describedBy} disabled={owners.isLoading} {...form.register('owner_id')}>
              <option value="">{owners.isLoading ? 'Loading owners…' : 'Choose an owner'}</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
          {(p) => <Textarea id={p.id} rows={3} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('description')} />}
        </Field>
        <Field label="Logo" error={errors.logo?.message} className="sm:col-span-2">
          {(p) => (
            <Controller
              control={form.control}
              name="logo"
              render={({ field }) => (
                <ImageInput
                  id={p.id}
                  currentUrl={shop?.logo_url}
                  file={field.value}
                  onFileChange={(file) => {
                    field.onChange(file)
                    if (file) setRemoveLogo(false)
                  }}
                  removed={removeLogo}
                  onRemove={() => setRemoveLogo(true)}
                  invalid={p.invalid}
                />
              )}
            />
          )}
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Shop active</p>
            <p className="text-xs text-slate-500">Customers cannot see inactive shops or their products.</p>
          </div>
          <Controller control={form.control} name="is_active" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Shop active" />} />
        </div>
      </form>
    </Modal>
  )
}

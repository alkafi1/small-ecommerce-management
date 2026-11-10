import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/form-controls'
import { ImageInput } from '@/components/ui/image-input'
import { Modal } from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { useFormErrors } from '@/hooks/use-form-errors'
import type { Product } from '@/types/models'
import type { ProductScope } from './api'
import { useSaveProduct } from './hooks'

const priceRule = z
  .string()
  .trim()
  .min(1, 'Please enter a price.')
  .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount with at most 2 decimals.')

const schema = z.object({
  name: z.string().trim().min(1, 'Please enter the product name.').max(160, 'Name is too long.'),
  sku: z
    .string()
    .trim()
    .max(64, 'SKU is too long.')
    .regex(/^[A-Za-z0-9\-_.]*$/, 'SKU may only contain letters, numbers, dashes, dots and underscores.'),
  description: z.string().max(5000, 'Description is too long.'),
  base_price: priceRule,
  is_active: z.boolean(),
  thumbnail: z.instanceof(File).nullable(),
})

type Values = z.infer<typeof schema>

interface Props {
  scope: ProductScope
  product: Product | null
  onClose: () => void
}

export function ProductFormModal({ scope, product, onClose }: Props) {
  const [removeThumbnail, setRemoveThumbnail] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      description: product?.description ?? '',
      base_price: product?.base_price ?? '',
      is_active: product?.is_active ?? true,
      thumbnail: null,
    },
  })
  const handleError = useFormErrors(form)
  const save = useSaveProduct(scope, product?.id)
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      { ...values, sku: values.sku || null, description: values.description || null, remove_thumbnail: removeThumbnail },
      { onSuccess: onClose, onError: handleError },
    )
  })

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product ? 'Edit product' : 'New catalog product'}
      description={scope === 'owner' && !product ? 'Your product is shared to the catalog, so other shop owners can list it too.' : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={save.isPending}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Product name" error={errors.name?.message} required className="sm:col-span-2">
          {(p) => <Input id={p.id} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('name')} />}
        </Field>
        <Field label="SKU" error={errors.sku?.message} hint="Optional, must be unique.">
          {(p) => <Input id={p.id} placeholder="e.g. APP-TSH-001" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('sku')} />}
        </Field>
        <Field label="Base price (৳)" error={errors.base_price?.message} required hint="Suggested price. Each shop sets its own.">
          {(p) => <Input id={p.id} inputMode="decimal" placeholder="0.00" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('base_price')} />}
        </Field>
        <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
          {(p) => <Textarea id={p.id} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('description')} />}
        </Field>
        <Field label="Thumbnail" error={errors.thumbnail?.message} className="sm:col-span-2">
          {(p) => (
            <Controller
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <ImageInput
                  id={p.id}
                  currentUrl={product?.thumbnail_url}
                  file={field.value}
                  onFileChange={(file) => {
                    field.onChange(file)
                    if (file) setRemoveThumbnail(false)
                  }}
                  removed={removeThumbnail}
                  onRemove={() => setRemoveThumbnail(true)}
                  invalid={p.invalid}
                />
              )}
            />
          )}
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Active in catalog</p>
            <p className="text-xs text-slate-500">Inactive products are hidden from the catalog and from every shop.</p>
          </div>
          <Controller control={form.control} name="is_active" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Active in catalog" />} />
        </div>
      </form>
    </Modal>
  )
}

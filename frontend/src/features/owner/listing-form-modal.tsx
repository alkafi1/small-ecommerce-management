import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/form-controls'
import { ImageInput } from '@/components/ui/image-input'
import { Modal } from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { Thumbnail } from '@/components/ui/thumbnail'
import { useFormErrors } from '@/hooks/use-form-errors'
import { formatMoney } from '@/lib/utils/format'
import type { Listing, Product, Shop } from '@/types/models'
import { useSaveListing } from './hooks'

const schema = z.object({
  price: z
    .string()
    .trim()
    .min(1, 'Please set a price for your shop.')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount with at most 2 decimals.')
    .refine((value) => Number(value) > 0, 'Price must be greater than 0.'),
  name: z.string().max(160, 'Name is too long.'),
  description: z.string().max(5000, 'Description is too long.'),
  is_visible: z.boolean(),
  thumbnail: z.instanceof(File).nullable(),
})

type Values = z.infer<typeof schema>

/** The catalog values a listing falls back to. */
interface CatalogInfo {
  id: number
  name: string
  description: string | null
  base_price: string
  thumbnail_url: string | null
  sku: string | null
}

type Props = { shop: Shop; onClose: () => void } & ({ mode: 'create'; product: Product } | { mode: 'edit'; listing: Listing })

/**
 * Add a catalog product to a shop, or edit a listing. Name, description and
 * thumbnail are optional overrides; empty means "use the catalog value".
 */
export function ListingFormModal(props: Props) {
  const { shop, onClose } = props
  const listing = props.mode === 'edit' ? props.listing : null
  const catalog: CatalogInfo = props.mode === 'edit' ? props.listing.product : props.product

  const [removeThumbnail, setRemoveThumbnail] = useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: listing?.price ?? catalog.base_price,
      name: listing?.overrides.name ?? '',
      description: listing?.overrides.description ?? '',
      is_visible: listing?.is_visible ?? true,
      thumbnail: null,
    },
  })
  const handleError = useFormErrors(form)
  const save = useSaveListing(shop.id, listing?.id)
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    save.mutate(
      {
        ...(listing ? {} : { product_id: catalog.id }),
        price: values.price,
        name: values.name.trim() || null,
        description: values.description.trim() || null,
        is_visible: values.is_visible,
        thumbnail: values.thumbnail,
        remove_thumbnail: removeThumbnail,
      },
      { onSuccess: onClose, onError: handleError },
    )
  })

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={listing ? 'Edit listing' : 'Add to your shop'}
      description={`Shop: ${shop.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="listing-form" loading={save.isPending}>
            {listing ? 'Save changes' : 'Add to shop'}
          </Button>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-4 rounded-xl bg-slate-50 p-3">
        <Thumbnail src={catalog.thumbnail_url} alt={catalog.name} className="size-14 rounded-lg" />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium text-slate-900">{catalog.name}</p>
          <p className="text-slate-500">
            Catalog price {formatMoney(catalog.base_price)}
            {catalog.sku ? ` · ${catalog.sku}` : ''}
          </p>
        </div>
      </div>

      <form id="listing-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Your price (৳)" error={errors.price?.message} required>
          {(p) => <Input id={p.id} inputMode="decimal" invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('price')} />}
        </Field>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2 sm:mt-7">
          <span className="text-sm font-medium text-slate-700">Visible to customers</span>
          <Controller control={form.control} name="is_visible" render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Visible to customers" />} />
        </div>
        <Field label="Display name" error={errors.name?.message} hint="Leave empty to use the catalog name." className="sm:col-span-2">
          {(p) => <Input id={p.id} placeholder={catalog.name} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('name')} />}
        </Field>
        <Field label="Description" error={errors.description?.message} hint="Leave empty to use the catalog description." className="sm:col-span-2">
          {(p) => <Textarea id={p.id} rows={3} placeholder={catalog.description ?? ''} invalid={p.invalid} aria-describedby={p.describedBy} {...form.register('description')} />}
        </Field>
        <Field label="Thumbnail for your shop" error={errors.thumbnail?.message} className="sm:col-span-2">
          {(p) => (
            <Controller
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <ImageInput
                  id={p.id}
                  currentUrl={listing?.overrides.thumbnail_url}
                  file={field.value}
                  onFileChange={(file) => {
                    field.onChange(file)
                    if (file) setRemoveThumbnail(false)
                  }}
                  removed={removeThumbnail}
                  onRemove={() => setRemoveThumbnail(true)}
                  fallbackHint="No custom image: customers see the catalog image."
                  invalid={p.invalid}
                />
              )}
            />
          )}
        </Field>
      </form>
    </Modal>
  )
}

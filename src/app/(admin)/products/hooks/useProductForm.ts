import { useState } from 'react'
import { productService, type CreateProductRequest, type UpdateProductRequest, type Product } from '@/services/product.service'
import { categoryService } from '@/services/category.service'
import { storeService } from '@/services/store.service'

interface UseProductFormParams {
  onSuccess?: () => void
}

export const useProductForm = ({ onSuccess }: UseProductFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreateProductRequest | UpdateProductRequest>({
    name: '',
    category: '',
    store: '',
    price: 0,
    disponibilite: true,
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingStores, setLoadingStores] = useState(false)

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await categoryService.getByParentSlug('ref-produits', { onlyActive: true, limit: 100 })
      setCategories(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadStores = async () => {
    try {
      setLoadingStores(true)
      const response = await storeService.getAll({ onlyActive: true, limit: 100 })
      setStores(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error)
    } finally {
      setLoadingStores(false)
    }
  }

  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      name: '',
      category: '',
      store: '',
      price: 0,
      disponibilite: true,
      status: 'active'
    })
    setFormErrors({})
    setSelectedProduct(null)
    await Promise.all([loadCategories(), loadStores()])
    setDialogOpen(true)
  }

  const handleEdit = async (product: Product) => {
    try {
      setFormMode('edit')
      setSelectedProduct(product)
      await Promise.all([loadCategories(), loadStores()])

      const fullProduct = await productService.getById(product._id)

      setFormData({
        name: fullProduct.name,
        description: fullProduct.description,
        content: fullProduct.content,
        category: typeof fullProduct.category === 'string' ? fullProduct.category : fullProduct.category._id,
        store: typeof fullProduct.store === 'string' ? fullProduct.store : fullProduct.store._id,
        price: fullProduct.price,
        volume: fullProduct.volume,
        composantePrincipale: fullProduct.composantePrincipale,
        format: fullProduct.format,
        dimension: fullProduct.dimension,
        color: fullProduct.color,
        composantNaturel: fullProduct.composantNaturel,
        typeExtraction: fullProduct.typeExtraction,
        images: fullProduct.images,
        disponibilite: fullProduct.disponibilite,
        status: fullProduct.status || 'active'
      })
      setFormErrors({})
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement du produit:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement du produit' })
    }
  }

  const handleSubmit = async () => {
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom est requis'
    }

    if (!formData.category) {
      errors.category = 'La catégorie est requise'
    }

    if (!formData.store) {
      errors.store = 'La boutique est requise'
    }

    if (!formData.price || formData.price < 0) {
      errors.price = 'Le prix est requis et doit être positif'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await productService.create(formData as CreateProductRequest)
      } else if (selectedProduct) {
        await productService.update(selectedProduct._id, formData as UpdateProductRequest)
      }

      setDialogOpen(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err)
      setFormErrors({ submit: err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
    setFormErrors({})
    setSelectedProduct(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedProduct,
    categories,
    stores,
    loadingCategories,
    loadingStores,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}


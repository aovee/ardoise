export function useCategories() {
  const { data: categories } = useFetch('/api/categories', {
    default: () => [] as string[]
  })

  return { categories }
}

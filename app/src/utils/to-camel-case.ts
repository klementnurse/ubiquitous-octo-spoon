export const toCamelCase = (s: string) => {
  return s
    .replace(/-+/g, ' ')
    .replace(/\s(.)/, c => c.toUpperCase())
    .replace(/\s/, '')
    .replace(/^(.)/, c => c.toLowerCase())
}

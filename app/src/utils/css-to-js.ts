import { toCamelCase } from './to-camel-case'

/**
 * convert semicolon-separated string to object
 */
export const cssToJS = (s?: string) => {
  if (!s) {
    return {}
  }
  const rules = s.split(/;/)
  const ret: Record<string, string> = {}
  for (const rule of rules) {
    const idx = rule.indexOf(':')
    if (idx === -1) {
      continue
    }
    const name = rule.substring(0, idx)
    const k = toCamelCase(name.trim())
    const v = rule.substring(idx + 1)
    if (k === '') {
      continue
    }
    ret[k] = v.trim()
  }
  return ret
}

function getBaseUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin)
}

export function getClerkHashRoute(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = getBaseUrl()
  url.hash = normalizedPath
  return url.toString()
}

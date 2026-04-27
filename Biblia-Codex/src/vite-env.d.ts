/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.pdf' {
  const content: string
  export default content
}

interface Navigator {
  getBattery?: () => Promise<{
    level: number
    charging: boolean
  }>
}

interface Window {
  workbox?: any
}

interface ServiceWorkerRegistration {
  showNotification?: (title: string, options?: NotificationOptions) => Promise<string>
}

/**
 * Component generator for Prefresh benchmark.
 * Generates ~100 React components using createContext patterns.
 * Uses seeded random (seed=42) for deterministic generation.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { SeededRandom } from '@rolldown/benchmark-utils/seeded-random'

const rng = new SeededRandom(42)

type ComponentType = 'ThemeContext' | 'AuthContext' | 'ConfigContext' | 'DataContext' | 'UIContext'
const COMPONENT_TYPES: ComponentType[] = [
  'ThemeContext',
  'AuthContext',
  'ConfigContext',
  'DataContext',
  'UIContext',
]

const THEMES = ['light', 'dark', 'auto', 'system']
const ROLES = ['admin', 'user', 'editor', 'viewer']

function generateThemeContext(index: number): string {
  const defaultTheme = rng.pick(THEMES)
  const hasToggle = rng.next() > 0.3

  return `import React, { createContext, useContext, useState } from 'react'

interface ThemeState${index} {
  theme: string
  primaryColor: string
${hasToggle ? '  toggleTheme: () => void' : ''}
}

export const ThemeContext${index} = createContext<ThemeState${index}>({
  theme: '${defaultTheme}',
  primaryColor: '#4ecdc4',
${hasToggle ? '  toggleTheme: () => {},' : ''}
})

export function ThemeProvider${index}({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('${defaultTheme}')

  return (
    <ThemeContext${index}.Provider value={{
      theme,
      primaryColor: theme === 'dark' ? '#fff' : '#333',
${hasToggle ? `      toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),` : ''}
    }}>
      {children}
    </ThemeContext${index}.Provider>
  )
}

export function ThemeContext${index}Consumer() {
  const ctx = useContext(ThemeContext${index})
  return <div>Theme: {ctx.theme}</div>
}
`
}

function generateAuthContext(index: number): string {
  const defaultRole = rng.pick(ROLES)

  return `import React, { createContext, useContext, useState } from 'react'

interface AuthState${index} {
  isAuthenticated: boolean
  role: string
  login: (role: string) => void
  logout: () => void
}

export const AuthContext${index} = createContext<AuthState${index}>({
  isAuthenticated: false,
  role: '${defaultRole}',
  login: () => {},
  logout: () => {},
})

export function AuthProvider${index}({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState({ isAuthenticated: false, role: '${defaultRole}' })

  return (
    <AuthContext${index}.Provider value={{
      ...auth,
      login: (role) => setAuth({ isAuthenticated: true, role }),
      logout: () => setAuth({ isAuthenticated: false, role: '${defaultRole}' }),
    }}>
      {children}
    </AuthContext${index}.Provider>
  )
}

export function AuthContext${index}Consumer() {
  const ctx = useContext(AuthContext${index})
  return <div>Auth: {ctx.isAuthenticated ? ctx.role : 'anonymous'}</div>
}
`
}

function generateConfigContext(index: number): string {
  const hasApi = rng.next() > 0.5
  const hasDebug = rng.next() > 0.5

  return `import React, { createContext, useContext } from 'react'

interface Config${index} {
  appName: string
  version: string
${hasApi ? '  apiUrl: string' : ''}
${hasDebug ? '  debug: boolean' : ''}
}

export const ConfigContext${index} = createContext<Config${index}>({
  appName: 'App${index}',
  version: '1.0.0',
${hasApi ? "  apiUrl: 'https://api.example.com'," : ''}
${hasDebug ? '  debug: false,' : ''}
})

export function ConfigProvider${index}({ children, config }: { children: React.ReactNode; config?: Partial<Config${index}> }) {
  const defaultConfig: Config${index} = {
    appName: 'App${index}',
    version: '1.0.0',
${hasApi ? "    apiUrl: 'https://api.example.com'," : ''}
${hasDebug ? '    debug: false,' : ''}
  }

  return (
    <ConfigContext${index}.Provider value={{ ...defaultConfig, ...config }}>
      {children}
    </ConfigContext${index}.Provider>
  )
}

export function ConfigContext${index}Consumer() {
  const ctx = useContext(ConfigContext${index})
  return <div>Config: {ctx.appName} v{ctx.version}</div>
}
`
}

function generateDataContext(index: number): string {
  return `import React, { createContext, useContext, useState } from 'react'

interface DataState${index} {
  data: unknown[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export const DataContext${index} = createContext<DataState${index}>({
  data: [],
  loading: false,
  error: null,
  refresh: () => {},
})

export function DataProvider${index}({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ data: [] as unknown[], loading: false, error: null as string | null })

  const refresh = () => {
    setState(s => ({ ...s, loading: true }))
    setState(s => ({ ...s, data: [{ id: ${index} }], loading: false }))
  }

  return (
    <DataContext${index}.Provider value={{ ...state, refresh }}>
      {children}
    </DataContext${index}.Provider>
  )
}

export function DataContext${index}Consumer() {
  const ctx = useContext(DataContext${index})
  return <div>Data: {ctx.loading ? 'Loading...' : ctx.data.length + ' items'}</div>
}
`
}

function generateUIContext(index: number): string {
  const hasModal = rng.next() > 0.5
  const hasSidebar = rng.next() > 0.5

  return `import React, { createContext, useContext, useState } from 'react'

interface UIState${index} {
${hasModal ? '  modalOpen: boolean\n  toggleModal: () => void' : ''}
${hasSidebar ? '  sidebarOpen: boolean\n  toggleSidebar: () => void' : ''}
  notifications: number
}

export const UIContext${index} = createContext<UIState${index}>({
${hasModal ? '  modalOpen: false,\n  toggleModal: () => {},' : ''}
${hasSidebar ? '  sidebarOpen: true,\n  toggleSidebar: () => {},' : ''}
  notifications: 0,
})

export function UIProvider${index}({ children }: { children: React.ReactNode }) {
${hasModal ? '  const [modalOpen, setModalOpen] = useState(false)' : ''}
${hasSidebar ? '  const [sidebarOpen, setSidebarOpen] = useState(true)' : ''}
  const [notifications] = useState(0)

  return (
    <UIContext${index}.Provider value={{
${hasModal ? '      modalOpen,\n      toggleModal: () => setModalOpen(o => !o),' : ''}
${hasSidebar ? '      sidebarOpen,\n      toggleSidebar: () => setSidebarOpen(o => !o),' : ''}
      notifications,
    }}>
      {children}
    </UIContext${index}.Provider>
  )
}

export function UIContext${index}Consumer() {
  const ctx = useContext(UIContext${index})
  return <div>UI: {ctx.notifications} notifications</div>
}
`
}

const GENERATORS: Record<ComponentType, (index: number) => string> = {
  ThemeContext: generateThemeContext,
  AuthContext: generateAuthContext,
  ConfigContext: generateConfigContext,
  DataContext: generateDataContext,
  UIContext: generateUIContext,
}

function main() {
  const componentsDir = join(import.meta.dirname, '../shared-app/src/components')
  if (existsSync(componentsDir)) rmSync(componentsDir, { recursive: true })
  mkdirSync(componentsDir, { recursive: true })

  const components: Array<{ type: ComponentType; index: number }> = []
  const TOTAL = 100
  const perType = Math.floor(TOTAL / COMPONENT_TYPES.length)
  const remainder = TOTAL % COMPONENT_TYPES.length

  for (let i = 0; i < COMPONENT_TYPES.length; i++) {
    const type = COMPONENT_TYPES[i]
    const count = perType + (i < remainder ? 1 : 0)
    for (let j = 0; j < count; j++) {
      const index = components.length + 1
      components.push({ type, index })
      writeFileSync(join(componentsDir, `${type}${index}.tsx`), GENERATORS[type](index))
    }
  }

  const exports = components
    .map(({ type, index }) => `export * from './${type}${index}.js'`)
    .join('\n')
  writeFileSync(join(componentsDir, 'index.ts'), exports + '\n')

  console.log(`Generated ${components.length} components in ${componentsDir}`)
  for (const type of COMPONENT_TYPES) {
    console.log(`  ${type}: ${components.filter((c) => c.type === type).length}`)
  }
}

main()

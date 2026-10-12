import { defineConfig } from 'rolldown'
import { createConfig } from './shared.ts'

export default defineConfig(createConfig('parallel', true))

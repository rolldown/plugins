import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import prefresh from '@rolldown/plugin-prefresh'

const __filename = fileURLToPath(import.meta.url)

export default defineConfig({
  plugins: [preactOptionsPlugin(), prefresh(), prefreshWrapperPlugin()],
})

function preactOptionsPlugin(): Plugin {
  return {
    name: 'preact-options',
    config(_config, { command }) {
      return {
        oxc: {
          jsx: {
            importSource: 'preact',
            refresh: command === 'serve',
          },
          jsxRefreshInclude: /\.[jt]sx$/,
        },
      }
    },
  }
}

function prefreshWrapperPlugin(): Plugin {
  return {
    name: 'prefresh-wrapper',
    apply: 'serve',
    config() {
      return {
        optimizeDeps: {
          include: ['@prefresh/core', '@prefresh/utils'],
        },
      }
    },
    transform: {
      filter: { id: { exclude: /\/node_modules\// } },
      async handler(code, id) {
        const hasReg = /\$RefreshReg\$\(/.test(code)
        const hasSig = /\$RefreshSig\$\(/.test(code)
        if (!hasSig && !hasReg) return code

        const prefreshCore = (await this.resolve('@prefresh/core', __filename))!
        const prefreshUtils = (await this.resolve('@prefresh/utils', __filename))!

        const prelude = `
          import ${JSON.stringify(prefreshCore.id)};
          import { flush as flushUpdates } from ${JSON.stringify(prefreshUtils.id)};

          let prevRefreshReg;
          let prevRefreshSig;

          if (import.meta.hot) {
            prevRefreshReg = self.$RefreshReg$ || (() => {});
            prevRefreshSig = self.$RefreshSig$ || (() => (type) => type);

            self.$RefreshReg$ = (type, id) => {
              self.__PREFRESH__.register(type, ${JSON.stringify(id)} + " " + id);
            };

            self.$RefreshSig$ = () => {
              let status = 'begin';
              let savedType;
              return (type, key, forceReset, getCustomHooks) => {
                if (!savedType) savedType = type;
                status = self.__PREFRESH__.sign(type || savedType, key, forceReset, getCustomHooks, status);
                return type;
              };
            };
          }
        `.replace(/[\n]+/gm, '')

        if (hasSig && !hasReg) {
          return {
            code: `${prelude}${code}`,
            map: null,
          }
        }

        return {
          code: `${prelude}${code}

        if (import.meta.hot) {
          self.$RefreshReg$ = prevRefreshReg;
          self.$RefreshSig$ = prevRefreshSig;
          import.meta.hot.accept((m) => {
            try {
              flushUpdates();
            } catch (e) {
              console.log('[PREFRESH] Failed to flush updates:', e);
              self.location.reload();
            }
          });
        }
      `,
          map: null,
        }
      },
    },
  }
}

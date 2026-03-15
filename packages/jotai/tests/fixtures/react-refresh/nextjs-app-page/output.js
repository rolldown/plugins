import { Provider } from "jotai";
import { jsx } from "react/jsx-runtime";
//#region atoms.jsx
function MyApp({ Component, pageProps }) {
	return /* @__PURE__ */ jsx(Provider, { children: /* @__PURE__ */ jsx(Component, { ...pageProps }) });
}
//#endregion
export { MyApp as default };

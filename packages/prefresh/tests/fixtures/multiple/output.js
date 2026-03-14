import * as ns from "preact";
import df, { createContext } from "preact";
//#region virtual:entry.js
function aaa(a, b) {
	Object.assign(createContext[`1e87a657330148b01_${a}${b}`] || (createContext[`1e87a657330148b01_${a}${b}`] = createContext({})), { __: {} });
	ns.createContext[`1e87a657330148b02_${a}${b}`] || (ns.createContext[`1e87a657330148b02_${a}${b}`] = ns.createContext());
	Object.assign(df.createContext[`1e87a657330148b03_${a}${b}`] || (df.createContext[`1e87a657330148b03_${a}${b}`] = df.createContext(b)), { __: b });
	return function bbb(a, b, c) {
		Object.assign(createContext[`1e87a657330148b04_${a}${b}${c}`] || (createContext[`1e87a657330148b04_${a}${b}${c}`] = createContext({})), { __: {} });
		ns.createContext[`1e87a657330148b05_${a}${b}${c}`] || (ns.createContext[`1e87a657330148b05_${a}${b}${c}`] = ns.createContext());
		Object.assign(df.createContext[`1e87a657330148b06_${a}${b}${c}`] || (df.createContext[`1e87a657330148b06_${a}${b}${c}`] = df.createContext(b)), { __: b });
	};
}
//#endregion
export { aaa };

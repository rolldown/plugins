import { someNamedExport } from "transformed-mixed-named";
import otherDefaultExport, * as starExport from "my-mixed-star";
//#region virtual:entry.ts
console.log(defaultExport, someNamedExport, otherDefaultExport, starExport);
//#endregion

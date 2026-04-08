import { someNamedExport } from "transformed-mixed-named";
import * as starExport from "my-mixed-star";
import otherDefaultExport from "my-mixed-star";
//#region virtual:entry.ts
console.log(defaultExport, someNamedExport, otherDefaultExport, starExport);
//#endregion

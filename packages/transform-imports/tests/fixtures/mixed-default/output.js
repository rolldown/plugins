import { someNamedExport } from "transformed-mixed-named";
import otherDefaultExport, * as starExport from "my-mixed-star";
// virtual:entry.ts
console.log(defaultExport, someNamedExport, otherDefaultExport, starExport);

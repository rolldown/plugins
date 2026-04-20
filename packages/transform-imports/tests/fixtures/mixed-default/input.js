import defaultExport, { someNamedExport } from "my-mixed-named";
import otherDefaultExport, * as starExport from "my-mixed-star";
console.log(defaultExport, someNamedExport, otherDefaultExport, starExport);

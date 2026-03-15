"use server";
import __actionsSetThingMutation from "./__generated__/actionsSetThingMutation.graphql.ts";
import "relay-runtime";
import { revalidatePath } from "next/cache";
//#region packages/relay/tests/fixtures/next-15763-2/input.js
async function setValue(string) {
	const taggedNode = __actionsSetThingMutation;
	console.log({ taggedNode });
	const data = await (await fetch("http://localhost:3000/graphql", {
		body: JSON.stringify({
			query: `
        mutation actionsSetThingMutation($value: String!) {
          setThing(value: $value) {
            name
          }
        }
      `,
			variables: { value: string }
		}),
		headers: { "Content-Type": "application/json" },
		method: "POST"
	})).json();
	console.log(data);
	revalidatePath("/", "page");
}
//#endregion
export { setValue };

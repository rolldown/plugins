import { atom } from "jotai";
function createAtom(ov) {
  const valueAtom = atom(ov);
  const observableValueAtom = atom((get) => {
    const value = get(valueAtom);
    return value;
  },
  (_get, set, nextValue) => {
    set(valueAtom, nextValue);
  });
  return observableValueAtom;
}

const value1Atom = createAtom('Hello String!');
const countAtom = atom(0);

import { atom } from "jotai";

function getAtom() {
    return atom(1);
}
const getAtom2 = () => atom(2);
const getAtom3 = () => { return atom(3) };

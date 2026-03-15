import { atom } from "jotai";

const obj = {
    five: atom(5),
    six: atom(6),
    ...({
        six: atom(66),
    })
};

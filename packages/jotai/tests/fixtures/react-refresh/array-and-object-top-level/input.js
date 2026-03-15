import { atom } from "jotai";

const arr = [
    atom(3),
    atom(4),
];

const obj = {
    five: atom(5),
    six: atom(6),
};

function keepThese() {
    const a = [atom(7)];
    const b = { eight: atom(8) };
}

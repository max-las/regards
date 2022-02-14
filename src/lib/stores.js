import { writable } from 'svelte/store';

export const picture = writable("museum_inside.jpg");
export const nextPicture = writable("children.jpg");
export const currentDialogIndex = writable(0);
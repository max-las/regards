import { writable } from 'svelte/store';

export const currentDialogIndex = writable(0);
export const isAdventure = writable(false);
export const isCredits = writable(false);
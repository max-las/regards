import { writable } from 'svelte/store';

export const currentDialogIndex = writable(25);
export const isAdventure = writable(false);
export const isCredits = writable(false);
export const confirmedMusic = writable(false);

export const musicMenu = writable(null);
export const menuClick = writable(null);
export const musicMuseeExtAmbiance = writable(null);
export const musicMuseeExt = writable(null);
export const musicMuseeAmbiance = writable(null);
export const musicAndre = writable(null);
export const musicCamille = writable(null);
export const musicLeo = writable(null);
export const musicCitation = writable(null);
export const musicIntervenante = writable(null);
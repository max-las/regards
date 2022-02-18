import { writable, get } from 'svelte/store';

export const currentDialogIndex = writable(10);
export const prevDialogIndex = writable(null);
export const forwardDialog = writable(() => {
  let index = get(currentDialogIndex);
  prevDialogIndex.set(index);
  currentDialogIndex.set(index + 1);
});
export const backwardDialog = writable(() => {
  let index = get(currentDialogIndex);
  if(index > 0){
    prevDialogIndex.set(index);
    currentDialogIndex.set(index - 1);
  }
});

export const isAdventure = writable(false);
export const isCredits = writable(false);
export const confirmedMusic = writable(false);

export const currentMusics = writable([]);
export const soundEffects = writable({
  menuClick: null,
  eric: null,
});
import { get } from 'svelte/store';
import { status } from "./stores.js";

/* 
X: {
    text: () => {
      return "X";
    },
    next: () => {
      return dialogs.X;
    }
  },
*/

export const dialogs = {
  begin: {
    text: () => {
      return "Tout commence au musée des beaux arts de Bordeaux.";
    },
    next: () => {
      return dialogs.three_children;
    }
  },
  three_children: {
    text: () => {
      return "Trois enfants sont en visite : Léo, André et Camille.";
    },
    next: () => {
      return dialogs.children_stop;
    }
  },
  children_stop: {
    text: () => {
      return "Ils s’arrêtent devant un tableau qui les intrigue...";
    }
  }
}
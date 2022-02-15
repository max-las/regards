export const wait = (ms) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, ms);
});

export const animationReflow = (domElem) => {
  domElem.style.animation = 'none';
  domElem.offsetHeight; /* trigger reflow */
  domElem.style.animation = null; 
};

export const styleObjToStr = (style) => {
  let styleStr = "";
  for (const [key, value] of Object.entries(style)) {
    styleStr += `${key}: ${value}; `;
  }
};
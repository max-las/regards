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

export const dialogIndexToBgpos = (index) => {
  if((index >= 28 && index <= 40) || index == 56 || index == 62){
    return "top";
  }else{
    return "center";
  }
}

export const iOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export const audioFadeIn = (audio) => {
  if(audio){
    audio.volume = 0;
    audio.play();
    let interval = setInterval(function(){
      let newVolume = audio.volume + 0.1;
      console.log(`fadeIn interval | newVolume: ${newVolume}`);
      if(newVolume >= 1){
        newVolume = 1;
        clearInterval(interval);
        console.log(`fadeIn interval | clear`);
      }
      audio.volume = newVolume;
    }, 300);
    if(typeof audio.fadeInterval !== "undefined"){
      clearInterval(audio.fadeInterval);
      audio.fadeInterval = interval;
    }else{
      Object.defineProperty(audio, "fadeInterval", {
        value: interval,
        writable: true
      });
    }
  }
}

export const audioFadeOut = (audio) => {
  if(audio){
    let interval = setInterval(function(){
      let newVolume = audio.volume - 0.1;
      console.log(`fadeOut interval | newVolume: ${newVolume}`);
      if(newVolume <= 0){
        newVolume = 0;
        clearInterval(interval);
        console.log(`fadeOut interval | clear`);
        audio.pause();
      }
      audio.volume = newVolume;
    }, 300);
    if(typeof audio.fadeInterval !== "undefined"){
      clearInterval(audio.fadeInterval);
      audio.fadeInterval = interval;
    }else{
      Object.defineProperty(audio, "fadeInterval", {
        value: interval,
        writable: true
      });
    }
  }
}
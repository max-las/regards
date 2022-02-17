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
  if(typeof audio.audioCtx === "undefined"){
    setupAudioContext(audio);
  }
  audio.audioGain.gain.value = "0";
  audio.play();
  let interval = setInterval(function(){
    let newVolume = audio.audioGain.gain.value + 0.1;
    if(newVolume >= 1){
      newVolume = 1;
      clearInterval(interval);
    }
    audio.audioGain.gain.value = newVolume;
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

export const audioFadeOut = (audio) => {
  if(typeof audio.audioCtx === "undefined"){
    setupAudioContext(audio);
  }
  let interval = setInterval(function(){
    let newVolume = audio.audioGain.gain.value - 0.1;
    if(newVolume <= 0){
      newVolume = 0;
      audio.pause();
      clearInterval(interval);
    }
    audio.audioGain.gain.value = newVolume;
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

function setupAudioContext(audio){
  Object.defineProperty(audio, "audioCtx", {
    value: new AudioContext(),
    writable: true
  });
  Object.defineProperty(audio, "audioSource", {
    value: audio.audioCtx.createMediaElementSource(audio),
    writable: true
  });
  Object.defineProperty(audio, "audioGain", {
    value: audio.audioCtx.createGain(),
    writable: true
  });
  audio.audioSource.connect(audio.audioGain);
  audio.audioGain.connect(audio.audioCtx.destination);
}
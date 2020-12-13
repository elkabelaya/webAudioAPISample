var arrRes =new Array(10);
var lastValues=new Array(3);
var w = window,
    d = document,
    SMOOTHING = 0.3,
    FURIE = 512;

var elements = [];

class GameBall {
  constructor(size, [x, y],[rotateX,rotateY], handler){
    this.element = d.createElement("div");
    this.element.classList.add("el");
    this.element.addEventListener('click', ()=>{
      this.element.style.visibility = "hidden";
      handler(this.weight);
    });
    this.weight = size;

    this._size = size = size*4;
    this.position = [x, y];
    const style = this.element.style;
    style.left = addPX(x);
    style.top = addPX(y);
    style.width = addPX(size);
    style.height = addPX(size);
    style.borderRadius = addPX(size);
    this.element.style.transformOrigin = `${addPX((rotateX-x)*2)} ${addPX((rotateY-y)*2)}`;
  }

  set position([x,y]){
    const style = this.element.style;
    style.left = addPX(x);
    style.top = addPX(y);
  }

  get position(){
    const style = this.element.style;
    return [getPX(style.left),getPX(style.top)];
  }

  get size(){
    return this._size;
  }

  set size(size){
    size = Math.floor(size);
    if (size<0){
      size = 0;
    }
    this._size = size;
    const style = this.element.style;
    const sizePx = addPX(size);
    style.transform = `-webkit-transform: scale(${addPX(size/this.weigh)});`;

  }
}

class GameCoordinates{
  constructor(gameField){
    this.originX = gameField.clientWidth/2;
    this.originY = gameField.clientHeight/2;
  }

  getRotateCenter(){
    return [this.originX, this.originY];

  }
  getCoordinates(x,y){
    return [x*this.originX + this.originX, y*this.originY +this.originY ];
  }
}

class AudioAnaliser  {
    constructor(audioTag){
      AudioContext = w.AudioContext || w.webkitAudioContext;
      document.getElementsByClassName("song")[0].addEventListener('click', () => {
        this.context.resume().then(() => {
          console.log('Playback resumed successfully');
        });
      });
      this.audio = audioTag;

      this.context = new AudioContext();
      this.node = this.context.createScriptProcessor(2048, 1, 1);
      //Анализатор
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = SMOOTHING;
      this.analyser.fftSize = FURIE;

      this.bands = new Float32Array(this.analyser.fftSize);//new Uint8Array(this.analyser.frequencyBinCount);

      this.audio.addEventListener('canplay', () => {
          if (!this.source) {
              this.source = this.context.createMediaElementSource(this.audio);

              this.source.connect(this.analyser);
              this.analyser.connect(this.node);
              this.node.connect(this.context.destination);
              this.source.connect(this.context.destination);

              this.node.onaudioprocess = () => {
                //  this.analyser.getByteFrequencyData(this.bands);
                 this.analyser.getFloatTimeDomainData(this.bands);
                  if (!this.audio.paused) {
                      return typeof this.update === "function" ? this.update(this.bands) : 0;
                  }
              };
          }
      });
    }
};

class AudioGame {

  constructor () {

      const input = d.getElementsByClassName('song')[0];
      const audio = d.getElementsByClassName('audio')[0];
      const result = d.getElementsByClassName('result')[0];
      const gameField = d.getElementsByClassName('game-field')[0];
      const audioAnaliser = new AudioAnaliser(audio);
      const gameCoordinates = new GameCoordinates(gameField);

      const interval = setInterval(()=>{

          elements.forEach((element, i) => {
             window.requestAnimationFrame(()=>{
              element.size = element.size - element.weight;
            })

            if (element.size <= 2){
              gameField.removeChild(element.element);
              elements = elements.filter(item => item !== element)
            }
          });

      }, 500);


            input.addEventListener('change', function () {
                var song = this.value,
                    fReader = new FileReader();

                fReader.readAsDataURL(this.files[0]);
                fReader.onloadend = function (event) {
                    var e = event || w.event;
                    audio.src = e.target.result;
                    audio.load();
                };
            }, false);

            audioAnaliser.update = function (bands) {
              appendValueToArray (arrRes, Math.max(...bands));
              const value = Math.max(...arrRes);
              const average = getAverage(lastValues);

              appendValueToArray (lastValues, value);

              if (value > average + 0.05){

                  const gameBall = new GameBall( Math.max(...arrRes)*10,
                                                 gameCoordinates.getCoordinates(bands[0],bands[Math.floor(Math.random()*255)]),
                                                 gameCoordinates.getRotateCenter(),
                                                 (weight) => {
                                                   console.log(result.innerHTML,weight)
                                                   result.textContent = +result.innerHTML + weight;
                                                 }
                                                );
                  elements.push(gameBall);

                  window.requestAnimationFrame(()=>{
                    gameField.appendChild(gameBall.element)
                  });
              }


            };


    }

};



w.onload = function () {
    const game = new AudioGame();

};

const getPX = function (value){
    return +value.replace("px","");
}

const addPX = function (value){
  return value + "px";
}

const getAverage = function (values) {
  const total = values.reduce((acc, c) => acc + c, 0);
  return total / values.length;
}

const appendValueToArray = function (array, value){
  array.push(value);
  array.shift();
}

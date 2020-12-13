var arrRes =new Array(10);
var lastValues=new Array(3);
var w = window,
    d = document,
    SMOOTHING = 0.3,
    FURIE = 512;

var elements = [];

class GameBall {
  constructor(size, [x, y],[rotateX,rotateY]){
    this.element = d.createElement("div");
    this.element.classList.add("el");
    this.weight = size;

    this.size = size*4;
    this.position = [x, y];
    this.element.style.left = addPX(x);
    this.element.style.top = addPX(y);
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
    return getPX(this.element.style.width);
  }

  set size(size){
    size = Math.floor(size);
    if (size<0){
      size = 0;
    }
    const style = this.element.style;
    const sizePx = addPX(size);
    style.width = sizePx;
    style.height = sizePx;
    style.borderRadius = sizePx;

  }
}

class GameCoordinates{
  constructor(gameField){
    this.originX = gameField.clientWidth/2;
    this.originY = gameField.clientHeight/2;
  }

  getMoveDirection(x,y){

    const originX = this.originX;
    const originY = this.originY;
    //console.log("getMoveDirection", x,y, originX, originY);
    if (x >= originX && y < originY){
      return [+1, +1];
    } else if (x >= originX && y >= originY){
      return [-1, +1];
    } else if (x < originX && y >= originY){
      return [-1, -1];
    } else {
      return [+1, -1];
    }

  }
  getRotateCenter(){
    return [this.originX, this.originY];

  }
  getCoordinates(x,y){
      console.log("getCoordinates", x,y, x*this.originX + this.originX, y*this.originY +this.originY);
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
      const gameField = d.getElementsByClassName('game-field')[0];
      const audioAnaliser = new AudioAnaliser(audio);
      const gameCoordinates = new GameCoordinates(gameField);

      const interval = setInterval(()=>{

          elements.forEach((element, i) => {
            const [x, y] = element.position;
            const [directionX, directionY] = gameCoordinates.getMoveDirection(x, y);

            //console.log("element.size - element.weight", element.size,element.weight)
            element.size = element.size - element.weight;
            //element.position = [x + directionX*Math.random()*10, y + directionY*Math.random()*10];
            if (element.size <= 2){
              gameField.removeChild(element.element);
              elements = elements.filter(item => item !== element)
            }
          });

      }, 200);


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
                                                 gameCoordinates.getRotateCenter()
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

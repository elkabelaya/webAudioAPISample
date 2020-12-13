var arrRes =new Array(10);
var lastValues=new Array(3);
var w = window,
    d = document,
    SMOOTHING = 0.3,
    FURIE = 512;

var elements = [];

class GameBall {
  constructor(size, x, y){
    this.element = d.createElement("div");
    this.element.classList.add("el");
    this.weight = size;

    this.size = size*4;
    this.position = [x, y];
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
    this.element.textContent = size;
    style.width = sizePx;
    style.height = sizePx;
    style.borderRadius = sizePx;
  }
}

class GameCoordinates{
  constructor(gameField){
    this.originX = gameField.style.width/2;
    this.originY = gameField.style.height/2;
  }

  getMoveDirection(x,y){
    const originX = this.originX;
    const originY = this.originY;
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
}

class AudioAnaliser  {
    constructor(){
      AudioContext = w.AudioContext || w.webkitAudioContext;
      document.getElementsByClassName("song")[0].addEventListener('click', () => {
        this.context.resume().then(() => {
          console.log('Playback resumed successfully');
        });
      });
      this.audio = new Audio();
      this.audio.controls = true;

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

var WoolAnalaser = function () {

    var

    audio = null,

    input = d.getElementsByClassName('song')[0],
    that = this;



    this.init = function () {

        var audio = null;
        var interval = setInterval(()=>{

            elements.forEach((element, i) => {
              const [x, y] = element.position;
              console.log("element.size - element.weight", element.size,element.weight)
              element.size = element.size - element.weight;
              element.position = [x + Math.random()*10, y + Math.random()*10];
              if (element.size <= 2){
                document.body.removeChild(element.element);
                elements = elements.filter(item => item !== element)
              }
            });

        }, 200);


            audio = new AudioAnaliser();
            d.body.appendChild(audio.audio);

            input.addEventListener('change', function () {
                var song = this.value,
                    fReader = new FileReader();

                fReader.readAsDataURL(this.files[0]);
                fReader.onloadend = function (event) {
                    var e = event || w.event;
                    audio.audio.src = e.target.result;
                    audio.audio.load();
                };
            }, false);

            audio.update = function (bands) {
              arrRes.push(Math.max(...bands));
              arrRes.shift();

              var element = document.getElementsByClassName('el')[0];
              function step(timestamp) {
                var value = Math.max(...arrRes);
                function getAvg(grades) {
                  const total = grades.reduce((acc, c) => acc + c, 0);
                  return total / grades.length;
                }

                const average = getAvg(lastValues);
                if (value > average + 0.1){
                    const gameBall = new GameBall(Math.max(...arrRes)*10,
                                                  150 + Math.abs(bands[0])*1000,
                                                  150 + Math.abs(bands[1])*1000
                                                );

                    d.body.appendChild(gameBall.element);
                    elements.push(gameBall);
                }
                lastValues.push(value);
                lastValues.shift();

              }

              window.requestAnimationFrame(step);

            };


    }

};



w.onload = function () {
    var analyser = new WoolAnalaser ();

    analyser.init(d.querySelector('#target'));
};

const getPX = function (value){
    return +value.replace("px","");
}

const addPX = function (value){
  return value + "px";
}

var arrRes =new Array(10);
var lastValues=new Array(3);
var w = window,
    d = document,
    SMOOTHING = 0.3,
    FURIE = 512;

var elements = [];

    var WoolAnalaser = function () {
        "use strict";
        var ctx = null,
        canva = null,
        config = null,
        particles = [],
        rope = null,
        birds = [],
        audio = null,
        freeSpace = w.innerWidth,
        input = d.querySelector('#song'),
        that = this;


        config = this.config = {
            fullscreen: true,
            interval: 10,
            type: "canvas"
        };
        /*
        * Конструктор анализатора
        */
        var Analyse = function () {
            var _that = this,
            AudioContext = w.AudioContext || w.webkitAudioContext;
            document.getElementsByClassName("button")[0].addEventListener('click', function() {
              _that.context.resume().then(() => {
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

            this.audio.addEventListener('canplay', function () {
                if (!_that.source) {
                    _that.source = _that.context.createMediaElementSource(_that.audio);

                    _that.source.connect(_that.analyser);
                    _that.analyser.connect(_that.node);
                    _that.node.connect(_that.context.destination);
                    _that.source.connect(_that.context.destination);

                    _that.node.onaudioprocess = function () {
                      //  _that.analyser.getByteFrequencyData(_that.bands);
                       _that.analyser.getFloatTimeDomainData(_that.bands);
                        if (!_that.audio.paused) {
                            return typeof _that.update === "function" ? _that.update(_that.bands) : 0;
                        }
                    };
                }
            });

            return this;
        };

        this.init = function () {

            var audio = null;
          /*  var interval = setInterval(()=>{
                elements.forEach((item, i) => {
                  size = item.width -
                });

            });*/
            try {
                audio = new Analyse();
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
                  if ( Math.max(...arrRes) >0.7){
                    console.log("audio.update", Math.max(...arrRes));

                  }
                  var element = document.getElementsByClassName('el')[0];
                  function step(timestamp) {
                    var value = Math.max(...arrRes);
                    function getAvg(grades) {
                      const total = grades.reduce((acc, c) => acc + c, 0);
                      return total / grades.length;
                    }

                    const average = getAvg(lastValues);
                    if (value > average + 0.1){
                        var size = `${Math.max(...arrRes) *40}px`;

                        var positionX = `${150 + Math.abs(bands[Math.round(Math.random()*255)])*1000}px`;
                        var positionY = `${150 + Math.abs(bands[Math.round(Math.random()*255)])*1000}px`;
                        console.log(positionX, positionY);
                        let element = d.createElement("div");
                        element.classList.add("el");
                        element.style.width = size;
                        element.style.height = size;
                        element.style.borderRadius = size;

                        element.style.left = positionX;
                        element.style.top = positionY;
                        element.textContent = Math.floor(Math.max(...arrRes)*10);
                        element.weight = 10 - Math.floor(Math.max(...arrRes)*10);
                        d.body.appendChild(element);
                    }
                    lastValues.push(value);
                    lastValues.shift();

                  }

                  window.requestAnimationFrame(step);

                };
            } catch (e) {
                throw ('Ваш барузер не поддержывает audio Api');
            }
            setInterval(that.action, this.config.interval);
        }

    };


w.onload = function () {
    var analyser = new WoolAnalaser ();
    analyser.init(d.querySelector('#target'));
};

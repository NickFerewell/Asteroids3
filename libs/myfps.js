class myFPS{
    constructor(averageSize){
        this.startTime = 0;
        this.endTime = 0;
        this.timeDiff = 0;
        this.FPS = 0;
        this.average = [];
        this.averageSize = averageSize || 5;
    }

    start(){ //Вызвать эту функцию в начале gameloop'а, чтобы измерять только время на его обновление
        this.startTime = performance.now();
    }

    update(){
        // this.endTime = performance.now();
        // this.timeDiff = this.endTime - this.startTime;
        // if(this.timeDiff == 0) {this.timeDiff = 1000};
        // console.log(this.timeDiff)
        // this.FPS = parseInt(1000 / (this.timeDiff));

        this.endTime = performance.now();
        this.timeDiff = this.endTime - this.startTime;
        if (this.timeDiff == 0) this.timeDiff = 1000;
        this.FPS = parseInt(1000 / (this.timeDiff));
        this.startTime = this.endTime;
        //console.log(this.timeDiff, this.FPS)
        this.updateAverage(this.FPS);
    }

    updateAverage(FPS) {
        this.average.unshift(FPS);
        this.average = this.average.slice(0, this.averageSize);
    }

    getFPS() {
        return this.FPS;
    }

    getAverageFPS() {
        var total = 0;
        var size = this.average.length;
        for (var i = 0; i < size; i++) {
            total += this.average[i];
        }
        return parseInt(total / size);
    }
}
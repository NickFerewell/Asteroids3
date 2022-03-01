class PIDController{
    constructor(Kp = 1, Ki = 0, Kd = 0, dt = 1){
        this.dt = dt;
        this.Kp = Kp;
        this.Ki = Ki;
        this.Kd = Kd;
        this.prevError = 0;
        this.integral = 0; //Интеграл от 0 до контроллируемой переменной
    }

    calculate(value, target){
        const error = target - value;

        const P = this.Kp * error;

        this.integral += error * this.dt;
        const I = this.Ki * this.integral;

        const derivative = (error - this.prevError)/this.dt;
        const D = this.Kd * derivative;
        
        const output = P + I + D;

        this.prevError = error;


        // console.log(value, target, output)
        return output;
    }
}
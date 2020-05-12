class BdvNodeInput {
    constructor(questionList) {
        this._rl = null;
        this.questions = questionList || ["y no question?"];
        this.answerList = [];
    }

    flush(questionList) {
        this.questions = questionList || ["y no question?"];
        this.answerList = [];
        return this;
    }

    removeColor() {
        this.color = "\x1b[0m"
    }

    setTag(tag) {
        this.tag = tag;
    }

    setColor(color) {
        this.color = color;
        switch (this.color.toUpperCase()) {
            case 'BRIGHT': this.color = "\x1b[1m";
                break;
            case 'DIM': this.color = "\x1b[2m"
                break;
            case 'UNDERSCORE': this.color = "\x1b[4m"
                break;
            case 'BLINK': this.color = "\x1b[5m"
                break;
            case 'FBLACK': this.color = "\x1b[30m"
                break;
            case 'FRED': this.color = "\x1b[31m"
                break;
            case 'FGREEN': this.color = "\x1b[32m"
                break;
            case 'FYELLOW': this.color = "\x1b[33m"
                break;
            case 'FBLUE': this.color = "\x1b[34m"
                break;
            case 'FMAGENTA': this.color = "\x1b[35m"
                break;
            case 'FCYAN': this.color = "\x1b[36m"
                break;
            case 'FWHITE': this.color = "\x1b[37m"
                break;
            case 'BBLACK': this.color = "\x1b[40m"
                break;
            case 'BRRED': this.color = "\x1b[41m"
                break;
            case 'BGREEN': this.color = "\x1b[42m"
                break;
            case 'BYELLOW': this.color = "\x1b[43m"
                break;
            case 'BBLUE': this.color = "\x1b[44m"
                break;
            case 'BMAGENTA': this.color = "\x1b[45m"
                break;
            case 'BCYAN': this.color = "\x1b[46m"
                break;
            case 'BWHITE': this.color = "\x1b[47m"
                break;
        }
    }

    question(msg, index) {
        return new Promise((resolve, reject) => {
            console.log((this.color || "") + (this.tag || "") + msg + ":");
            msg = "";
            this._rl.question(msg, (answer) => {
                this.answerList.push(answer);
                if (!this.questions[index + 1]) {
                    this._rl.close();
                    return resolve(this.answerList);
                }
                index++;
                resolve(this.question(this.questions[index], index));
            })
        });
    }

    startAsking() {
        return new Promise((resolve, reject) => {
            this._rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });
            resolve(this.question(this.questions[0], 0));
        })
    }
}
module.exports = BdvNodeInput;
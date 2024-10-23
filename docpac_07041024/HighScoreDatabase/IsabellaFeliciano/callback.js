var answer = '';

function doLongTask(callback) {
    console.log("Getting your answer now...");
    setTimeout(() => { answer = 'Yes'; callback(); }, 3000);
}

var printAnswer = () => { console.log(`Yout answer is ${answer}`); };

doLongTask(printAnswer);
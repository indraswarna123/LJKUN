const fs = require("fs");

function getByteArray(filePath) {
  let fileData = fs.readFileSync(filePath).toString("hex");
  let result = [];
  for (var i = 0; i < fileData.length; i += 2)
    result.push("0x" + fileData[i] + "" + fileData[i + 1]);
  return result;
}

result = getByteArray("20181115-input.pgm");
var header = ["P2", "820 544", "1"];
var RGB = 256;
var occurence = {};

//Start globalTrehholding
for (i = 0; i < RGB; i++) {
  occurence[i] = 0;
}

for (var i = 0; i < result.length; i++) {
  if (i > 14) {
    let string = result[i];
    let parsedInt = parseInt(string);
    occurence[parsedInt] += 1;
  }
}
let currentTLoop = (RGB - 1) / 2;
let currentM1 = 0;
let currentM1Upper = 0;
let currentM1Lower = 0;
let currentM2 = 0;
let currentM2Upper = 0;
let currentM2Lower = 0;
let breakingBool = true;
var tLoop = {
  0: {
    T: currentTLoop,
    M1: 0,
    M2: 0
  }
};
while (breakingBool) {
  for (var i = 0; i < Object.keys(occurence).length; i++) {
    if (i < currentTLoop) {
      currentM1Upper += occurence[i] * i;
      currentM1Lower += occurence[i];
    } else {
      currentM2Upper += occurence[i] * i;
      currentM2Lower += occurence[i];
    }
    if (i == Object.keys(occurence).length - 1) {
      currentM1 = currentM1Upper / currentM1Lower;
      currentM2 = currentM2Upper / currentM2Lower;
      if (isNaN(currentM1)) {
        currentM1 = 0;
      }
      if (isNaN(currentM2)) {
        currentM2 = 0;
      }
      let nextTLoop = Math.round((currentM1 + currentM2) / 2);
      if (Object.keys(tLoop).length == 1) {
        tLoop[0].T = currentTLoop;
        tLoop[0].M1 = currentM1;
        tLoop[0].M2 = currentM2;

        tLoop[Object.keys(tLoop).length] = {
          T: 0,
          M1: 0,
          M2: 0
        };
        tLoop[Object.keys(tLoop).length - 1].T = nextTLoop;
      } else {
        tLoop[Object.keys(tLoop).length - 1].M1 = currentM1;
        tLoop[Object.keys(tLoop).length - 1].M2 = currentM2;
        tLoop[Object.keys(tLoop).length] = {
          T: 0,
          M1: 0,
          M2: 0
        };
        tLoop[Object.keys(tLoop).length - 1].T = nextTLoop;
      }
      if (nextTLoop == currentTLoop) {
        breakingBool = false;
        break;
      } else {
        currentTLoop = nextTLoop;
      }
    }
  }
}

//End Global Threhsolding
// console.log(tLoop);
// console.log(result.length);

var onlyImage = [];

for (var i = 0; i < result.length; i++) {
  if (i > 14) {
    let string = result[i];
    let parsedInt = parseInt(string);
    if (parsedInt < tLoop[Object.keys(tLoop).length - 1].T) {
      //   header.push(1);
      onlyImage.push(1);
    } else {
      onlyImage.push(0);
      //   header.push(0);
    }
  }
}

var parsedImage = [];
var copyImage = [];
var blurredMedianHolder = [];
tempPixel = 0;

for (i = 0; i < 544; i++) {
  for (j = 0; j < 820; j++) {
    if (!parsedImage[i]) {
      parsedImage[i] = [];
      copyImage[i] = [];
      blurredMedianHolder[i] = [];
    }
    parsedImage[i][j] = onlyImage[tempPixel];
    copyImage[i][j] = 0;
    blurredMedianHolder[i][j] = 0;
    tempPixel++;
  }
}

//Start Blurring

for (i = 0; i < 544; i++) {
  for (j = 0; j < 820; j++) {
    tempMedian = 0;
    tempIsFalse = true;
    tempWidth = i;
    tempHeight = j;
    for (k = 0; k < 3; k++) {
      for (l = 0; l < 3; l++) {
        if (l == 0) {
          if (typeof parsedImage[tempWidth - 1] !== "undefined") {
            if (
              typeof parsedImage[tempWidth - 1][tempHeight - 1] !== "undefined"
            ) {
              tempMedian += parsedImage[tempWidth - 1][tempHeight - 1];
            }
          } else {
            tempIsFalse = false;
          }
        } else if (l == 1) {
          if (typeof parsedImage[tempWidth] !== "undefined") {
            if (typeof parsedImage[tempWidth][tempHeight] !== "undefined") {
              tempMedian += parsedImage[tempWidth][tempHeight];
            }
          } else {
            tempIsFalse = false;
          }
        } else {
          if (typeof parsedImage[tempWidth + 1] !== "undefined") {
            if (
              typeof parsedImage[tempWidth + 1][tempHeight + 1] !== "undefined"
            ) {
              tempMedian += parsedImage[tempWidth + 1][tempHeight + 1];
            }
          } else {
            tempIsFalse = false;
          }
        }
      }
    }

    if (tempIsFalse) {
      tempMedian = tempMedian / 9;
      //   console.log(tempMedian);
      blurredMedianHolder[i][j] = Math.round(tempMedian);
    }
  }
}

for (i = 0; i < 544; i++) {
  for (j = 0; j < 820; j++) {
    if (blurredMedianHolder[i][j] == 0) {
      parsedImage[i][j] = 0;
    }
  }
}

//End Blurring

//Start Component Detection

function recursiveAddSequence(i, j, array) {
  if (parsedImage[i + 1][j] == 1 && copyImage[i + 1][j] == 0) {
    array.push([i + 1, j]);
    copyImage[i + 1][j] = label;
  }
  if (parsedImage[i][j + 1] == 1 && copyImage[i][j + 1] == 0) {
    array.push([i, j + 1]);
    copyImage[i][j + 1] = label;
  }
  if (parsedImage[i - 1][j] == 1 && copyImage[i - 1][j] == 0) {
    array.push([i - 1, j]);
    copyImage[i - 1][j] = label;
  }
  if (parsedImage[i][j - 1] == 1 && copyImage[i][j - 1] == 0) {
    array.push([i, j - 1]);
    copyImage[i][j - 1] = label;
  }
}

for (i = 0; i < 120; i++) {
  for (j = 0; j < 820; j++) {
    parsedImage[i][j] = 0;
  }
}

let label = 0;
let labelPixelFirstOccurence = {};
for (i = 1; i < 544 - 1; i++) {
  for (j = 1; j < 820 - 1; j++) {
    tempWidth = i;
    tempHeight = j;

    if (parsedImage[i][j] == 1 && copyImage[i][j] == 0) {
      //   console.log("Run " + i, j);
      label++;
      let arrayDilate = [];
      //   if(!labelPixelFirstOccurence)
      labelPixelFirstOccurence[label] = [i, j];
      arrayDilate.push([i, j]);

      copyImage[i][j] = label;
      for (var x = 0; x < arrayDilate.length; x++) {
        recursiveAddSequence(arrayDilate[x][0], arrayDilate[x][1], arrayDilate);
      }
      //   console.log("end run");
    }
  }
}
console.log(label);
var labelOccurence = {};
var numberLabel = {};
// for (let i = 0; i < label; i++) {
//   labelOccurence[i] = 0;
// }
for (i = 0; i < 544; i++) {
  for (j = 0; j < 820; j++) {
    // if (copyImage[i][j] > 0) console.log(copyImage[i][j]);
    if (!labelOccurence[copyImage[i][j]]) {
      labelOccurence[copyImage[i][j]] = 0;
    }
    labelOccurence[copyImage[i][j]] += 1;
  }
}

var kunciJawaban = {
  row1: {
    B: 102,
    C: 123,
    D: 146,
    E: 172
  },
  row2: {
    A: 258,
    B: 276,
    C: 300,
    D: 324
  },
  row3: {
    A: 429,
    B: 453,
    C: 479,
    D: 500,
    E: 530
  },
  row4: {
    A: 608,
    B: 633,
    D: 677,
    E: 701
  }
};

indexYandObjectNumber = {};
labelNumber = 1;
tempJump = 0;
tempJumpIndex = 4;
watchTempJumpIndex = 0;
for (let i = 1; i <= label; i++) {
  if (labelOccurence[i] < 100) {
    delete labelOccurence[i];
    delete labelPixelFirstOccurence[i];
  } else {
    let currentAnswer = "0";
    if(i == 1496){
      let temp = labelPixelFirstOccurence[i];
      labelPixelFirstOccurence[i] = labelPixelFirstOccurence[1497];
      labelPixelFirstOccurence[1497] = temp;
    }
    if (labelNumber <= 15) {
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row1.B - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row1.B + 10
      ) {
        currentAnswer = "B";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row1.C - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row1.C + 10
      ) {
        currentAnswer = "C";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row1.D - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row1.D + 10
      ) {
        currentAnswer = "D";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row1.E - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row1.E + 10
      ) {
        currentAnswer = "E";
      }
    } else if (labelNumber >= 16 && labelNumber <= 30) {
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row2.A - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row2.A + 10
      ) {
        currentAnswer = "A";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row2.B - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row2.B + 10
      ) {
        currentAnswer = "B";
      }
      console.log(labelNumber + " pix y : " + labelPixelFirstOccurence[i][1]);
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row2.C - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row2.C + 10
      ) {
        currentAnswer = "C";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row2.D - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row2.D + 10
      ) {
        currentAnswer = "D";
      }
    } else if (labelNumber >= 31 && labelNumber <= 45) {
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row3.A - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row3.A + 10
      ) {
        currentAnswer = "A";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row3.B - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row3.B + 10
      ) {
        currentAnswer = "B";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row3.C - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row3.C + 10
      ) {
        currentAnswer = "C";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row3.D - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row3.D + 10
      ) {
        currentAnswer = "D";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row3.E - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row3.E + 10
      ) {
        currentAnswer = "E";
      }
    } else if (labelNumber >= 46 && labelNumber <= 50) {
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row4.A - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row4.A + 10
      ) {
        currentAnswer = "A";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row4.B - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row4.B + 10
      ) {
        currentAnswer = "B";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row4.D - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row4.D + 10
      ) {
        currentAnswer = "D";
      }
      if (
        labelPixelFirstOccurence[i][1] >= kunciJawaban.row4.E - 10 &&
        labelPixelFirstOccurence[i][1] <= kunciJawaban.row4.E + 10
      ) {
        currentAnswer = "E";
      }
    }
    indexYandObjectNumber[i] = {
      number: labelNumber,
      index: labelPixelFirstOccurence[i],
      answer: currentAnswer
    };
    tempJump++;
    // console.log(tempJump);
    // console.log(watchTempJumpIndex);
    if (watchTempJumpIndex >= 5) {
      if (tempJump == 3) {
        tempJump = 0;
        labelNumber++;
        labelNumber = labelNumber - 30;
      } else {
        labelNumber = labelNumber + 15;
      }
    } else {
      if (tempJump == 4) {
        tempJump = 0;
        labelNumber++;
        labelNumber = labelNumber - 45;
        watchTempJumpIndex++;
        console.log(watchTempJumpIndex);
      } else {
        labelNumber = labelNumber + 15;
      }
    }
  }
}

console.log(Object.keys(labelOccurence).length);

var orderedAnswer = [];
let countKey = 1;
for( var i = 1; i <=50;i++){
  for( var keys in indexYandObjectNumber){
    if(indexYandObjectNumber[keys].number == i){
      orderedAnswer.push(indexYandObjectNumber[keys])
    }
  }
}

console.log(orderedAnswer);

for (i = 0; i < 544; i++) {
  for (j = 0; j < 820; j++) {
    header.push(parsedImage[i][j]);
  }
}

let finalResult = header
  .toString()
  .split(",")
  .join("\n");
fs.writeFile("LJK.pgm", finalResult, err => {
  if (err) throw err;
});

fs.writeFile("AnswerLog.txt",JSON.stringify(orderedAnswer),err=>{
  if(err) throw err;
});


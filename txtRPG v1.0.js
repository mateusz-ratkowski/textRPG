const fs = require('fs');
const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let GAME_ENDED = false;
let GAME_PAUSED = true;

let CHOSEN_FILE = "";

let file;
let color = 0;

let OMEGA = 0;
let storyObjectsArray = [];
let flags = {};

function load() {
  fs.readdir('./', (err, files) => {
    for (let i = 0; i < files.length; i++) {
      console.log((i + 1) + ". " + files[i]);
    }

    rl.question("Wybierz numer: ", (number) => {
      if (number <= files.length && number > 0) {
        CHOSEN_FILE = files[number - 1];
      } else {
        console.log("Err");
        rl.close();
      }
        main();
    });
  });
}

load();

function main() {
    fs.readFile(CHOSEN_FILE, 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        file = data;

        function separator(sentence, type) {
          if (type == "char") {
            if (typeof(sentence) == "string") {
              return sentence.split('');
            } else {
              errorF("argument in separator is not a string!");
            }
          } else if (type == "word") {
            if (typeof(sentence) == "string") {
              return sentence.split(' ');
            } else {
              errorF("argument in separator is not a string!");
            }
          }
        }

        function reductor(array, symbols) {
          let temporaryArray = [];
          for (i = 0; i < array.length; i++) {
            if (!(symbols.includes(array[i]))) {
              temporaryArray.push(array[i]);
            }
          }
          return temporaryArray;
        }

        function searcher (source, target, type, startDistance, endDistance) {
          if (startDistance === undefined || isNaN(startDistance)) {
            startDistance = 0;
          }
          if (endDistance === undefined || isNaN(endDistance)) {
            endDistance = source.length
          }
          if (typeof(target) != "string") {
            errorF("searcher - target is not a string!");
          }

          if (type != "different") {
            source = separator(source, "char");
          }

          let targetLength = target.length;
          let searchingPart = "";

          if (type == "onceSame") {
            for (i = startDistance; i < endDistace; i++) {
              for (partOfTarget = i; partOfTarget < targetLength + i; partOfTarget++) {
                searchingPart = searchingPart + source[partOfTarget];
              }
              if (searchingPart == target) {
                return {
                  start: i,
                  end: i + targetLength
                };
              }
              searchingPart = '';
            }
          } else if (type == "multipleSame") {

            let results = [];

            for (i = startDistance; i < endDistance; i++) {
              for (let partOfTarget = i; partOfTarget < targetLength + i; partOfTarget++) {
                searchingPart = searchingPart + source[partOfTarget];
              }
              if (searchingPart == target) {
                results.push({
                  start: i,
                  end: i + targetLength
                });
              }
              searchingPart = '';
            }
            if (!(results.length == 0)) {
              return results;
            }
          } else if (type == "different") {
            //zrób to
          }
        }

        let wtArray = searcher(file, "wt:", "multipleSame");
        let openBracketArray = searcher(file, "{", "multipleSame");
        let closeBracketArray = searcher(file, "}", "multipleSame");
        //let arrowArray = searcher(file, "->", "multipleSame");

        if (!(wtArray.length == openBracketArray.length && openBracketArray.length == closeBracketArray.length)) {
          errorF('number of "{}" and "wt:" is not equal!');
        }

        function wtGruping() {
          let storyLength = wtArray.length;
          for (let i = 0; i < storyLength; i++) {
            let arrowArray = searcher(file, "->", "multipleSame", openBracketArray[i].start + 1, closeBracketArray[i].start);
            let semicolonArray = searcher(file, ";", "multipleSame", file.indexOf("->", openBracketArray[i].start + 1), closeBracketArray[i].start);
            let answersArray = [];
            for (let a = 0; a < arrowArray.length; a++) {

              let preConditions = [];
              let postConditions = [];
              function conditionsDefining(starsArray, position) {
                if (starsArray !== undefined) {
                  if (starsArray.length % 2 == 0) {
                    if (starsArray.length >= 2) {
                      for (let b = 0; b < starsArray.length; b += 2) {
                        if (position == "pre") {
                          preConditions.push((file.slice(starsArray[b].end, starsArray[b + 1].start)).trim());
                        } else if (position == "post") {
                          postConditions.push((file.slice(starsArray[b].end, starsArray[b + 1].start)).trim());
                        }
                      }
                    }
                  } else {
                    errorF("wrong number of stars in name of posible answer!");
                  }
                }
              }
              conditionsDefining(searcher(file, "*", "multipleSame", arrowArray[a].end, semicolonArray[a * 2].start), "pre");
              conditionsDefining(searcher(file, "*", "multipleSame", semicolonArray[a * 2].end, semicolonArray[a * 2 + 1].start), "post");

              let contentWithConditions = (file.slice(arrowArray[a].end, semicolonArray[a * 2].start)).trim();
              let contentWithoutCondisions = "";

              if (contentWithConditions.includes("*")) {
                contentWithoutCondisions = contentWithConditions.slice(0, contentWithConditions.indexOf("*")).trim();
              } else {
                contentWithoutCondisions = contentWithConditions.trim();
              }

              let resultWithConditions = (file.slice(semicolonArray[a * 2].start + 1, semicolonArray[a * 2 + 1].start)).trim();
              let resultWithoutConditions = "";

              if (resultWithConditions.includes("*")) {
                resultWithoutConditions = resultWithConditions.slice(0, resultWithConditions.indexOf("*")).trim();
              } else {
                resultWithoutConditions = resultWithConditions.trim();
              }


              answersArray.push({
                content: contentWithoutCondisions,
                result: resultWithoutConditions,
                preConditions: preConditions,
                postConditions: postConditions
              });
            }

            let content = file.slice(openBracketArray[i].start + 1, file.indexOf("<-", openBracketArray[i].start + 1));

            storyObjectsArray.push({
              title: (file.slice(wtArray[i].end, openBracketArray[i].start)).trim(),
              content: content,
              answers: answersArray,
              offAnswers: []
            });
          }
        }

        flags = {
          startIndex: file.indexOf("["),
          endIndex:  file.indexOf("]"),
          flagSpace: file.slice(file.indexOf("[") + 1, file.indexOf("]")),
          array: []
        }

        function flagDefining() {

          //propozycja porzucenia pomysłu oznaczania zmiennej string "", ponieważ istnieje ryzyko położenia spacji wewnątrz "" w nieodpowiedni sposób a w następstwie błędów
          // !!!

          let starsArray = searcher(flags.flagSpace, "*", "multipleSame");
          let colonArray = searcher(flags.flagSpace, ":", "multipleSame");
          if (starsArray.length % 2 == 0 && starsArray.length == 2 * colonArray.length) {
            for (let i = 0; i < colonArray.length; i++) {
              let type;
              if (((flags.flagSpace.slice(colonArray[i].end, starsArray[i * 2 + 1].start)).trim()) === "true" ||((flags.flagSpace.slice(colonArray[i].end, starsArray[i * 2 + 1].start)).trim()) === "false") {
                type = "boolean";
              } else if (((flags.flagSpace.slice(colonArray[i].end, starsArray[i * 2 + 1].start)).trim()).includes('"')) {
                type = "string";
              } else {
                if (/\d/.test((flags.flagSpace.slice(colonArray[i].end, starsArray[i * 2 + 1].start)).trim())) {
                  type = "number";
                } else {
                  type = "undefined";
                }
              }
              flags.array.push({
                name: (flags.flagSpace.slice(starsArray[i * 2].end, colonArray[i].start)).trim(),
                value: (flags.flagSpace.slice(colonArray[i].end, starsArray[i * 2 + 1].start)).trim(),
                type: type
              });
            }
          } else {
            errorF('incorrect number of "*"');
            return null;
          }
        }

        function flagChecking(state) {
          //let type = "";
          //for (let i = 0; i < flags.array.length; i++) {
          //  if (state.includes("==")) {
          //    type = "equal";
          //  } else if (state.includes(">")) {
          //    type = "more";
          //  } else if (state.includes("<")) {
          //    type = "less";
          //  } else if (state.includes(">=")) {
          //    type = "eqMore";
          //  } else if (state.includes("<=")) {
          //    type = "eqLess";
          //  }
          //}
        }

        wtGruping();
        flagDefining();

        GAME_PAUSED = false;

        console.log(flags);
        console.log(storyObjectsArray);

        draw();
        function errorF(error) {
          console.log(error);
          rl.close();
        }
    });

    //jeżeli dochodzić ma do nasłuchiwania zdarzeń rl.close(); nie może być ustawione aby aktywować się autowatycznie !!!

    //rl.close();
}

function offAnswersFunction(i) {

  let targetNumberOfConditions = storyObjectsArray[OMEGA].answers[i].preConditions.length;
  let numberOfPositiveConditions = 0;
  storyObjectsArray[OMEGA].offAnswers.length = 0;

  for (let a = 0; a < storyObjectsArray[OMEGA].answers[i].preConditions.length; a++) {

    let name = storyObjectsArray[OMEGA].answers[i].preConditions[a].slice(0, storyObjectsArray[OMEGA].answers[i].preConditions[a].indexOf(":")).trim();
    let value = storyObjectsArray[OMEGA].answers[i].preConditions[a].slice(storyObjectsArray[OMEGA].answers[i].preConditions[a].indexOf(":") + 1).trim();
    //console.log(value);

    for (let b = 0; b < flags.array.length; b++) {

      if (name == flags.array[b].name && value == flags.array[b].value) {
        numberOfPositiveConditions += 1;
      }
    }
  }


  if (numberOfPositiveConditions == targetNumberOfConditions) {
    return true;
  } else {
    if (!(storyObjectsArray[OMEGA].offAnswers.includes(i))) {
      storyObjectsArray[OMEGA].offAnswers.push(i);
    }
    return false;
  }
}

function draw() {

  console.clear();
  //console.log(storyObjectsArray[0].answers);

  //napisz funkcję play

  console.log(storyObjectsArray[OMEGA].title + "\n" + storyObjectsArray[OMEGA].content + "\n");
  for (let i = 0; i < storyObjectsArray[OMEGA].answers.length; i++) {
    if (storyObjectsArray[OMEGA].answers[i].preConditions.length == 0) {
      if (i == color) {
        console.log('\x1b[33m%s\x1b[0m', "-> " + (storyObjectsArray[OMEGA].answers[i].content));
      } else {
        console.log("-> " + (storyObjectsArray[OMEGA].answers[i].content));
        //console.log("-> " + JSON.stringify(storyObjectsArray[OMEGA].answers[i]));
      }
    } else {

      //console.log(numberOfPositiveConditions + " " + targetNumberOfConditions);
      if (offAnswersFunction(i)) {

        //console.log("działa");
        if (i == color) {
          console.log('\x1b[33m%s\x1b[0m', "-> " + (storyObjectsArray[OMEGA].answers[i].content));
        } else {
          console.log("-> " + (storyObjectsArray[OMEGA].answers[i].content));
          //console.log("-> " + JSON.stringify(storyObjectsArray[OMEGA].answers[i]));
        }
      }
    }
  }
  // potencjalne odpowiedzi wypisywane są po bezpośrednim porównaniu z flagami !!!
  /// !!!
}

rl.input.on("keypress", (str, key) => {
  if (GAME_ENDED == false) {
    if (GAME_PAUSED == false) {
      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else {
        if (key.name === "up" && color > 0) {
          if (!(storyObjectsArray[OMEGA].offAnswers.includes(color - 1))) {
            color -= 1;
          }
          draw();
        } else if (key.name === "down" && color < storyObjectsArray[OMEGA].answers.length - 1) {
          if (!(storyObjectsArray[OMEGA].offAnswers.includes(color + 1))) {
            color += 1;
          }
          draw();
        } else if (key.name === "return") {
          let result = storyObjectsArray[OMEGA].answers[color].result;
          //let temporary;
            for (let b = 0; b < storyObjectsArray[OMEGA].answers[color].postConditions.length; b++) {
              let postConditionName = storyObjectsArray[OMEGA].answers[color].postConditions[b].slice(0, storyObjectsArray[OMEGA].answers[color].postConditions[b].indexOf(":")).trim();
              let postConditionValue = storyObjectsArray[OMEGA].answers[color].postConditions[b].slice(storyObjectsArray[OMEGA].answers[color].postConditions[b].indexOf(":") + 1).trim();
              flags.array[flags.array.findIndex(object => { return object.name === postConditionName })].value = postConditionValue;
              //temporary = flags.array[flags.array.findIndex(object => { return object.name === postConditionName })].value;
              //changingPostConditionsArray.push(storyObjectsArray[OMEGA].answers[a].postConditions[b]);
            }

            let dotArray = [];
            if (result === "END") {
              for (let i = 0; i < 80; i++) {
                dotArray.push("-");
              }
                console.log('\x1b[33m%s\x1b[0m', "Zakończ");
                console.log(dotArray.join(''));
                GAME_ENDED = true;
            } else {
              if (storyObjectsArray.findIndex(object => { return object.title === result }) == -1) {
                console.log('\x1b[31m%s\x1b[0m', "Następujący wątek nie istnieje");
                GAME_ENDED = true;
              } else {
                OMEGA = storyObjectsArray.findIndex(object => {
                  return object.title === result;
                });
                draw();
              }
            }
          //console.log(temporary);
        }
      }
    }
  } else {
    rl.close();
  }
});

rl.on("close", function() {
    process.exit(0);
});

/*

kształtowanie się objektu zawierającego wątek:

Objekt zaczyna się frazą "wt:", następnie pomiędzy znajduje się tytuł. We wnętrzu nawiasów "{ }"
znajduje się tekst który ma zostać wypisany na ekranie. Aby poprawnie działało wyszukiwanie
muszą zostać zachowane równości: openBracketArray.length = closeBracketArray.length &&
wtArray.length = openBracketArray.length * 0.5

{
  title: "[...]",
  content: "[...]"
  answers: [{
    content: "",
    result: ""
  }, {
    content: "",
    result: ""
  }, {
    content: "",
    result: ""
  }]
}

*/

//ważna uwaga - OMEGA jest obecnym momentem to znaczy że OMEGA oznacza zawsze bierzącą scenę,
//jeżeli będzie zmieniać się odmiennie od przejścia do następnego wątku proces zostanie zaburzony
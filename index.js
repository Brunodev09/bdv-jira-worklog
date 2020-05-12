const fetch = require('node-fetch');
const InputModule = require('./input');
const settings = require('./jira.json');
const repetitive = Object.keys(settings.issues);
const questions = ['Quantas horas?', 'Adicione uma descricao']
const listIncludes = {};

const _rgb = { 0: 'FRED', 1: 'FGREEN', 2: 'FBLUE' };
const color = _rgb[Math.floor(Math.random() * 3)];

let auth = "";
const API = `/rest/api/3/issue/_/worklog/updated`;

async function init() {
    if (!settings || !settings["jira-base-url"] || !settings["jira-token"] || !settings["jira-email"]) {
        console.error(`Favor preencher a propriedade jira-base-url, jira-token e jira-email no arquivo jira.json!`);
        return;
    }

    auth = 'Basic ' + Buffer.from(settings["jira-email"] + ":" + settings["jira-token"]).toString('base64');

    const input = new InputModule();
    input.setTag("[bdv-jira-worklog] - ");
    input.setColor(color);
    for (let item of repetitive) {
        const a = (await input.flush([`Voce teve ${item} hoje? (s/n)`]).startAsking())[0];
        if (a.toLowerCase().includes("s")) {
            let answers = await (input.flush(questions).startAsking());
            while (isNaN(answers[0])) {
                console.log('Dados inválidos. Horas deve ser um número e descricao uma string.')
                answers = await (input.flush(questions).startAsking());
            }
            listIncludes[item] = {
                issue: settings.issues[item],
                time: answers[0],
                description: answers[1]
            };
        }
    }
    questions.unshift("Ticket # number of the issue");
    let a = (await input.flush([`Gostaria de adicionar mais algum log? (s/n)`]).startAsking())[0];
    while (a.toLowerCase().includes("s")) {
        let innerAnswers = await (input.flush(questions).startAsking());
        while (isNaN(innerAnswers[0]) || isNaN(innerAnswers[1])) {
            console.log('Dados inválidos. Horas deve ser um número e descricao uma string.')
            innerAnswers = await (input.flush(questions).startAsking());
        }
        listIncludes[innerAnswers[0]] = {
            issue: innerAnswers[0],
            time: innerAnswers[1],
            description: innerAnswers[2]
        };
        a = (await input.flush([`Gostaria de adicionar mais algum log?`]).startAsking())[0];
    }
    console.log(`As horas serao logadas no link: ${settings["jira-base-url"]}. Aguarde...`);

    for (let key in listIncludes) {
        try {
            const link = API.split('_')[0] + listIncludes[key].issue + API.split('_')[1];
            const body = `{
                "timeSpentSeconds": ${listIncludes[key].time},
                "visibility": {
                  "type": "group",
                  "value": "jira-developers"
                },
                "comment": {
                  "type": "doc",
                  "version": 1,
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "text": "${listIncludes[key].description}",
                          "type": "text"
                        }
                      ]
                    }
                  ]
                },
                "started": "2020-05-08T07:55:44.098+0000"
              }`;
            let res = await fetch(settings["jira-base-url"] + link,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    },
                    body
                });
            res = await res.json();
            console.log(res)
            await customTimeout(1000);
        } catch (e) {
            console.error(e);
        }
    }


}

function customTimeout(ms) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
}

init();
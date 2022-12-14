import fs from 'fs';
import sort from 'array-sort';
import config from '../current-config';

let file = fs.readFileSync(`${config.outputPath}/TermsCount.txt`, 'utf-8');

let arr = file.split('\n');

let objArr = [];

for (let elem of arr) {
  let obj = elem.split(',');
  objArr.push({
    term: obj[0],
    qtd: Number(obj[1]),
  });
}

let sorted = sort(objArr, 'qtd');

let output = 'term,qtd\n';
for (let line of sorted) {
  output += `${line.term},${line.qtd}\n`;
}

fs.writeFileSync('./TermsCountSortedByQtd.csv', output);

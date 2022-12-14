import sort from 'array-sort';
import fs from 'fs';
import path from 'path';
import config from '../current-config';

// Load GO terms data
const goTermsQtd = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}TermsCount.txt`),
  'utf-8'
);
let termsTable = goTermsQtd.split('\n');

const allGoTerms = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}allGoTerms.json`),
  'utf-8'
);
let terms = JSON.parse(allGoTerms) as string[];
terms = sort(terms);

// Clean terms file
for (let term of termsTable) {
  let curTerm = term.split(',');

  if (
    (curTerm[1] && Number(curTerm[1]) < config.goTermQtdThreshold) ||
    Number(curTerm[1]) > Math.trunc(config.proteinQtd / 2)
  ) {
    console.log(curTerm[0]);
    var index = terms.indexOf(curTerm[0]);
    if (index !== -1) {
      terms.splice(index, 1);
    }
  }
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}allGoTermsFiltered.json`),
  JSON.stringify(terms)
);

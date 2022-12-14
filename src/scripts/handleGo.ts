import fs from 'fs';
import path from 'path';
import { ITerm } from '../_type';
import config from '../current-config';

/**
 * Input: input/go-basic.obo
 * Output: output/goBasic.json
 * Namespaces: 'biological_process', 'cellular_component', 'molecular_function'
 */

console.log('Starting GO file cleaning algorithm');

const file = fs.readFileSync(
  path.join(__dirname, `${config.inputPath}go-basic.obo`),
  'utf-8'
);
const lines = file.split('\n');

for (let line of lines) {
  line = line.replace('\n', '');
}

/**
 * Add all fields of a term to a JSON object array, excluding 'is_obsolete: true' terms
 */
let terms: ITerm[] = [];
let curTerm: ITerm = {};
let keys: String[] = [];
for (let i in lines) {
  // Building term
  let curLine = lines[i];
  const splitLine = curLine.split(/:(.*)/s);
  const key = splitLine[0] ? splitLine[0].trim() : undefined;
  const content = splitLine[1] ? splitLine[1].trim() : undefined;
  if (key && content) {
    if (!curTerm[key]) curTerm[key] = [];
    curTerm[key].push(content);
  }
  if (lines[i] == '') {
    if (
      lines[Number(i) + 1] == '[Term]' &&
      curTerm['id'] &&
      !curTerm['is_obsolete'] &&
      !checkAgingRelated(curTerm)
    ) {
      for (let key of Object.keys(curTerm))
        if (!keys.includes(key)) keys.push(key);
      terms.push({
        id: curTerm.id,
        alt_id: curTerm.alt_id,
        is_a: curTerm.is_a,
        name: curTerm.name,
      });
    }

    curTerm = {};
  }
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}goBasic.json`),
  JSON.stringify(terms)
);

let response = [];
for (let term of terms) {
  for (let id of term.id) {
    response.push(id);
  }
  if (term.alt_id) {
    for (let id of term.alt_id) {
      response.push(id);
    }
  }
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}allGoTerms.json`),
  JSON.stringify(response)
);

/**
 * Auxiliary functions
 */
function checkAgingRelated(term: any): boolean {
  // name
  let name = term['name'] as string[];
  if (findWord(name)) return true;
  // synonym
  let synonym = term['synonym'] as string[];
  if (findWord(synonym)) return true;
  // def
  let def = term['def'] as string[];
  if (findWord(def)) return true;
  // comment
  let comment = term['comment'] as string[];
  if (findWord(comment)) return true;
  return false;
}

function findWord(values?: string[]) {
  if (!values) return false;
  let words = [];
  for (let line of values) {
    let wordsArr = line.split(' ');
    words.push(...wordsArr);
  }
  if (
    words.find((elem) => elem == 'aging') ||
    words.find((elem) => elem == 'senescence') ||
    words.find((elem) => elem == 'age-related')
  ) {
    return true;
  }
  return false;
}

import fs from 'fs';
import path from 'path';
import config from '../current-config';
import sort from 'array-sort';

interface IDatasetRow {
  id: string;
  ageingRelated: string;
  [key: string]: string;
}

interface ITerm {
  [key: string]: string;
}

interface ITermNum {
  [key: string]: number;
}

const proteinsFile = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}uniProt.json`),
  'utf-8'
);
const proteins = JSON.parse(proteinsFile);

let termsFile;
if (
  fs.existsSync(
    path.join(__dirname, `${config.outputPath}allGoTermsFiltered.json`)
  )
) {
  termsFile = fs.readFileSync(
    path.join(__dirname, `${config.outputPath}allGoTermsFiltered.json`),
    'utf-8'
  );
} else {
  termsFile = fs.readFileSync(
    path.join(__dirname, `${config.outputPath}allGoTerms.json`),
    'utf-8'
  );
}
let terms = JSON.parse(termsFile) as string[];
terms = sort(terms);

const goFile = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}goBasic.json`),
  'utf-8'
);
const goJson = JSON.parse(goFile);

const genAge = fs.readFileSync(
  path.join(__dirname, `${config.inputPath}genage_human.csv`),
  'utf-8'
);

let proteinsRelatedToAging = genAge.split('\r\n');

// Starting file
let headers =
  'id,ageingRelated,ageing_n_0,ageing_n_1,ageing_n_2,ageing_n_3_4,ageing_n_5+,';

// Start every GO term as false
let termOjb: ITerm = {};
let termCount: ITermNum = {};
for (let idx = 0; idx < terms.length; idx++) {
  termOjb[terms[idx]] = '0';
  termCount[terms[idx]] = 0;

  if (idx == terms.length - 1) {
    headers += terms[idx] + '\n';
    continue;
  }
  headers += terms[idx] + ',';
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}dataset.csv`),
  headers
);

let protLen = proteins.length;
let cont = 0;
for (let protein of proteins) {
  let row: IDatasetRow = {
    id: protein.id,
    ageingRelated: isRelatedToAging(protein.id),
    ageing_n_0: String(Number(protein.neighborsRelatedToAgeing == 0)),
    ageing_n_1: String(Number(protein.neighborsRelatedToAgeing == 1)),
    ageing_n_2: String(Number(protein.neighborsRelatedToAgeing == 2)),
    ageing_n_3_4: String(
      Number(
        protein.neighborsRelatedToAgeing == 3 ||
          protein.neighborsRelatedToAgeing == 4
      )
    ),
    'ageing_n_5+': String(Number(protein.neighborsRelatedToAgeing >= 5)),
    ...termOjb,
  };
  for (let term of protein.goTerms) {
    const hierarchy = buildHierarchy(term);
    for (let elem of hierarchy) {
      if (elem && row[elem]) {
        row[elem] = '1';
      }
    }
  }

  console.log(`${cont++}/${protLen - 1}`);
  let rowToStore = '';
  const rowKeys = Object.keys(row);

  for (let idx = 0; idx < rowKeys.length; idx++) {
    if (row[rowKeys[idx]] == '1') {
      termCount[rowKeys[idx]] = termCount[rowKeys[idx]] + 1;
    }
    if (idx == rowKeys.length - 1) {
      rowToStore += row[rowKeys[idx]] + '\n';
      continue;
    }
    rowToStore += row[rowKeys[idx]] + ',';
  }
  fs.appendFileSync(
    path.resolve(process.cwd(), `${config.outputPath}dataset.csv`),
    rowToStore
  );
}

let countText = 'term,qtd\n';
const countKeys = Object.keys(termCount);
for (let term of countKeys) {
  countText += `${term},${termCount[term]}\n`;
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}TermsCount.txt`),
  countText
);

/**
 * Auxiliary Functions
 */

function buildHierarchy(term: string): string[] {
  let result: string[] = [];
  let found = findTerm(term);

  if (found) {
    result.push(found.id);

    // Find hierarchy
    let hierarchy: any = findHierarchy(found.is_a);
    let hierarchyTerms: string[] = hierarchy.map((elem: any) => elem.id);
    result.push(...hierarchyTerms);
  }

  return result;
}

function findTerm(term: string) {
  let found = goJson.find((elem: any) => elem.id[0] == term);
  if (!found)
    found = goJson.find(
      (elem: any) => elem.alt_id && elem.alt_id.includes(term)
    );
  return found;
}

function findHierarchy(relatives?: string[]): any[] {
  if (!relatives || relatives.length == 0) {
    return [];
  }

  let terms = relatives.map((elem) => elem.split(' ')[0]);

  let result: string[] = [];
  for (let term of terms) {
    let found = findTerm(term);
    result.push(found);
    result.push(...findHierarchy(found.is_a));
  }

  return result;
}

function isRelatedToAging(id: string): string {
  for (let line of proteinsRelatedToAging) {
    let split = line.split(',');
    for (let value of split) {
      if (value == id) {
        return '1';
      }
    }
  }
  return '0';
}

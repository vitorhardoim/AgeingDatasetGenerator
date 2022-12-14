import fs from 'fs';
import path from 'path';
import config from '../current-config';
import { ITerm } from '../_type';

const goBasic = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}go-basic.json`),
  'utf-8'
);

let goBasicJSON: ITerm[] = JSON.parse(goBasic);

const count = fs.readFileSync(
  path.join(__dirname, `${config.outputPath}termsCount.txt`),
  'utf-8'
);

let countLines = count.split('\n');
let output = '';

for (let line of countLines) {
  let values = line.split(',');
  if (values[0]) {
    let value = goBasicJSON.find((elem) => elem.id[0] == values[0]);
    if (value) {
      output += `${line},${value.name[0]}\n`;
    }
    if (values[0] == 'term') output += `${line},name\n`;
  }
}

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}TermsCountNames.txt`),
  output
);

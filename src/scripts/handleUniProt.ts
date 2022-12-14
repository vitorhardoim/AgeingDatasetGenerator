import fs from 'fs';
import path from 'path';
import config from '../current-config';
import axios from 'axios';

let result: any[] = [];
let qtd = 0;
let size = 250;

let genAgePairs = fs.readFileSync(
  path.join(__dirname, `${config.inputPath}genagePair.txt`),
  'utf-8'
);

fs.writeFileSync(
  path.resolve(process.cwd(), `${config.outputPath}uniProt.json`),
  ''
);
(async function () {
  try {
    let resp = await axios.get(
      `https://rest.uniprot.org/uniprotkb/search?compressed=false&format=json&query=%28reviewed%3Atrue%29%20AND%20%28model_organism%3A9606%29&size=${size}`
    );
    qtd += size;
    processResult(resp.data);
    let next = resp.headers.link?.split(';')[0].slice(1, -1) as string;
    while (next) {
      console.log(qtd);
      resp = await axios.get(next);
      qtd += size;
      processResult(resp.data);

      next = resp.headers.link?.split(';')[0].slice(1, -1) as string;
    }

    fs.appendFileSync(
      path.resolve(process.cwd(), `${config.outputPath}uniProt.json`),
      JSON.stringify(result)
    );
  } catch (err) {
    console.log(err);
  }
})();

function processResult(data: any) {
  let proteins = data.results;

  for (let protein of proteins) {
    const id = protein.uniProtkbId;
    let goTerms = [];

    for (let ref of protein.uniProtKBCrossReferences) {
      if (ref.database == 'GO') {
        goTerms.push(ref.id);
      }
    }

    let comments = protein.comments;
    let neighbors = [];
    let neighborsRelatedToAgeing = 0;
    if (comments) {
      for (let comment of comments) {
        if (comment.commentType == 'INTERACTION' && comment.interactions) {
          for (let interaction of comment.interactions) {
            neighbors.push(interaction.interactantTwo.uniProtKBAccession);
            if (
              genAgePairs.includes(
                interaction.interactantTwo.uniProtKBAccession
              )
            )
              neighborsRelatedToAgeing++;
          }
        }
      }
    } else {
      console.log(comments);
    }

    result.push({
      id,
      goTerms,
      neighbors,
      neighborsRelatedToAgeing,
    });
  }
}

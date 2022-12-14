import fs from 'fs';
import axios from 'axios';

(async function(){

  let file = fs.readFileSync('data.json', 'utf-8');
  let elems = JSON.parse(file);
  let output = 'uniprot,primaryAccession\n';

  try{
    for(let elem of elems){
      console.log(elem);
      if(!elem.uniprot) continue;
      let resp = await axios.get(
        `https://rest.uniprot.org/uniprotkb/search?compressed=false&format=json&query=%28${elem.uniprot}%29&size=1`
      );
      console.log(resp.data.results[0].primaryAccession);
      output += `${elem.uniprot},${resp.data.results[0].primaryAccession}\n`
    }
    fs.writeFileSync('./genagePair.txt', output);
  }catch(err){
    console.log(err);
  }
})();
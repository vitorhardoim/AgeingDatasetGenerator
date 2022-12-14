import { IConfig } from './_type';
import moment from 'moment';

interface IRequiredConfig {
  default: IConfig;
}

let configFile = 'config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: IRequiredConfig = require('./config/' + configFile.trim());
console.log(
  moment().format('YYYY/MM/DD HH:mm:ss.SSS') +
    ' [info] - Load config file: config/' +
    configFile +
    '.ts'
);

export default config.default;

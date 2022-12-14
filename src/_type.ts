export interface IConfig {
  inputPath: string;
  outputPath: string;
  goTermQtdThreshold: number
  proteinQtd: number
}

export interface ITerm {
  [key: string]: string[];
  /*
  id?: string;
  alt_id?: string;
  name?: string;
  namespace?: string;
  def?: string;
  synonym?: string;
  is_a: string[];
  alt_id: string[];
  subset: string[];
  consider: string[];
  synonym: string[];
  xref: string[];
  relationship: string[];
  */
}

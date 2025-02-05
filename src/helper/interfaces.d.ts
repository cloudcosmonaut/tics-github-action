export interface Analysis {
  completed: boolean;
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrl?: string;
}

export interface QualityGate {
  passed: boolean;
  message: string;
  url: string;
  gates: any[];
  annotationsApiV1Links: any[];
}

export interface ReviewComment {
  body: string;
  path: any;
  line: any;
}

export interface ReviewComments {
  postable: ReviewComment[];
  unpostable: any[];
}

export interface ChangedFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string | undefined;
  previous_filename?: string | undefined;
}

export interface AnalyzedFile {
  formattedValue: string;
  letter?: string;
  messages: unknown[];
  coverage: number;
  status: string;
  value: string | number;
}

export interface AnalyzedFiles {
  data: AnalyzedFile[];
}

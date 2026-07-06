type Language = "javascript" | "python";

export type RunTimeConfig = {
  entry: string;
  funcName: string;
  language: Language[];
  defaultLanguage: Language;
};

export interface TypographyToken {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: string | number;
  letterSpacing?: string;
  fontFeature?: string;
  fontVariation?: string;
}

export interface DesignTokenSet {
  name: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, TypographyToken>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
  components?: Record<string, Record<string, string>>;
}

export interface ParserPlugin {
  name: string;
  extensions: string[];
  detect(filePath: string): boolean;
  parse(filePath: string): DesignTokenSet;
}

export interface DesignMdConfig {
  name?: string;
  parser?: ParserPlugin;
  input?: string[];
  out?: string;
  lint?: boolean;
}

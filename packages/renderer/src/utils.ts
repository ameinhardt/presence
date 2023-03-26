export interface Author {
  name: string;
  email?: string;
  url?: string;
}

export function parseAuthorString(authorString: string) : Author {
  const authorObject: Partial<Author> = {};
  authorString.replace(/([^<]*)(?:<([^>]+)>)?\s*(?:\(([^(]+)\))?/, (_, name: string, email?: string, url?) => {
    authorObject.name = name.trim();
    authorObject.email = email?.trim();
    authorObject.url = url?.trim();
    return authorObject.name;
  });
  return authorObject as Author;
}

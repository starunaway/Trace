export const _global = window as unknown as Window & {
  XMLHttpRequest: XMLHttpRequest;
};
export const _document = document as unknown as Document;

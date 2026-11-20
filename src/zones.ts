// Which zone a page is in (zones.json): the main site, with the top navigation and full-width pages, or the docs.
import zones from '../zones.json';

export const pageId = (id: string) => id.replace(/\/index$/, '').replace(/^index$/, '');
export const isMain = (id: string) => {
  const page = pageId(id);
  return zones.main.includes(page) || zones.mainPrefixes.some((prefix) => page === prefix.replace(/\/$/, '') || page.startsWith(prefix));
};

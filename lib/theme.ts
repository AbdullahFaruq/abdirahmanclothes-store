export const THEME_STORAGE_KEY = "aas.theme.v1";

export type Theme = "light" | "dark";

/**
 * Runs before the first paint, inlined into <head>, so the page never renders
 * in the wrong theme and then snaps. Kept dependency-free and tiny; it is
 * duplicated logic by necessity, since nothing else has run yet.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
var d=window.matchMedia("(prefers-color-scheme: dark)").matches;
var t=(s==="light"||s==="dark")?s:(d?"dark":"light");
document.documentElement.setAttribute("data-theme",t);
}catch(e){}})();`;

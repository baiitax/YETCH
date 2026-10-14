// The only inline executable scripts in the site. Their hashes go into the CSP,
// so the server can keep script-src strict without 'unsafe-inline'.
export const INLINE = {
  jsClass: "document.documentElement.classList.add('js');",
  rootRedirect: "location.replace((navigator.language||'').toLowerCase().startsWith('ar')?'/ar/':'/en/');",
};

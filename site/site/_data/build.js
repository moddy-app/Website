/**
 * An id of this deployment, appended to the script URLs (`?v=`).
 *
 * The entry scripts keep the same name from one deployment to the next
 * (/js/pages/global.js…), and the CDN sends them with a browser cache of
 * several hours: without a new URL, a returning visitor gets the new HTML
 * with yesterday's scripts. Shared chunks already carry a content hash.
 */
module.exports = {
  version: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 8) || Date.now().toString(36),
};

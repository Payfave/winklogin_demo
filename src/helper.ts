import Keycloak, { KeycloakInitOptions, KeycloakLogoutOptions } from 'keycloak-js';

export const appendParentOriginIntoUrl = (url: string, loggingEnabled: boolean): string => {
  var isInIframe = window === window.parent ? false : true;

  if (isInIframe) {
    try {
      //  window.opener.location.href,  window.opener.location.href throw an error due to security reasons

      const documentReferrer = document.referrer;
      const documentReferrerHost = documentReferrer.split('/')[2];

      if (loggingEnabled) {
        console.info('DOCUMENT REFERRER: ', documentReferrer);
        console.info('DOCUMENT REFERRER HOST: ', documentReferrerHost);
      }

      const firstAncestorOrigin = window.location.ancestorOrigins?.[0];
      const firstAncestorOriginHost = firstAncestorOrigin?.split('/')?.[2];

      if (loggingEnabled) {
        console.info('ANCESTOR ORIGIN: ', firstAncestorOrigin);
        console.info('ANCESTOR ORIGIN HOST: ', firstAncestorOriginHost);
      }

      const parentHost =
        window.location !== window.parent.location
          ? documentReferrerHost ?? firstAncestorOriginHost
          : window.location.hostname;

      if (loggingEnabled) {
        console.info('WINK PARENT ORIGIN HOST: ', parentHost);
      }

      url = url + '&wink-parent-origin=' + encodeURIComponent(parentHost);
    } catch (error) {
      console.error('Unable to add wink parent origin query param due to error: ', error);
    }
  }

  return url;
};

// TODO: Default keycloak init options, just a temporary fix, we should find a way how to find out if 3rd party cookies are blocked
// In Chrome Incognito windows there is also an issue with 3rd party cookies
function isFirefoxBrowser() {
  return navigator.userAgent.indexOf('Firefox') !== -1;
}

function isSafariBrowser() {
  return navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
}

// NOTE: We need to define separate keycloakOptions per browser as a temporary workaround because of several issues
export function getKeycloakInitOptions() {
  if (isFirefoxBrowser()) {
    return firefoxKeycloakInitConfig;
  }
  if (isSafariBrowser()) {
    return safariKeycloakInitConfig;
  }

  return defaultKeycloakInitConfig;
}

// NOTE: Safari block by default 3rd party cookies and there is a reloading issues if checkLoginIframe is enabled
const safariKeycloakInitConfig: KeycloakInitOptions = {
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  silentCheckSsoFallback: false,
  checkLoginIframe: false,
  enableLogging: true,
};

// NOTE: Firefox block by default 3rd party cookies
const firefoxKeycloakInitConfig: KeycloakInitOptions = {
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  silentCheckSsoFallback: false,
  checkLoginIframe: true,
  enableLogging: true,
};

export const defaultKeycloakInitConfig: KeycloakInitOptions = {
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  checkLoginIframe: true,
  silentCheckSsoFallback: true,
  enableLogging: true,
};

export const getUrl = ({ authServerUrl, realm }: Keycloak) => {
  if (!authServerUrl) {
    return null;
  }

  if (authServerUrl.charAt(authServerUrl.length - 1) === '/') {
    return authServerUrl + 'realms/' + encodeURIComponent(realm!);
  }

  return authServerUrl + '/realms/' + encodeURIComponent(realm!);
};

export const getRedirectUri = (keycloak: Keycloak, options?: KeycloakLogoutOptions | undefined) => {
  return options?.redirectUri
    ? options.redirectUri
    : keycloak.redirectUri
    ? keycloak.redirectUri
    : location.href;
};

export const getLogoutUrl = (keycloak: Keycloak, options?: KeycloakLogoutOptions): string => {
  const { idToken, clientId } = keycloak;

  return (
    getUrl(keycloak) +
    '/winklogout' +
    '?post_logout_redirect_uri=' +
    encodeURIComponent(getRedirectUri(keycloak, options)) +
    '&id_token_hint=' +
    encodeURIComponent(idToken!) +
    '&client_id=' +
    encodeURIComponent(clientId!)
  );
};

export const getLoginUrl = ({ createLoginUrl }: Keycloak, loggingEnabled: boolean): string => {
  const loginUrl = appendParentOriginIntoUrl(createLoginUrl(), loggingEnabled);

  return loginUrl;
};

// TODO remove all bellow after switch to keycloak-js 21

const changeUrlWithoutReloading = (url: string) => {
  const stateObj = { page: url };
  history.pushState(stateObj, '', url);
};

export const getUrlParamValue = (paramName: string) => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  return params.get(paramName);
};

export const removeUrlParam = (paramName: string) => {
  const originalUrl = window.location;
  const updatedUrl = removeParameterFromUrl(originalUrl.href, paramName);
  changeUrlWithoutReloading(updatedUrl);
};

const removeParameterFromUrl = (url: string, parameter: string) => {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;
  searchParams.delete(parameter);
  urlObj.search = searchParams.toString();
  const updatedUrl = urlObj.toString();
  return updatedUrl;
};

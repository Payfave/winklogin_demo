import OriginalKeycloak, {
  KeycloakConfig,
  KeycloakError,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
} from 'keycloak-js';

import {
  getKeycloakInitOptions,
  getLogoutUrl,
  appendParentOriginIntoUrl,
  getUrlParamValue,
  removeUrlParam,
} from './helper';
import { winkEraseCookie, winkGetCookie, winkSetCookie } from './cookie';

type WinkInitParams = {
  onFailure?(error: unknown): void;
  onSuccess?(): void | Promise<void>;
};

type WinkKeycloakConfig = KeycloakConfig & {
  onAuthErrorFailure?(error: KeycloakError): void;
  loggingEnabled?: boolean;
};

type WinkLoginParams = KeycloakLoginOptions & {
  onFailure?(error: unknown): void;
};

type WinkLogoutParams = KeycloakLogoutOptions & {
  onFailure?(error: unknown): void;
};

class CustomKeycloak extends OriginalKeycloak {
  onAuthErrorFailure?: (error: KeycloakError) => void;
  loggingEnabled: boolean = true;

  constructor(config: WinkKeycloakConfig) {
    super(config);
    this.onAuthErrorFailure = config.onAuthErrorFailure;
    this.loggingEnabled = config.loggingEnabled ?? true;
  }

  onReady(authenticated?: boolean | undefined): void {
    if (this.loggingEnabled) {
      console.debug('Keycloak client ready.');
      console.debug('Keycloak client authenticated: ', authenticated);
    }
  }

  onAuthError(errorData: KeycloakError): void {
    this.onAuthErrorFailure?.(errorData);

    if (this.loggingEnabled) {
      console.error('Keycloak client authentication error: ', errorData);
    }
  }

  // NOTE custom logout url
  createLogoutUrl = (options?: KeycloakLogoutOptions): string => {
    try {
      const logoutUrl = getLogoutUrl(this, options);

      return logoutUrl;
    } catch (error) {
      if (this.loggingEnabled) {
        console.error('Error while constructing the logout url: ', error);
      }
      throw error;
    }
  };

  winkInit = async (params?: WinkInitParams): Promise<void> => {
    const { onFailure, onSuccess } = params ?? {};
    try {
      if (this.loggingEnabled) {
        console.debug('Calling Keycloak init.');
      }
      const authenticated = await this.init(getKeycloakInitOptions());

      if (authenticated) {
        onSuccess?.();
        winkSetCookie('wink_id_token', this.idToken!);
        if (this.loggingEnabled) {
          console.debug('Keycloak init successful.');
        }
      } else {
        // Check if the login was already called
        // Firefox workaround, single login is not working
        if (getUrlParamValue('login_session_state') === '1') {
          this.winkLogin();
        } else {
          if (this.loggingEnabled) {
            console.debug('User is not authenticated!');
          }
        }
      }
    } catch (error) {
      if (this.loggingEnabled) {
        console.error('Error while wink client initialization: ', error);
      }
      onFailure?.(error);
    }
  };

  winkLogin = async (params?: WinkLoginParams): Promise<void> => {
    const { onFailure } = params ?? {};
    try {
      if (this.loggingEnabled) {
        console.debug('Calling Keycloak login.');
      }

      await this.login(params);
    } catch (error) {
      if (this.loggingEnabled) {
        console.error('Error while wink client login: ', error);
      }

      onFailure?.(error);
    }
  };

  winkLogout = async (params?: WinkLogoutParams): Promise<void> => {
    const { onFailure } = params ?? {};
    try {
      if (this.loggingEnabled) {
        console.debug('Calling Keycloak logout.');
      }

      /**
       * Firefox issue
       * The object is not initialized correctly so we
       * stored this token inside custom cookie 'wink_id_token'
       * (idToken is used for logout, in this case it is undefined)
       */
      this.idToken = this.idToken ?? winkGetCookie('wink_id_token');

      // Clean cookies
      winkEraseCookie('wink_id_token');
      // Remove login_session_state for autologin
      removeUrlParam('login_session_state');

      await this.logout(params);
    } catch (error) {
      if (this.loggingEnabled) {
        console.error('Error while wink client logout: ', error);
      }

      onFailure?.(error);
    }
  };
}

//TODO custom login url workaround, can not override createLoginUrl, https://github.com/keycloak/keycloak/discussions/20989
const getWinkLoginClient = (config: WinkKeycloakConfig) => {
  const keycloakInstance = new CustomKeycloak(config);

  const originalCreateLoginUrl = keycloakInstance.createLoginUrl;

  keycloakInstance.createLoginUrl = function (options?: KeycloakLoginOptions) {
    const url = originalCreateLoginUrl.call(this, options);
    const urlWithParentOrigin = appendParentOriginIntoUrl(url, config.loggingEnabled ?? true);

    return urlWithParentOrigin;
  };

  return keycloakInstance;
};

console.info('winklogin.module.js - version 1.7.2');

//@ts-ignore
window.getWinkLoginClient = getWinkLoginClient;

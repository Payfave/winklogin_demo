/**
 * @jest-environment jsdom
 */

import {
  appendParentOriginIntoUrl,
  defaultKeycloakInitConfig,
  getLoginUrl,
  getLogoutUrl,
  getRedirectUri,
  getUrl,
} from '../helper';
import Keycloak from 'keycloak-js';

describe('helper', () => {
  describe('defaultKeycloakInitConfig', () => {
    it('returns default keycloak init config', () => {
      expect(defaultKeycloakInitConfig).toEqual({
        checkLoginIframe: true,
        enableLogging: true,
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoFallback: true,
        silentCheckSsoRedirectUri: 'http://localhost/silent-check-sso.html',
      });
    });
  });

  describe('#getUrl()', () => {
    it('returns null if authServerUrl is not defined', () => {
      const url = getUrl({ authServerUrl: '', realm: '' } as Keycloak);

      expect(url).toBeNull();
    });

    it('returns url if last character in authServerUrl is /', () => {
      const url = getUrl({ authServerUrl: 'test/', realm: 'realm' } as Keycloak);

      expect(url).toBe('test/realms/realm');
    });

    it('returns url if last character in authServerUrl is not /', () => {
      const url = getUrl({ authServerUrl: 'test', realm: 'realm' } as Keycloak);

      expect(url).toBe('test/realms/realm');
    });
  });

  describe('#getRedirectUri()', () => {
    it('returns redirect uri from options if it is defined', () => {
      const url = getRedirectUri({ redirectUri: 'keycloakRedirectUri' } as Keycloak, {
        redirectUri: 'optionsRedirectUri',
      });

      expect(url).toBe('optionsRedirectUri');
    });

    it('returns keycloak redirect if it is defined and logout options is not', () => {
      const url = getRedirectUri({ redirectUri: 'keycloakRedirectUri' } as Keycloak, {
        redirectUri: '',
      });

      expect(url).toBe('keycloakRedirectUri');
    });

    it('returns location href if redirectUri is missing', () => {
      const url = getRedirectUri({ redirectUri: '' } as Keycloak, {
        redirectUri: '',
      });

      expect(url).toBe('http://localhost/');
    });
  });

  describe('#getLogoutUrl()', () => {
    it('returns logout url', () => {
      const url = getLogoutUrl(
        {
          idToken: 'idToken',
          clientId: 'clientId',
          authServerUrl: 'authServerUrl',
          realm: 'realm',
        } as Keycloak,
        {
          redirectUri: 'redirectUri',
        }
      );

      expect(url).toBe(
        'authServerUrl/realms/realm/winklogout?post_logout_redirect_uri=redirectUri&id_token_hint=idToken&client_id=clientId'
      );
    });
  });

  describe('#getLoginUrl()', () => {
    it('returns login url', () => {
      const url = getLoginUrl(
        {
          createLoginUrl: () => 'login-url',
        } as Keycloak,
        false
      );

      expect(url).toBe('login-url');
    });
  });

  describe('#appendParentOriginIntoUrl()', () => {
    describe('isNotInIframe', () => {
      it('returns origin url', () => {
        const url = appendParentOriginIntoUrl('origin-url', false);

        expect(url).toBe('origin-url');
      });
    });

    // TODO
    describe('#appendParentOriginIntoUrl()', () => {});
  });
});

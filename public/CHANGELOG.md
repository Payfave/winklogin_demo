# WinkLogin.module js changelog

1.0.0 - Initial (until december 07, 2022) \
1.1.0 - Added PKCE method \
1.1.1 - Incorporated new button style approach (using https://buttons.winklogin.com/ sources) \
1.2.0 - Changed logout functionality (changed endpoint, added new parameter client_id into library) \
1.3.0 - Remove loadUserProfile function (do not call /account, security reason) \
1.3.1 - Fix for the undefined winkLogin.tokenParsed \
1.4.0 - Implementation moved from winklogin.module.js into src/index.js and src/helper.js \
1.5.0 - Fix for Bitpass (Firefox restrictions) - double-click for login, logout issue \
1.5.1 - Fix, getting username from token \
1.5.2 - Fix for Firefox and Safari, provide custom keycloak init option to solve the issue with cookies \
1.5.3 - Fix, pass parent host when iframe \
1.5.4 - Fix, display warning in console when running on localhost, document.referrer is an empty string \
1.5.5 - Improve error handling \
1.5.6 - Remove cookie for autologin (issue on Firefox) and replace it by URL parameter \
1.5.7 - Fix, add correct parent url host to url \
1.5.8 - Fix, handle first ancestor origin in case it's not defined \
1.5.81 - Fix, build issue - remove sync between directories \
1.6.0 - Feat, add support for npm publishing \
1.7.0 - Feat, add typescript support, jest config, error handling \
1.7.1 - Fix, not working logout on Firefox browser \
1.7.2 - Fix, not working validate token on Firefox browser \

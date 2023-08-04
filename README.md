### Integrating Wink Login

##### Add the Wink Login component to your webpage or app

Add the Wink Login component to your webpage or app
The easiest way to add the Wink Login component to your site is to use an automatically rendered component provided by Wink. With only a few lines of code, you can add this button that automatically configures itself to have the appropriate camera and microphone permissions and the sign-in state of the user and the scopes you request.

To create a Wink Login component that uses the default settings, add the below javascript to your sign-in page:

```html
<script
  type="text/javascript"
  src="https://www.unpkg.com/browse/winklogin/public/winklogin.module.js"
></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
```

##### Example code:

```js
<script>
      var config = {
        url: "https://auth.winklogin.com/auth",
        realm: "wink",
        clientId: "<client specific id>"
      };
      const winkLogin = new WinkLogin(config);
      window.addEventListener("load", (event) => {
        winkLogin.initWinkClient({
          onFailure: onFailure,
          getUserProfile: getUserProfile,
        });
        const loginButton = document.getElementById("wink-oauth-button");
        if (!loginButton) {
          alert("No login button found in the document!");
        } else {
          loginButton.addEventListener("click", () => {
            winkLogin.winkLogin();
          });
        }
      });
      function onFailure(error) {
        console.log("onFailure");
        console.log(error);
      }
      function validateToken() {
      console.log("validateToken");
      const token = winkGetCookie("wink_id_token");
      var formData = {
        ClientId: "<client specific id>",
        AccessToken: "<access token>",
        ClientSecret: "<client specific secret>",
      };
      console.log(formData);
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "https://{{base_url}}/api/ConfidentialClient/verify-client",
        data: JSON.stringify(formData),
        dataType: "json",
        success: function(result, status, xhr) {
            var table = $(
                "<table><tr><th>Profile Details</th></tr>"
            );
            table.append("<tr></tr>");
            table.append(
                "<tr><td>FirstName:</td><td>" +
                result["firstName"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>LastName:</td><td>" +
                result["lastName"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>ContactNo:</td><td>" +
                result["contactNo"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>Email:</td><td>" +
                result["email"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>WinkTag:</td><td>" +
                result["winkTag"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>WinkToken:</td><td>" +
                result["winkToken"] +
                "</td></tr>"
            );
            table.append(
                "<tr><td>ExpiryTime:</td><td>" +
                result["expiryTime"] +
                "</td></tr>"
            );
            //$("#tBody").empty();
            $("#tBody").append(table);
        },
        error: function(xhr, status, error) {
            alert(
                "Result: " +
                status +
                " " +
                error +
                " " +
                xhr.status +
                " " +
                xhr.statusText
            );
        },
     });
     // });
     //disable
     $("#wink-oauth-validatetoken-button").disabled = true;
     document.getElementById(
        "wink-oauth-validatetoken-button"
    ).disabled = true;
   }
      function signOut() {
        winkLogin && winkLogin.logout();
      }
      function refreshToken() {
        winkLogin
          .updateToken(0)
          .then(function (refreshed) {
            if (refreshed) {
              console.log("Token was successfully refreshed");
            } else {
              console.log("Token is still valid");
            }
          })
          .catch(function () {
            console.log(
              "Failed to refresh the token, or the session has expired"
            );
          });
      }
    </script>
```

##### Additional silent-check-sso.html file

In order for Oauth to function properly, a file named silent-check-sso.html must be placed in the root directory. This file must contain the below tag and can be found here: https://github.com/wink-cloud/wink-integration

```html
<html>
  <body>
    <script>
      parent.postMessage(location.href, location.origin);
    </script>
  </body>
</html>
```

##### Add a Wink Sign-In button

It is also possible to add a "Sign-In with Wink" button. With only a few lines of code, you can add a button that automatically configures itself to have the appropriate text, logo, and colors for the sign-in state of the user and the scopes you request.

###### Button styling

The Wink Button styling as well as the images can be found https://github.com/wink-cloud/wink-integration . Additionally, Wink's button styling examples can be found https://buttons.winklogin.com/ and used to update the below example.

```html
<button id="wink-oauth-button" class="wink-oauth-button-light">
  <img src="semicolon-white.svg" />
  Login with Wink
</button>
```

##### Get User Profile Using the Verify Endpoint

After you have signed in a user with Wink using the default scopes, you can access the user's name, phone number, and email address using a Verify Client https://docs.wink.cloud/reference/verifyclient. Wink has stored all user profile data in a secure vault and tokenized the values stored in the Wink system. In order to view user profile data use this API.

###### Verify Client Example

See how to call the verify client API and retrieve the user profile data

```js
function validateToken() {
  console.log('validateToken');
  const token = winkGetCookie('wink_id_token');
  var formData = {
    ClientId: '<client specific id>',
    AccessToken: '<access token>',
    ClientSecret: '<client specific secret>',
  };
  console.log(formData);
  $.ajax({
    contentType: 'application/json',
    type: 'POST',
    url: 'https://{{base_url}}/api/ConfidentialClient/verify-client',
    data: JSON.stringify(formData),
    dataType: 'json',
    success: function (result, status, xhr) {
      var table = $('<table><tr><th>Profile Details</th></tr>');
      table.append('<tr></tr>');
      table.append('<tr><td>FirstName:</td><td>' + result['firstName'] + '</td></tr>');
      table.append('<tr><td>LastName:</td><td>' + result['lastName'] + '</td></tr>');
      table.append('<tr><td>ContactNo:</td><td>' + result['contactNo'] + '</td></tr>');
      table.append('<tr><td>Email:</td><td>' + result['email'] + '</td></tr>');
      table.append('<tr><td>WinkTag:</td><td>' + result['winkTag'] + '</td></tr>');
      table.append('<tr><td>WinkToken:</td><td>' + result['winkToken'] + '</td></tr>');
      table.append('<tr><td>ExpiryTime:</td><td>' + result['expiryTime'] + '</td></tr>');
      //$("#tBody").empty();
      $('#tBody').append(table);
    },
    error: function (xhr, status, error) {
      alert('Result: ' + status + ' ' + error + ' ' + xhr.status + ' ' + xhr.statusText);
    },
  });
  // });
  //disable
  $('#wink-oauth-validatetoken-button').disabled = true;
  document.getElementById('wink-oauth-validatetoken-button').disabled = true;
}
```

To retrieve the tokenized values for the profile information for a user, use the getUserProfile() method. This will not return the actual values but only the tokenized values stored in the Wink system.

```js
function getUserProfile(profile) {
  console.log('getUserProfile');
  console.log('Username (winkTag): ' + profile.username);
  console.log('Name: ' + winkLogin.idTokenParsed.given_name);
  console.log('Surname: ' + winkLogin.idTokenParsed.family_name);
  console.log('Phone: ' + winkLogin.idTokenParsed.phone_number);
  console.log('Email: ' + winkLogin.idTokenParsed.email);
  console.log('ID: ' + profile.id);
  console.log('Session: ' + winkLogin.session_state);
  console.log('Access token: ' + winkLogin.token);
  console.log('Refresh token: ' + winkLogin.refreshToken);
  console.log('ID token: ' + winkLogin.idToken);
  console.log('Refresh token (parsed)');
  console.log(winkLogin.refreshTokenParsed);
  console.log(
    'Refresh token expiration date: ' + winkLogin.getFormattedTime(winkLogin.refreshTokenParsed.exp)
  );
  console.log('ID token (parsed): ' + JSON.stringify(winkLogin.idTokenParsed));
  console.log(winkLogin.idTokenParsed);
  console.log(
    'ID token expiration date: ' + winkLogin.getFormattedTime(winkLogin.idTokenParsed.exp)
  );
}
```

###### User ID

As expected, the "sub" claim portion of winkLogin.token and winkLogin.idToken will contain the Wink Token which can be used internally by the client as the unique user ID

##### Refresh Token

The token can be extended beyond the initial time. To refresh the token for a user's session, call the refreshToken() method. The value inside updateToken is in seconds.

```js
function refreshToken() {
        winkLogin
          .updateToken(0)
          .then(function (refreshed) {
            if (refreshed) {
              console.log("Token was successfully refreshed");
            } else {
              console.log("Token is still valid");
            }
          })
          .catch(function () {
            console.log(
              "Failed to refresh the token, or the session has expired"
            );
          });
      }
    </script>
```

##### Token Expiry

Default value for the Access Token is 5 minutes and 30 minutes for the Refresh Token

##### Sign out a user

You can enable users to sign out of your app by adding a sign-out button or link to your site. To create a sign-out link, attach a function that calls the signOut() method to the link's onclick event.

```js
function signOut() {
  winkLogin && winkLogin.logout();
}
```

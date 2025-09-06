export default function Status() {
  return (
    <html lang="fr">
      <head>
        <title>Moddy Status</title>
        <link rel="icon" type="image/png" href="https://moddy.app/flavicon" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, shrink-to-fit=no"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <iframe
          src="https://jules-x2as8.instatus.com/"
          style={{
            display: "block",
            border: "none",
            width: "100%",
            height: "100vh"
          }}
        />
      </body>
    </html>
  );
}

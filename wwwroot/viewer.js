/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token");
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer(
      { env: "AutodeskProduction", getAccessToken },
      function () {
        const config = {
          extensions: ["Autodesk.DocumentBrowser"],
        };
        const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
        viewer.start();
        viewer.setTheme("light-theme");
        resolve(viewer);
      }
    );
  });
}

export function loadModel(viewer, urn) {
  return new Promise(function (resolve, reject) {
    // Define a success callback for when the document is loaded
    function onDocumentLoadSuccess(doc) {
      // Load the default geometry of the root node of the document into the viewer
      resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
    }

    // Define a failure callback for when the document fails to load
    function onDocumentLoadFailure(code, message, errors) {
      // Reject the promise with an object containing the error details
      reject({ code, message, errors });
    }

    // Set the light preset for the viewer
    viewer.setLightPreset(0);

    // Load the document with the specified URN (Universal Resource Name)
    Autodesk.Viewing.Document.load(
      "urn:" + urn, // Construct the URN for the document
      onDocumentLoadSuccess, // Success callback
      onDocumentLoadFailure // Failure callback
    );
  });
}

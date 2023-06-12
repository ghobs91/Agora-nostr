import "src/app.css"

import App from "src/app/App.svelte"
import {installPrompt} from "src/partials/state"

window.addEventListener("beforeinstallprompt", e => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()

  // Stash the event so it can be triggered later.
  installPrompt.set(e)
})

export default new App({
  target: document.getElementById("app"),
})

export const SEEN_KEY = "intro-seen";

/** Runs before first paint: repeat visits in this browser session skip the intro overlay. */
export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${SEEN_KEY}")==="1")document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

<script lang="ts">
  import "@fortawesome/fontawesome-free/css/fontawesome.css"
  import "@fortawesome/fontawesome-free/css/solid.css"

  import {onMount} from "svelte"
  import {Router, links} from "svelte-routing"
  import {globalHistory} from "svelte-routing/src/history"
  import {identity, isNil, last} from "ramda"
  import {first} from "hurdak/lib/hurdak"
  import {warn} from "src/util/logger"
  import {timedelta, hexToBech32, bech32ToHex, shuffle, now, tryFunc} from "src/util/misc"
  import cmd from "src/agent/cmd"
  import {onReady, relays} from "src/agent/db"
  import keys from "src/agent/keys"
  import network from "src/agent/network"
  import pool from "src/agent/pool"
  import {initializeRelayList} from "src/agent/relays"
  import sync from "src/agent/sync"
  import * as db from "src/agent/db"
  import user from "src/agent/user"
  import {loadAppData} from "src/app/state"
  import {theme, getThemeVariables, appName, modal} from "src/partials/state"
  import {logUsage} from "src/app/state"
  import SideNav from "src/app/SideNav.svelte"
  import Routes from "src/app/Routes.svelte"
  import Toast from "src/app/Toast.svelte"
  import TopNav from "src/app/TopNav.svelte"
  import Modal from "src/app/Modal.svelte"
  import ForegroundButtons from "src/app/ForegroundButtons.svelte"
  import {isMobile} from "src/util/html"
  import {newNotifications, newDirectMessages, newChatMessages} from "src/app/state"
  import cx from "classnames"

  Object.assign(window, {cmd, user, keys, network, pool, sync, db, bech32ToHex, hexToBech32})

  export let pathname = location.pathname
  export let hash = location.hash

  const {profile, canPublish} = user

  const style = document.createElement("style")

  document.head.append(style)

  $: style.textContent = `:root { ${getThemeVariables($theme)}; background: #111; }`

  tryFunc(() =>
    (navigator.registerProtocolHandler as (scheme: string, handler: string, name: string) => void)(
      "web+nostr",
      `${location.origin}/%s`,
      appName
    )
  )

  tryFunc(() => navigator.registerProtocolHandler("web+nostr", `${location.origin}/%s`))

  const seenChallenges = new Set()

  // When we get an AUTH challenge from our pool, attempt to authenticate
  pool.Config.authHandler = async (url, challenge) => {
    // if (keys.canSign() && !seenChallenges.has(challenge)) {
    //   seenChallenges.add(challenge)

    //   const publishable = await cmd.authenticate(url, challenge)

    //   return first(publishable.publish([{url}], null, "AUTH"))
    // }

    // makeshift fix for auth spam from paid relays
    return false;
  }

  onMount(() => {
    let scrollY

    // Log modals, keep scroll position on body, but don't allow scrolling
    const unsubModal = modal.stack.subscribe($stack => {
      if ($stack.length > 0) {
        logUsage(btoa(["modal", last($stack).type].join(":")))

        // This is not idempotent, so don't duplicate it
        if (document.body.style.position !== "fixed") {
          scrollY = window.scrollY

          document.body.style.top = `-${scrollY}px`
          document.body.style.position = `fixed`
        }
      } else if (!isNil(scrollY)) {
        document.body.setAttribute("style", "")
        window.scrollTo(0, scrollY)

        scrollY = null
      }
    })

    // Remove identifying information, e.g. pubkeys, event ids, etc
    const getPageName = () =>
      location.pathname.slice(1).replace(/(npub|nprofile|note|nevent)1[^\/]+/g, (_, m) => `<${m}>`)

    // Log usage on navigate
    const unsubHistory = globalHistory.listen(({location}) => {
      if (!location.hash) {
        logUsage(btoa(["page", getPageName()].join(":")))

        if (!hash) {
          document.body.scrollIntoView({
            behavior: location.pathname === pathname ? "smooth" : "auto",
          })
        }
      }

      pathname = location.pathname
      hash = location.hash
    })

    logUsage(btoa(["page", getPageName()].join(":")))

    return () => {
      unsubModal()
      unsubHistory()
    }
  })

  onReady(() => {
    initializeRelayList()

    const pubkey = user.getPubkey()

    if (pubkey) {
      loadAppData(pubkey)
    }

    const interval = setInterval(async () => {
      const {dufflepudUrl} = user.getSettings()

      if (!dufflepudUrl) {
        return
      }

      // Find relays with old/missing metadata and refresh them. Only pick a
      // few so we're not sending too many concurrent http requests
      const query = {refreshed_at: {$lt: now() - timedelta(7, "days")}}
      const staleRelays = shuffle(relays.all(query)).slice(0, 10)

      const freshRelays = await Promise.all(
        staleRelays.map(async ({url}) => {
          try {
            const res = await fetch(dufflepudUrl + "/relay/info", {
              method: "POST",
              body: JSON.stringify({url}),
              headers: {
                "Content-Type": "application/json",
              },
            })

            return {...(await res.json()), url, refreshed_at: now()}
          } catch (e) {
            if (!e.toString().includes("Failed to fetch")) {
              warn(e)
            }

            return {url, refreshed_at: now()}
          }
        })
      )

      relays.patch(freshRelays.filter(identity))
    }, 30_000)

    return () => {
      clearInterval(interval)
    }
  })
</script>

<Router url={pathname}>
  <div use:links>
    <Routes />
    <ForegroundButtons />
    <SideNav />
    <TopNav />
    <!-- {#if isMobile} -->
      <div class="bottom-bar fixed bottom-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-6 navbar-bg p-4 text-gray-2">
        <li class="botton-bar-button-container relative cursor-pointer">
          <a class="bottom-bar-button block px-4 py-2 transition-all hover:bg-accent hover:text-white" href="/notes">
            <i class="fa fa-home mr-2" />
          </a>
        </li>
        <li class="botton-bar-button-container relative cursor-pointer">
          <a class="bottom-bar-button block px-4 py-2 transition-all hover:bg-accent hover:text-white"
            href="/discover">
            <i class="fa fa-fire mr-2" />
          </a>
        </li>
        <li
        class={cx("relative", "botton-bar-button-container", {
          "cursor-pointer": $canPublish,
          "pointer-events-none opacity-75": !$canPublish,
        })}>
        <!-- <a class="bottom-bar-button block px-4 py-2 transition-all hover:bg-accent hover:text-white" href="/messages">
          <i class="fa fa-envelope mr-2" />
          {#if $newDirectMessages}
            <div class="absolute top-2 left-7 h-2 w-2 rounded bg-accent" />
          {/if}
        </a> -->
      </li> 
        <li class="botton-bar-button-container relative cursor-pointer">
          <a class="bottom-bar-button block px-4 py-2 transition-all hover:bg-accent hover:text-white" href="/search">
            <i class="fa fa-search mr-2" />
          </a>
        </li>
        <li class="botton-bar-button-container relative cursor-pointer">
          <a class="bottom-bar-button block px-4 py-2 transition-all hover:bg-accent hover:text-white"
            href="/notifications">
            <i class="fa fa-bell mr-2" />
            {#if $newNotifications}
              <div class="absolute top-3 right-5 h-2 w-2 rounded bg-accent" />
            {/if}
          </a>
        </li>
      </div>
    <!-- {/if} -->
    <Modal />
    <Toast />
  </div>
</Router>

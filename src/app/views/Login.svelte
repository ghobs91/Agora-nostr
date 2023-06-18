<script lang="ts">
  import {Capacitor} from "@capacitor/core"
  import {fly} from "svelte/transition"
  import {navigate} from "svelte-routing"
  import {modal, toast} from "src/partials/state"
  import Anchor from "src/partials/Anchor.svelte"
  import Content from "src/partials/Content.svelte"
  import Heading from "src/partials/Heading.svelte"
  import user from "src/agent/user"
  import {login} from "src/app/state"
  import {isMobile} from "src/util/html"
  import ExploreTopics from "./ExploreTopics.svelte"

  const nip07 = "https://github.com/nostr-protocol/nips/blob/master/07.md"

  const bootstrapRelays = [
    "wss://purplepag.es",
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
    "wss://feeds.nostr.band/popular",
    "wss://search.nos.today",
    "wss://nos.lol",
    "wss://e.nos.lol",
    "wss://relay.snort.social",
    "wss://rsslay.nostr.moe",
    "wss://rsslay.onrender.com",
    "wss://relay.current.fyi",
    "wss://offchain.pub",
    "wss://nostr.mom",
    "wss://nostr.mutinywallet.com",
    "wss://relay.mostr.pub"
  ]
  bootstrapRelays.forEach((relay) => {
    user.addRelay(relay)
  })

  const exploreTopics = [
    "cooking",
    "gaming",
    "worldnews",
    "books",
    "architecture",
    "space",
    "soccer",
    "baking",
    "travel",
    "cordcutters",
    "gadgets",
    "apple",
    "cars",
    "diy",
  ]

  const autoLogIn = async () => {
    const {nostr} = window as any

    if (nostr) {
      login("extension", await nostr.getPublicKey())
    } else {
      modal.push({type: "login/privkey"})
    }
  }

  if (isMobile) {
    toast.show("info", 'Install Agora as an app by tapping the browser share button below and then “add to home screen"');
  }

  const signUp = () => {
    modal.push({type: "onboarding", stage: "key"})
  }

  const pubkeyLogIn = () => {
    modal.push({type: "login/pubkey"})
  }

  if (user.getPubkey()) {
    navigate("/")
  }

  document.title = "Log In"
</script>

<div in:fly={{y: 20}}>
  <Content size="lg" class="text-center">
    <div class="flex max-w-2xl flex-col gap-8">
      <div class="mb-4 flex flex-col items-center justify-center">
        <Heading>Welcome!</Heading>
      </div>
      <p class="text-center">
        Follow your favorite topics across Nostr, Bluesky, Mastodon, and Twitter.
      </p>
      <!-- <div class="flex flex-col w-full border-opacity-50">
        <div class="divider"></div>
      </div> -->
      <ExploreTopics></ExploreTopics>
      <p class="text-center">
        Want to save your favorite topics and comment/upvote? Click below to log in, or generate a new account <b>(no email or phone number needed!)</b>
      </p>
      {#if !Capacitor.isNativePlatform()}
      <p>
        If you have a <Anchor href={nip07} external>compatible browser extension</Anchor> installed,
        we can automatically use that to log you in.
      </p>
      {/if}
      <div class="flex flex-col items-center gap-4">
        <div class="flex gap-4">
          <Anchor class="w-32 text-center" type="button-accent" on:click={autoLogIn}>Log In</Anchor>
          <Anchor class="w-32 text-center" type="button" on:click={signUp}>Sign Up</Anchor>
        </div>
        <!-- <Anchor type="unstyled" on:click={pubkeyLogIn}>
          <i class="fa fa-cogs" /> Advanced Login
        </Anchor> -->
      </div>
    </div>
  </Content>
</div>

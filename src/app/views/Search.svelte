<script>
  import {debounce} from "throttle-debounce"
  import {navigate} from "svelte-routing"
  import {nip05, nip19} from "nostr-tools"
  import {identity} from "ramda"
  import {fuzzy, tryFunc} from "src/util/misc"
  import {fromNostrURI} from "src/util/nostr"
  import {modal} from "src/partials/state"
  import Input from "src/partials/Input.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Content from "src/partials/Content.svelte"
  import BorderLeft from "src/partials/BorderLeft.svelte"
  import Scan from "src/app/shared/Scan.svelte"
  import PersonInfo from "src/app/shared/PersonInfo.svelte"
  import {sampleRelays, getUserReadRelays} from "src/agent/relays"
  import network from "src/agent/network"
  import {watch, people} from "src/agent/db"
  import user from "src/agent/user"
  import TopUsers from "./TopUsers.svelte"
  import ExploreTopics from "./ExploreTopics.svelte"
    import { compute_rest_props } from "svelte/internal"

  let q = ""
  let options = []
  let scanner
  let signup

  const openTopic = topic => {
    modal.push({type: "topic/feed", topic})
  }

  async function createBridgedBluesky(handle) {
    const mostrPubFormattedHandle = handle + '_at_atproto.brid.gy'
    const res = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${mostrPubFormattedHandle}`, {method: "get"});
    const mostrResponse = await res.json();
    if (!mostrResponse.error) {
      const pubKey = mostrResponse.names[`${mostrPubFormattedHandle}`];
      window.location.href = `/people/${pubKey}/notes`
    }
  }

  async function createBridgedLemmy(communityRSSUrl) {
    try {
        const res = await fetch(`https://rsslay.onrender.com/api/feed?url=https://lemmy.world/feeds${communityRSSUrl}.xml?sort=Hot`, {method: "get"});
        const rsslayResponse = await res.json();
        const pubKey = rsslayResponse.PubKey;
        console.log('PubKey: ', pubKey);
        window.location.href = `/people/${pubKey}/notes`
      } catch (e) {
        console.log('rsslay call failed!');
      }
  }

  async function createBridgedTwitter(handle) {
    const sanitizedHandle = handle.replace('@twitter', '');
    const mostrPubFormattedHandle = sanitizedHandle + '_at_bird.makeup';
    const res = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${mostrPubFormattedHandle}`, {method: "get"});
    const mostrResponse = await res.json();
    if (!mostrResponse.error) {
      const pubKey = mostrResponse.names[`${mostrPubFormattedHandle}`];
      window.location.href = `/people/${pubKey}/notes`
    } else {
      return false;
    }
  }

  async function createBridgedFediverse(handle) {
    let theHandle = handle;
    if (theHandle[0] === '@') {
      theHandle = theHandle.substring(1);
    }
    if (theHandle.indexOf('@') > 0) {
      let formattedHandleInstance = theHandle.split('@')[1];
      let handleName = theHandle.split('@')[0];
      const res = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${handleName}_at_${formattedHandleInstance}`, {method: "get"});
      const mostrResponse = await res.json();
      if (!mostrResponse.error) {
        const pubKey = mostrResponse.names[`${handleName}_at_${formattedHandleInstance}`];
        window.location.href = `/people/${pubKey}/notes`
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  const checkMastodon = async (q) => {
    const mastodonUserSearch = 'https://mastodon.social/api/v2/search?q='
    const res = await fetch(`${mastodonUserSearch}${q}`, {method: "get"})
    const json = await res.json()
    return json;
  }

  const loadPeople = debounce(500, search => {
    // If we have a query, search using nostr.band. If not, ask for random profiles.
    // This allows us to populate results even if search isn't supported by forced urls
    if (q.length > 2) {
      network.load({
        relays: sampleRelays([{url: "wss://relay.nostr.band"}, {url: "wss://search.nos.today"}]),
        filter: [{kinds: [0], search, limit: 10}],
      })
    } else if (people._coll.count() < 50) {
      network.load({
        relays: getUserReadRelays(),
        filter: [{kinds: [0], limit: 50}],
      })
    }
    
    // var regEx = /@?\b([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b/;

    checkMastodon(q).then((results) => {
      // console.log(`mastodon user search results json: ${results}`)
      if (results.accounts && results.accounts.length > 0) {
        createBridgedFediverse(search);
      }
    })

    // if ((search.match(/@/g)||[]).length > 1 && (search.match(/./g)||[]).length >= 1) {
    //   createBridgedFediverse(search);
    // }

    if (q.indexOf('npub') > -1) {
      window.location.href = `/people/${q}/notes`
    }
    if ((q.indexOf('bsky.social') > -1) || (q.indexOf('bsky.team') > -1)) {
      console.log('we searchin for Bluesky?');
      createBridgedBluesky(search);
    }
    if (q.indexOf('@twitter') > -1) {
      console.log('we searchin for Twitter?');
      createBridgedTwitter(search);
    }
    if (q.indexOf('/c/') > -1) {
      console.log('we searchin for Lemmy?');
      createBridgedLemmy(search);
    }

  })

  const tryParseEntity = debounce(500, async entity => {
    entity = fromNostrURI(entity)

    if (entity.length < 5) {
      return
    }

    if (entity.match(/^[a-f0-9]{64}$/)) {
      navigate("/" + nip19.npubEncode(entity))
    } else if (entity.includes("@")) {
      let profile = await nip05.queryProfile(entity)

      if (profile) {
        navigate("/" + nip19.nprofileEncode(profile))
      }
    } else {
      tryFunc(() => {
        nip19.decode(entity)
        navigate("/" + entity)
      }, "TypeError")
    }
  })

  const topicOptions = watch(["topics"], t =>
    t.all().map(topic => ({type: "topic", id: topic.name, topic, text: "#" + topic.name}))
  )

  const personOptions = watch(["people"], t =>
    t
      .all({
        pubkey: {$ne: user.getPubkey()},
        $or: [{"kind0.name": {$type: "string"}}, {"kind0.display_name": {$type: "string"}}],
      })
      .map(person => {
        const {name, about, display_name} = person.kind0

        return {
          person,
          type: "person",
          id: person.pubkey,
          text: "@" + [name, about, display_name].filter(identity).join(" "),
        }
      })
  )

  $: {
    loadPeople(q)
    tryParseEntity(q)
  }

  $: firstChar = q.slice(0, 1)

  $: {
    if (firstChar === "@") {
      options = $personOptions
    } else if (firstChar === "#") {
      options = $topicOptions
    } else {
      options = $personOptions.concat($topicOptions)
    }
  }

  $: search = fuzzy(options, {keys: ["text"]})

  document.title = "Search"
</script>

<Content>
  <div class="flex flex-col items-center justify-center">
    <Heading>Search</Heading>
    <p>
      Search for people and topics on Agora.
    </p>
    <p>
      To find a <b>Bluesky</b> profile, search their handle in this format: <b>jack.bsky.social</b>
    </p>
    <p>
      To find a <b>Twitter</b> profile, search their handle in this format: <b>elonmusk@twitter</b>
    </p>
    <p>
      To find a <b>Mastodon</b> profile, search their handle in this format: <b>@gargron@mastodon.social</b>
    </p>
  </div>
  <Input bind:value={q} placeholder="Search for people or topics">
    <i slot="before" class="fa-solid fa-search" />
    <i
      slot="after"
      class="fa-solid fa-camera cursor-pointer text-accent"
      on:click={() => scanner.start()} />
  </Input>

  {#if q.length > 0}
    {#each search(q).slice(0, 20) as result (result.type + result.id)}
      {#if result.type === "topic"}
        <BorderLeft on:click={() => openTopic(result.topic.name)}>
          #{result.topic.name}
        </BorderLeft>
      {:else if result.type === "person"}
        <PersonInfo person={result.person} />
      {/if}
    {/each}
  {/if}
  <br/>
  <br/>
  <ExploreTopics></ExploreTopics>
  <!-- <TopUsers {signup}></TopUsers> -->
</Content>

<Scan bind:this={scanner} onScan={tryParseEntity} />

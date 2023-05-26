<script>
  import {debounce} from "throttle-debounce"
  import {identity, sortBy, prop} from "ramda"
  import {fuzzy} from "src/util/misc"
  import {modal} from "src/partials/state"
  import Input from "src/partials/Input.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Content from "src/partials/Content.svelte"
  import BorderLeft from "src/partials/BorderLeft.svelte"
  import PersonInfo from "src/app/shared/PersonInfo.svelte"
  import {sampleRelays, getUserReadRelays} from "src/agent/relays"
  import network from "src/agent/network"
  import {watch} from "src/agent/db"
  import user from "src/agent/user"

  let q

  const openTopic = topic => {
    modal.push({type: "topic/feed", topic})
  }

  async function createBridgedBluesky(handle) {
    try {
        const sanitizedHandle = handle.replace('@', '');
        const res = await fetch(`https://rsslay.nostr.moe/api/feed?url=https://ghobs91-bluestream.deno.dev/${sanitizedHandle}`, {method: "get"});
        const rsslayResponse = await res.json();
        const pubKey = rsslayResponse.PubKey;
        console.log('PubKey: ', pubKey);
        window.location.href = `/people/${pubKey}/notes`
      } catch (e) {
        console.log('rsslay call failed!');
      }
  }

  async function createBridgedTwitter(handle) {
    try {
        const sanitizedHandle = handle.replace('@twitter', '');
        const res = await fetch(`https://rsslay.nostr.moe/api/feed?url=https://nitter.moomoo.me/${sanitizedHandle}/rss`, {method: "get"});
        const rsslayResponse = await res.json();
        const pubKey = rsslayResponse.PubKey;
        console.log('PubKey: ', pubKey);
        window.location.href = `/people/${pubKey}/notes`
      } catch (e) {
        console.log('rsslay call failed!');
      }
  }

  async function createBridgedMastodon(handle) {
    try {
        const sanitizedHandle = handle.replace('@mastodon.social', '');
        const res = await fetch(`https://rsslay.nostr.moe/api/feed?url=https://mastodon.social/${sanitizedHandle}.rss`, {method: "get"});
        const rsslayResponse = await res.json();
        const pubKey = rsslayResponse.PubKey;
        console.log('PubKey: ', pubKey);
        window.location.href = `/people/${pubKey}/notes`
      } catch (e) {
        console.log('rsslay call failed!');
      }
  }

  const loadPeople = debounce(500, search => {
    // If we have a query, search using nostr.band. If not, ask for random profiles.
    // This allows us to populate results even if search isn't supported by forced urls
    if (q.length > 2) {
      network.load({
        relays: sampleRelays([{url: "wss://relay.nostr.band"}, {url: "wss://search.nos.today"}]),
        filter: [{kinds: [0], search, limit: 10}],
      })
    } else {
      network.load({
        relays: getUserReadRelays(),
        filter: [{kinds: [0], limit: 50}],
      })
    }
    if (q.indexOf('bsky.social') > -1) {
      console.log('we searchin for Bluesky?');
      createBridgedBluesky(q);
    }
    if (q.indexOf('@twitter') > -1) {
      console.log('we searchin for Twitter?');
      createBridgedTwitter(q);
    }
    if (q.indexOf('@mastodon.social') > -1) {
      console.log('we searchin for Mastodon?');
      createBridgedMastodon(q);
    }
  })

  $: loadPeople(q)

  $: search = watch(["people", "topics"], (p, t) => {
    const topics = t
      .all()
      .map(topic => ({type: "topic", id: topic.name, topic, text: "#" + topic.name}))

    const people = p
      .all({"kind0.name": {$type: "string"}, pubkey: {$ne: user.getPubkey()}})
      .map(person => ({
        person,
        type: "person",
        id: person.pubkey,
        text: "@" + [person.kind0.name, person.kind0.about].filter(identity).join(" "),
      }))

    return fuzzy(sortBy(prop("id"), topics.concat(people)), {keys: ["text"]})
  })

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
      To find a <b>Mastodon</b> profile, search their handle in this format: <b>@Gargron@mastodon.social</b>
    </p>
  </div>
  <Input bind:value={q} placeholder="Search for people or topics">
    <i slot="before" class="fa-solid fa-search" />
  </Input>
  {#each $search(q).slice(0, 50) as result (result.type + result.id)}
    {#if result.type === "topic"}
      <BorderLeft on:click={() => openTopic(result.topic.name)}>
        #{result.topic.name}
      </BorderLeft>
    {:else if result.type === "person"}
      <PersonInfo person={result.person} />
    {/if}
  {/each}
</Content>

<script lang="ts">
  import {displayRelay} from "src/util/nostr"
  import Content from "src/partials/Content.svelte"
  import Feed from "src/app/shared/Feed.svelte"
  import RelayTitle from "src/app/shared/RelayTitle.svelte"
  import RelayActions from "src/app/shared/RelayActions.svelte"
  import {relays} from "src/agent/db"
  import Spinner from "src/partials/Spinner.svelte"
  import Card from "src/partials/Card.svelte"
  import ImageCircle from "src/partials/ImageCircle.svelte"
  import Anchor from "src/partials/Anchor.svelte"
  import {formatTimestamp} from "src/util/misc"

  export let url = 'wss://feeds.nostr.band/popular'
  export let size = 10

  const relay = relays.get(url) || {url}

  const mastodonFediTrendsAPI = 'https://api.feditrends.com/?order=pop&amp;hours=12'

  document.title = 'Popular Posts'

  const popularMastodon = async (): Promise <any[]> => {
    const res = await fetch(`${mastodonFediTrendsAPI}`, {method: "get"})
    const json = await res.json()
    return json
  }

  const getRsslayMastoProfile = async (mastoLink) => {
    const mastoLinkArray = mastoLink.split("/@")
    const mostrPubFormattedHandle = mastoLinkArray[1] + '_at_' + mastoLinkArray[0].replace('https://', '');
    const res = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${mostrPubFormattedHandle}`, {method: "get"});
    const mostrResponse = await res.json();
    if (!mostrResponse.error) {
      const pubKey = mostrResponse.names[`${mostrPubFormattedHandle}`];
      window.location.href = `/people/${pubKey}/notes`
    } else {
      const res = await fetch(`https://rsslay.onrender.com/api/feed?url=${mastoLink}.rss`, {method: "get"});
      const rsslayResponse = await res.json();
      const pubKey = rsslayResponse.NPubKey;
      console.log(`pubkey: ${pubKey}`)
      window.location.href = `/people/${pubKey}/notes`
    }
  }

  export let mastoArray = []

  $: popularMastodon().then((daArray) => {
    mastoArray.push(daArray);
  })

</script>

<Content>
  <div class="flex items-center gap-2 text-xl"><p>Popular Posts</p></div>
  {#await popularMastodon()}
  <Spinner />
  {:then resultArray }
      {#each resultArray as mastoPost}
        <Card class="discover-card" on:click={() => getRsslayMastoProfile(mastoPost.account.url)}>
          <div class="flex justify-between">
            <div class="flex">
              <Anchor class="text-lg font-bold" href={mastoPost.account.url}>
                <ImageCircle {size} src={mastoPost.account.avatar} />
              </Anchor>
              <div class="discover-card-name-header">{mastoPost.account.display_name}</div>
            </div>
            <div>{mastoPost.created_at.replace("T", " ").substring(0, 16)}</div>
          </div>
        {mastoPost.content.replace( /(<([^>]+)>)/ig, '').replaceAll('&#39;', '')}
        <!-- {#if mastoPost.media_attachments}
          {mastoPost.media_attachments[0].url}
        {/if} -->
        <br>
        <br>
        <button class="note-buttons text-left">
          <i class="fa fa-reply cursor-pointer"/>
          {mastoPost.replies_count}
        </button>
        <button class="note-buttons text-left">
          <i class="fa fa-heart cursor-pointer"/>
          {mastoPost.favourites_count}
        </button>
        </Card>
      {/each}
  {:catch}
    <p class="mb-1 py-24 px-12 text-center text-gray-5">
      Unable to load feditrends
    </p>
  {/await}
</Content>
<div class="border-b border-solid border-gray-6" />
<Content>
  <!-- <Feed relays={[relay]} filter={{kinds: [1]}} /> -->
</Content>
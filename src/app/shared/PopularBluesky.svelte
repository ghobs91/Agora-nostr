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
    import Media from "src/partials/Media.svelte"
  
    export let url = 'wss://feeds.nostr.band/popular'
    export let size = 6
  
    const relay = relays.get(url) || {url}
    const blueskyTrendingAPI = 'https://bsky.social/xrpc/app.bsky.feed.getFeed?feed=at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot&limit=50'
  
    document.title = 'Popular Posts'
  
    const popularBluesky = async (): Promise <any[]> => {
      const res = await fetch(blueskyTrendingAPI, {
                method: "GET",
                headers: {
                  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImNvbS5hdHByb3RvLmFjY2VzcyIsInN1YiI6ImRpZDpwbGM6bDdncWpuNmJjbDdtbHFkZGhzNm92aHc0IiwiaWF0IjoxNjg5MjA1MTY4LCJleHAiOjE2ODkyMTIzNjh9.6IVpGYbq0p27BeI88EvqCMJ8DGRAoqJqG8-k4jmRIHU",
                },
              })
      const json = await res.json()
      console.log(`bluesky response: ${json}`)
      return json.feed
    }
  
    const getRsslayBlueskyProfile = async (handle) => {
        const res = await fetch(`https://rsslay.onrender.com/api/feed?url=https://ghobs91-bluestream.deno.dev/${handle}`, {method: "get"});
        const rsslayResponse = await res.json();
        const pubKey = rsslayResponse.NPubKey;
        console.log(`pubkey: ${pubKey}`)
        window.location.href = `/people/${pubKey}/notes`
    }
  
    export let blueSkyArray = []
  
    $: popularBluesky().then((daArray) => {
        blueSkyArray.push(daArray);
    })
  
  </script>
  
  <Content>
    <div class="flex items-center gap-2 text-xl"><p>Popular Posts</p></div>
    {#await popularBluesky()}
    <Spinner />
    {:then resultArray }
        {#each resultArray as blueskyPost}
          <Card class="discover-card" on:click={() => getRsslayBlueskyProfile(blueskyPost.post.author.handle)}>
            <div class="topic-post-buttons">
              <button class="note-buttons text-left">
                  <i class="fa fa-reply cursor-pointer"/>
                  {blueskyPost.post.replyCount}
              </button>
              <button class="note-buttons text-left">
                  <i class="fa fa-heart cursor-pointer"/>
                  {blueskyPost.post.likeCount}
              </button>
            </div>
            <div class="topic-post-main-section">
              <div class="flex justify-between">
              </div>
              <div class="topic-post-content">
                {blueskyPost.post.record.text}
              </div>
              <!-- {#if blueskyPost.media_attachments.length > 0}
                {#if blueskyPost.media_attachments[0].url}
                  <Media link={blueskyPost.media_attachments[0]} onClose={close} />
                {/if}
              {/if} -->
              <div class="topic-post-info">
                <div class="flex">
                  <!-- <Anchor class="text-lg font-bold" href={blueskyPost.account.url}> -->
                  <ImageCircle {size} src={blueskyPost.post.author.avatar} />
                  <!-- </Anchor> -->
                  <div class="discover-card-name-header">{blueskyPost.post.author.displayName}</div>
                </div>
                <div>{blueskyPost.post.record.createdAt}</div>
              </div>
            </div>
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
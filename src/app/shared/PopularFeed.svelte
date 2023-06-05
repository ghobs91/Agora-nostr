<script lang="ts">
  import {displayRelay} from "src/util/nostr"
  import Content from "src/partials/Content.svelte"
  import Feed from "src/app/shared/Feed.svelte"
  import RelayTitle from "src/app/shared/RelayTitle.svelte"
  import RelayActions from "src/app/shared/RelayActions.svelte"
  import {relays} from "src/agent/db"

  export let url = 'wss://feeds.nostr.band/popular'

  const relay = relays.get(url) || {url}

  const mastodonFediTrendsAPI = 'https://api.feditrends.com/'

  document.title = 'Popular Posts'
</script>

<Content>
  <div class="flex items-center gap-2 text-xl"><p>Popular Posts</p></div>
</Content>
<div class="border-b border-solid border-gray-6" />
<Content>
  <Feed relays={[relay]} filter={{kinds: [1]}} />
</Content>
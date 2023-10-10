<script lang="ts">
    import {displayRelay, Tags} from "src/util/nostr"
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
    import {pluck, find} from "ramda"
    import user from "src/agent/user"
    import Media from "src/partials/Media.svelte"
  
    export let url = 'wss://feeds.nostr.band/popular'
    export let size = 6
    export let topicFromFilter

    const relay = relays.get(url) || {url}
    const mastodonFediTrendsAPI = 'https://mastodon.social/api/v1/timelines/tag/'
    const lemmyCommunitySearchAPI = 'https://sh.itjust.works/api/v3/search?q='
    const lemmyCommunityAPI = 'https://sh.itjust.works/api/v3/post/list?limit=10&page=1&sort=Hot&type_=All&community_name='
    document.title = 'Popular Posts'

    const getLemmyPostsForTopic = async (topicFromFilter): Promise <any[]> => {
      const lemmyCommunitySearchResponse = await fetch(`${lemmyCommunitySearchAPI}${topicFromFilter}&type_=Communities&sort=TopAll&listing_type=All&page=1&limit=5`, {method: "get"})
      if (lemmyCommunitySearchResponse.status === 200) {
        const json = await lemmyCommunitySearchResponse.json()
        if (typeof json === "object") {
          const baseUrl = json.communities[0].community.actor_id.replace('https://', '')
          const community = baseUrl.split('/c/')[1];
          const instance = baseUrl.split('/c/')[0];
          const fullCommunityHandle = community + '@' + instance;
          const res = await fetch(`${lemmyCommunityAPI}${fullCommunityHandle}`, {method: "get"})
          if (res.status === 200) {
            const json = await res.json()
            if (typeof json === "object") {
              return json;
            }
          }
        }
      }
    }

    const getMastodonPostsForTopic = async (topicFromFilter): Promise <any[]> => {
        const res = await fetch(`${mastodonFediTrendsAPI}${topicFromFilter}`, {method: "get"})
        console.log(`res: ${res}`)
        const json = await res.json()
        console.log(`json: ${json}`)
        return json.slice(0, 20);
    }

    let compilePosts = async (topicFromFilter) => {
            const allAsyncResults = []

            // for (const item of tagsArray) {
                const asyncResult = await getMastodonPostsForTopic(topicFromFilter)
                allAsyncResults.push(asyncResult)
            // }
            console.log(`allAsyncResults: ${allAsyncResults}`)
            return allAsyncResults;
        }
    // let compileLemmyPosts = async () => {
    //   const lemmyAsyncResult = await getLemmyPostsForTopic(topicFromFilter)
    //   let processedLemmyPosts = []
    //   if (lemmyAsyncResult) {
    //     lemmyAsyncResult['posts'].forEach((unProcessedLemmyPost) => {
    //       const instanceUrlBase = unProcessedLemmyPost.community.actor_id.split("/c/")[0]
    //       const instanceUrlSuffix = unProcessedLemmyPost.community.actor_id.split("/c/")[1]
    //       processedLemmyPosts.push({
    //         content: unProcessedLemmyPost.post.name,
    //         replies_count: unProcessedLemmyPost.counts.comments,
    //         favourites_count: unProcessedLemmyPost.counts.score,
    //         postTopic: unProcessedLemmyPost.community.name,
    //         thumbnail: unProcessedLemmyPost.post.thumbnail_url ? {url: unProcessedLemmyPost.post.thumbnail_url, type: "image"} : null,
    //         account: {url: instanceUrlBase + '/feeds/c/' + instanceUrlSuffix + '.xml?sort=Hot'},
    //         contentUrl: unProcessedLemmyPost.post.url,
    //         postCreater: unProcessedLemmyPost.creator.name
    //       })
    //     })
    //     if (processedLemmyPosts) {
    //       allFediverseAsyncResults.push(processedLemmyPosts);
    //     }
    //   }
    // }
  
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
  
    $: compilePosts(topicFromFilter);
  
  </script>
  
  <Content>
    {#await compilePosts(topicFromFilter)}
    <Spinner />
    {:then allAsyncResults }
        {#each allAsyncResults as topicArray}
            {#each topicArray as mastoPost}
                <Card class="discover-card" on:click={() => getRsslayMastoProfile(mastoPost.account.url)}>
                    <div class="topic-post-buttons">
                        <button class="note-buttons text-left">
                            <i class="fa fa-reply cursor-pointer"/>
                            {mastoPost.replies_count}
                        </button>
                        <button class="note-buttons text-left">
                            <i class="fa fa-heart cursor-pointer"/>
                            {mastoPost.favourites_count}
                        </button>
                      </div>
                      <div class="topic-post-main-section">
                        <div class="flex justify-between">
                        </div>
                        <div class="topic-post-content">
                          {mastoPost.content.replace( /(<([^>]+)>)/ig, '').replaceAll('&#39;', '').replaceAll('&quot;', '"').replaceAll('&amp;', '&')}
                        </div>
                        {#if mastoPost.media_attachments.length > 0}
                            {#if mastoPost.media_attachments[0].url}
                                <Media link={mastoPost.media_attachments[0]} onClose={close} />
                            {/if}
                        {/if}
                        <div class="topic-post-info">
                          <div class="flex">
                            <Anchor class="text-lg font-bold" href={mastoPost.account.url}>
                            <ImageCircle {size} src={mastoPost.account.avatar} />
                            </Anchor>
                            <div class="discover-card-name-header">{mastoPost.account.display_name}</div>
                          </div>
                          <div>{mastoPost.created_at.replace("T", " ").substring(0, 16)}</div>
                        </div>
                      </div>
                </Card>
            {/each}
        {/each}
    {:catch}
      <p class="mb-1 py-24 px-12 text-center text-gray-5">
        Unable to load feditrends
      </p>
    {/await}
  </Content>
  <div class="border-b border-solid border-gray-6" />
  <Content>
  </Content>
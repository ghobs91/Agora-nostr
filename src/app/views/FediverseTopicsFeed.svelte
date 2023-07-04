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
    import {modal} from "src/partials/state"
    import Media from "src/partials/Media.svelte"
  
    export let url = 'wss://feeds.nostr.band/popular'
    export let size = 6
  
    let list;
    let tagsArray = []
    list = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists());
    list.tags.forEach((tag) => {
        if (tag[0] === "t") {
            tagsArray.push(tag[1])
        }
    })

    const relay = relays.get(url) || {url}
    const mastodonFediTrendsAPI = 'https://api.feditrends.com/?hours=12&order=pop&query='
    document.title = 'Home - Agora'

    const getPostsForTopic = async (topic): Promise <any[]> => {
        const res = await fetch(`${mastodonFediTrendsAPI}${topic}`, {method: "get"})
        console.log(`res: ${res}`)
        const json = await res.json()
        console.log(`json: ${json}`)
        return json.slice(0, 20);
    }

    const openTopic = topic => {
      modal.push({type: "topic/feed", topic})
    }

    let compilePosts = async (tagsArray) => {
            const allAsyncResults = []

            for (const item of tagsArray) {
                const asyncResult = await getPostsForTopic(item)
                allAsyncResults.push(asyncResult)
            }
            console.log(`allAsyncResults: ${allAsyncResults}`)
            allAsyncResults.forEach((topicArray) => {
              topicArray.forEach((mastoPost) => {
                let topicsInPost = []
                topicsInPost.push(mastoPost.content.replace( /(<([^>]+)>)/ig, '').replaceAll('&#39;', '').match(/#\w+/g));
                mastoPost.topicsInPost = []
                topicsInPost.forEach((topic) => {
                  topic = topic + ''
                  mastoPost.topicsInPost.push(topic);
                })

                mastoPost.topicsInPost = mastoPost.topicsInPost[0].split(',').slice(0,4)
                
                console.log(`mastoPost.topicsInPost: ${mastoPost.topicsInPost}`)
              });
            });
            return allAsyncResults;
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
  
    $: compilePosts(tagsArray);
  
  </script>
  
  <Content>
    {#await compilePosts(tagsArray)}
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
                    <div class="topic-pill-section">
                      {#each mastoPost.topicsInPost as topicPill}
                        <Anchor class="topic-pill" killEvent on:click={() => openTopic(topicPill.replace('#', ''))}>{topicPill}</Anchor>
                      {/each}
                    </div>
                    <!-- <div class="flex justify-between">
                    </div> -->
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
    <!-- <Feed relays={[relay]} filter={{kinds: [1]}} /> -->
  </Content>
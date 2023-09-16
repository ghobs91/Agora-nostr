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
    list?.tags.forEach((tag) => {
        if (tag[0] === "t") {
            tagsArray.push(tag[1])
        }
    })

    const relay = relays.get(url) || {url}
    const mastodonFediTrendsAPI = 'https://mastodon.social/api/v1/timelines/tag/'
    const lemmyCommunitySearchAPI = 'https://sh.itjust.works/api/v3/search?q='
    const lemmyCommunityAPI = 'https://sh.itjust.works/api/v3/post/list?limit=10&page=1&sort=Hot&type_=All&community_name='
    document.title = 'Home - Agora'

    const getMastodonPostsForTopic = async (topic): Promise <any[]> => {
        const res = await fetch(`${mastodonFediTrendsAPI}${topic}?limit=10`, {method: "get"})
        // console.log(`res: ${res}`)
        const json = await res.json()
        // console.log(`json: ${json}`)
        return json.slice(0, 20);
    }

    const getLemmyPostsForTopic = async (topic): Promise <any[]> => {
      const lemmyCommunitySearchResponse = await fetch(`${lemmyCommunitySearchAPI}${topic}&type_=Communities&sort=TopAll&listing_type=All&page=1&limit=5`, {method: "get"})
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

      // const res = await fetch(`${lemmyCommunityAPI}${topic}%40lemmy.world`, {method: "get"})
      // if (res.status === 200) {
      //   const json = await res.json()
      //   if (typeof json === "object") {
      //     return json;
      //   }
      // } else {
      //   const res = await fetch(`${lemmyCommunityAPI}${topic}%40lemmy.ml`, {method: "get"})
      //   if (res.status === 200) {
      //     const json = await res.json()
      //     if (typeof json === "object") {
      //       return json;
      //     }
      //   }
      // }
    }

    const arrayShuffle = (originalArray): any[] => {
      var array = [].concat(originalArray);
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    const openTopic = topic => {
      modal.push({type: "topic/feed", topic})
    }

    let compilePosts = async (tagsArray) => {
            const allFediverseAsyncResults = []
            const allLemmyAsyncResults = []

            for (const item of tagsArray) {
                // const mastodonAsyncResult = await getMastodonPostsForTopic(item)
                // allFediverseAsyncResults.push(mastodonAsyncResult)
                
                const lemmyAsyncResult = await getLemmyPostsForTopic(item)
                let processedLemmyPosts = []
                if (lemmyAsyncResult) {
                  lemmyAsyncResult['posts'].forEach((unProcessedLemmyPost) => {
                    const instanceUrlBase = unProcessedLemmyPost.community.actor_id.split("/c/")[0]
                    const instanceUrlSuffix = unProcessedLemmyPost.community.actor_id.split("/c/")[1]
                    processedLemmyPosts.push({
                      content: unProcessedLemmyPost.post.name,
                      replies_count: unProcessedLemmyPost.counts.comments,
                      favourites_count: unProcessedLemmyPost.counts.score,
                      postTopic: unProcessedLemmyPost.community.name,
                      thumbnail: unProcessedLemmyPost.post.thumbnail_url ? {url: unProcessedLemmyPost.post.thumbnail_url, type: "image"} : null,
                      account: {url: instanceUrlBase + '/feeds/c/' + instanceUrlSuffix + '.xml?sort=Hot'},
                      contentUrl: unProcessedLemmyPost.post.url,
                      postCreater: unProcessedLemmyPost.creator.name
                    })
                  })
                  if (processedLemmyPosts) {
                    allFediverseAsyncResults.push(processedLemmyPosts);
                  }
                }
            }

            // allFediverseAsyncResults.forEach((topicArray) => {
            //   topicArray.forEach((mastoPost) => {
            //     let topicsInPost = []
            //     topicsInPost.push(mastoPost.content.replace( /(<([^>]+)>)/ig, '').replaceAll('&#39;', '').match(/#\w+/g));
            //     mastoPost.topicsInPost = []
            //     topicsInPost.forEach((topic) => {
            //       topic = topic + ''
            //       mastoPost.topicsInPost.push(topic);
            //     })
            //     let matchedTopics = []
            //     let topicArrayToMatchAgainst = mastoPost.topicsInPost[0].split(',')
            //     topicArrayToMatchAgainst.forEach((topic) => {
            //       if (tagsArray.includes(topic.replace('#', ''))) {
            //         matchedTopics.push(topic)
            //       }
            //     })
            //     if (matchedTopics.length > 0) {
            //       mastoPost.topicsInPost = matchedTopics;
            //     } else {
            //       mastoPost.topicsInPost = mastoPost.topicsInPost[0].split(',').slice(0, 5)
            //     }
            //   });
            // });
            let monolithArray = []
            allFediverseAsyncResults.forEach((topicArray) => {
              topicArray.forEach((post) => {
                monolithArray.push(post);
                // console.log(`monolithArray: ${monolithArray}`)
              })
            })
            
            return arrayShuffle(monolithArray);
        }
  
    const getRsslayMastoProfile = async (mastoPost) => {
      const mastoLink = mastoPost.account.url
      const mastoLinkArray = mastoLink.split("/@")
      const mostrPubFormattedHandle = mastoLinkArray[1] + '_at_' + mastoLinkArray[0].replace('https://', '');
      const res = await fetch(`https://mostr.pub/.well-known/nostr.json?name=${mostrPubFormattedHandle}`, {method: "get"});
      const mostrResponse = await res.json();
      if (!mostrResponse.error) {
        const pubKey = mostrResponse.names[`${mostrPubFormattedHandle}`];
        window.location.href = `/people/${pubKey}/notes`
      } else {
        if (mastoPost.contentUrl) {
          window.location.href = mastoPost.contentUrl;
        }

        else {
          // const res = await fetch(`https://rsslay.onrender.com/api/feed?url=${mastoLink}.rss`, {method: "get"});
          const res = await fetch(`https://rsslay.onrender.com/api/feed?url=${mastoLink}`, {method: "get"});
          const rsslayResponse = await res.json();
          const pubKey = rsslayResponse.NPubKey;
          console.log(`pubkey: ${pubKey}`)
          window.location.href = `/people/${pubKey}/notes`
        }
      }
    }
  
    $: compilePosts(tagsArray);
  
  </script>
  
  <Content>
    {#await compilePosts(tagsArray)}
    <Spinner />
    {:then monolithArray }
        <!-- {#each allFediverseAsyncResults as topicArray} -->
            {#each monolithArray as mastoPost}
                <Card class="discover-card" on:click={() => getRsslayMastoProfile(mastoPost)}>
                  <div class="topic-post-buttons">
                    <button class="note-buttons text-left">
                      <i class="fa-solid fa-arrow-up fa-lg cursor-pointer"/>
                        {mastoPost.favourites_count}
                    </button>
                    <button class="note-buttons text-left">
                      <i class="fa-regular fa-comment cursor-pointer"/>
                      {mastoPost.replies_count}
                    </button>
                  </div>
                  <div class="topic-post-main-section">
                    <!-- {#if mastoPost.topicsInPost[0] != 'null'}
                      <div class="topic-pill-section">
                        {#each mastoPost.topicsInPost as topicPill}
                          <Anchor class="topic-pill" killEvent on:click={() => openTopic(topicPill.replace('#', ''))}>{topicPill}</Anchor>
                        {/each}
                      </div>
                    {/if} -->
                    <div class="topic-post-content">
                      {mastoPost.content.replace( /(<([^>]+)>)/ig, '').replaceAll('&#39;', '').replaceAll('&quot;', '"').replaceAll('&amp;', '&')}
                    </div>
                    <!-- {#if mastoPost.media_attachments.length > 0}
                      {#if mastoPost.media_attachments[0].url}
                        <Media link={mastoPost.media_attachments[0]} onClose={close} />
                      {/if}
                    {/if} -->
                    {#if mastoPost.thumbnail}
                      <div class="thumbnail-container">
                        <Media link={mastoPost.thumbnail} onClose={close} />
                      </div>
                    {/if}

                    {#if mastoPost.postTopic}
                      <div class="topic-pill-section">
                          <Anchor class="topic-pill" killEvent on:click={() => openTopic(mastoPost.postTopic.replace('#', ''))}>#{mastoPost.postTopic}</Anchor>
                      </div>
                    {/if}
                    
                    <div class="topic-post-info">
                      <div class="flex">
                        <!-- <Anchor class="text-lg font-bold" href={mastoPost.account.url}> -->
                        <ImageCircle {size} src={'https://lemmy.world/pictrs/image/f9b045ca-ca15-43b4-aeed-1188183d7087.png?format=webp&thumbnail=96'} />
                        <!-- </Anchor> -->
                        {#if mastoPost.postCreater}
                          <div class="discover-card-name-header">/u/{mastoPost.postCreater}</div>
                        {/if}
                      </div>
                      <!-- <div>{mastoPost.created_at.replace("T", " ").substring(0, 16)}</div> -->
                    </div>
                  </div>
                </Card>
            {/each}
        <!-- {/each} -->
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
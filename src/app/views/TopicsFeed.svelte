<script>
    import Feed from "src/app/shared/Feed.svelte"
    import Content from "src/partials/Content.svelte"
    import Heading from "src/partials/Heading.svelte"
    import TopicActions from "src/app/shared/TopicActions.svelte"
    import {sampleRelays, getUserReadRelays} from "src/agent/relays"
    import {modal, theme} from "src/partials/state"
    import {bootstrapRelays} from "src/app/state"
    import {pluck, find} from "ramda"
    import {Tags} from "src/util/nostr"
    import Anchor from "src/partials/Anchor.svelte"
    import user from "src/agent/user"
    import TopicFeed from "./TopicFeed.svelte"
    
    export let followedTopicsList;

    console.log(`followedTopicsList from TopicsFeed: ${followedTopicsList.tags}`)
  
    const {profile, canPublish} = user
  
    bootstrapRelays.forEach((relay) => {
      user.addRelay(relay)
    })
  
    let list;
    list = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists());
    const tags = Tags.wrap(list?.tags || [])
    let values = {
      name: tags.getMeta("d") || "",
      params: tags.type(["t", "p"]).all(),
      relays: tags.type("r").all(),
    }

    let cleanedUpTopicsList = []

    followedTopicsList.tags.forEach(element => {
        if ((element !== 'd') && (element !== 't') && (element !== 'agora_followed_topics')) {
            cleanedUpTopicsList.push(element);
        }
    });
  

    // const relays = sampleRelays(getUserReadRelays())
    // export let filter = [{kinds: [1], "#t": [topic]}]
    // const topicFromFilter = filter[0]["#t"]

  
  </script>
  
  <Content>
    {#each cleanedUpTopicsList as topic}
        <TopicFeed topic={topic[1]}></TopicFeed>
    {/each}
    <!-- <div class="flex justify-between gap-2"> -->
      <!-- <Heading>#{topic}</Heading> -->
    <!-- </div> -->
    <!-- <Feed {relays} {filter} /> -->
  </Content>
  
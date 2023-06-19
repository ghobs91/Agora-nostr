<script>
  import Feed from "src/app/shared/Feed.svelte"
  import Content from "src/partials/Content.svelte"
  import Heading from "src/partials/Heading.svelte"
  import TopicActions from "src/app/shared/TopicActions.svelte"
  import {sampleRelays, getUserReadRelays} from "src/agent/relays"
  import {modal, theme} from "src/partials/state"
  import {pluck, find} from "ramda"
  import {Tags} from "src/util/nostr"
  import Anchor from "src/partials/Anchor.svelte"
  import user from "src/agent/user"
  export let topic

  const {profile, canPublish} = user

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

  let list;
  list = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists());
  const tags = Tags.wrap(list?.tags || [])
  let values = {
    name: tags.getMeta("d") || "",
    params: tags.type(["t", "p"]).all(),
    relays: tags.type("r").all(),
  }

  let isFollowingTopic = null;
  const topicsList = values.params;

  topicsList.forEach((topicObject) => {
    if (topicObject[1] === topic.toLowerCase()) {
      isFollowingTopic = true;
    }
  });
  const relays = sampleRelays(getUserReadRelays())
  const filter = [{kinds: [1], "#t": [topic]}]

  const addMoreTopicsModal = () => {
    console.log('followedTopicsList: ', topic);
    modal.push({type: "list/edit", topic})
  }

  const addToTopicsList = async () => {
    if (!values.name) {
      values.name = "agora_followed_topics";
    }
    const existingList = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === values.name, user.getLists());
    if (
      find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === values.name, user.getLists())
    ) {
      list.id = existingList.id;
    }
    const {name, params, relays} = values
    params.push(["t", topic]);
    user.putList(list?.id, name, params, relays)
    console.log(`new topics list: ${params}`);
    window.location.href="/"
  }

  // const removeFromTopicsList = async () => {
  //   if (!values.name) {
  //     values.name = "agora_followed_topics";
  //   }
  //   const existingList = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === values.name, user.getLists());
  //   if (
  //     find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === values.name, user.getLists())
  //   ) {
  //     list.id = existingList.id;
  //   }
  //   const {name, params, relays} = values
  //   let idx = params.findIndex(p => p[1]==["t", topic.toLowerCase()]);
  //   console.log(`the index where that topic is found is ${idx}`);
  //   const newTopicsArray = params.toSpliced(idx, 1);
  //   console.log(`newTopicsArray without that topic: ${newTopicsArray}`);
  //   // user.putList(list?.id, name, params, relays)
  //   // console.log(`new topics list: ${params}`);
  //   // window.location.href="/"
  // }

</script>

<Content>
  <div class="flex justify-between gap-2">
    <Heading>#{topic}</Heading>
    {#if !isFollowingTopic && $profile.pubkey}
    <div class="flex items-center justify-between">
      <Anchor type="button-accent" on:click={() => addToTopicsList()}>
        <i class="fa fa-plus" /> Follow Topic
      </Anchor>
    </div>
    <!-- {:else}
    <div class="flex items-center justify-between">
      <Anchor type="button-accent" on:click={() => removeFromTopicsList()}>
        <i class="fa fa-minus" /> Unfollow Topic
      </Anchor>
    </div> -->
    {/if}
  </div>
  <Feed {relays} {filter} />
</Content>

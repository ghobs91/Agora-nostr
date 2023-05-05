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

  const relays = sampleRelays(getUserReadRelays())
  const filter = [{kinds: [1], "#t": ["microsoft"]}]

  const addMoreTopicsModal = () => {
    console.log('followedTopicsList: ', topic);
    modal.push({type: "list/edit", topic})
  }

</script>

<Content>
  <div class="flex justify-between gap-2">
    <Heading>#{topic}</Heading>
    <div class="flex items-center justify-between">
      <Anchor type="button-accent" on:click={() => addMoreTopicsModal()}>
        <i class="fa fa-plus" /> Follow This Topic
      </Anchor>
    </div>
  </div>
  <Feed {relays} {filter} />
</Content>

<script lang="ts">
  import cx from "classnames"
  import {prop, indexBy, objOf, filter as _filter} from "ramda"
  import {shuffle} from "src/util/misc"
  import {Tags} from "src/util/nostr"
  import {modal, theme} from "src/partials/state"
  import Anchor from "src/partials/Anchor.svelte"
  import Content from "src/partials/Content.svelte"
  import Tabs from "src/partials/Tabs.svelte"
  import Popover from "src/partials/Popover.svelte"
  import Feed from "src/app/shared/Feed.svelte"
  import {getUserFollows, getUserNetwork} from "src/agent/social"
  import {sampleRelays, getAllPubkeyWriteRelays, getUserReadRelays} from "src/agent/relays"
  import user from "src/agent/user"
  import {feedsTab} from "src/app/state"
  import {pluck, find} from "ramda"
  import FediverseTopicsFeed from "src/app/views/FediverseTopicsFeed.svelte"
  import TopicsFeed from "src/app/views/TopicsFeed.svelte"


  const {lists, canPublish} = user
  let topicsListCreated = false;
  let list;
  let includesReposts;
  topicsListCreated = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists())
  console.log('value of topicsListCreated: ', topicsListCreated);
  const defaultTabs = topicsListCreated ? ["Topics", "Friends"] : ["Friends", "Topics"]

  let relays, filter
  const tags = Tags.wrap(list?.tags || [])

  let values = {
    name: tags.getMeta("d") || "",
    params: tags.type(["t", "p"]).all(),
    relays: tags.type("r").all(),
  }
  const {name, params} = values
  if (!find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists())){
    console.log('nah we dont got dat list');
    modal.push({type: "list/edit"})
  }

  $: listsByName = indexBy(l => Tags.from(l).getMeta("d"), $lists)
  $: allTabs = defaultTabs.concat(Object.keys(listsByName))
  $: $feedsTab = allTabs.includes($feedsTab) ? $feedsTab : defaultTabs[0]
  $: visibleTabs = defaultTabs.includes($feedsTab) ? defaultTabs : [defaultTabs[0], $feedsTab]
  $: followedTopicsList = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists())


  $: {
    if ($feedsTab === "Friends") {
      const authors = shuffle(getUserFollows()).slice(0, 256)

      filter = {authors}
      includesReposts = true

      if (authors.length < 1) {
        relays = [{url: 'wss://feeds.nostr.band/popular'}]
      } else {
        relays = sampleRelays(getAllPubkeyWriteRelays(authors))
      }
    } else if ($feedsTab === "Global") {
      const authors = shuffle(getUserNetwork()).slice(0, 256)

      filter = {authors}
      relays = sampleRelays(getAllPubkeyWriteRelays(authors))
    } else if ($feedsTab === "Topics"){
      if (!find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists())){
        console.log('nah we dont got dat list');
        modal.push({type: "list/edit"})
      } else {
        const list = listsByName["agora_followed_topics"]
        const tags = Tags.from(list)
        const authors = tags.type("p").values().all()
        console.log("authors: ", authors);
        const topics = tags.type("t").values().all()
        const urls = tags.type("r").values().all()

        filter = _filter(prop("length"), {authors, "#t": topics})
        relays = urls.length > 0 ? urls.map(objOf("url")) : sampleRelays(getUserReadRelays())
      }
    }

    filter = [{...filter, kinds: [1, 6]}]
  }

  const setActiveTab = tab => {
    $feedsTab = tab
  }

  const showLists = () => {
    modal.push({type: "list/list"})
  }

  const addMoreTopicsModal = followedTopicsList => {
    // const followedTopicsList = find(e => e.id !== list?.id && Tags.from(e).getMeta("d") === "agora_followed_topics", user.getLists())
    console.log('followedTopicsList: ', followedTopicsList);
    modal.push({type: "list/edit", followedTopicsList})
  }

  document.title = $feedsTab
</script>

<Content>
  {#if !user.getProfile()}
    <Content size="lg" class="text-center">
      <p class="text-xl">Don't have an account?</p>
      <p>
        Click <Anchor href="/login">here</Anchor> to join the nostr network.
      </p>
    </Content>
  {/if}
  <div>
    <Tabs tabs={visibleTabs} activeTab={$feedsTab} {setActiveTab}>
      {#if $canPublish}

      <div class="flex items-center justify-between">
        <Anchor type="button-accent" on:click={() => addMoreTopicsModal(followedTopicsList)}>
          <i class="fa fa-plus" /> My Topics
        </Anchor>
      </div>
        <!-- {#if $lists.length > 0}
          <Popover placement="bottom" opts={{hideOnClick: true}} theme="transparent">
            <i slot="trigger" class="fa fa-ellipsis-v cursor-pointer p-2" />
            <div
              slot="tooltip"
              class="flex flex-col items-start overflow-hidden rounded border border-solid border-gray-8 bg-black">
              {#each $lists as e (e.id)}
                {@const meta = Tags.from(e).asMeta()}
                <button
                  class={cx("w-full py-2 px-3 text-left transition-colors", {
                    "hover:bg-gray-7": $theme === "dark",
                    "hover:bg-gray-1": $theme === "light",
                  })}
                  on:click={() => {
                    $feedsTab = meta.d
                  }}>
                  <i class="fa fa-scroll fa-sm mr-1" />
                  {meta.d}
                </button>
              {/each}
              <button
                on:click={showLists}
                class={cx("w-full py-2 px-3 text-left transition-colors", {
                  "hover:bg-gray-7": $theme === "dark",
                  "hover:bg-gray-1": $theme === "light",
                })}>
                <i class="fa fa-cog fa-sm mr-1" /> Customize
              </button>
            </div>
          </Popover>
        {:else}
          <i class="fa fa-ellipsis-v cursor-pointer p-1" on:click={showLists} />
        {/if} -->
      {/if}
    </Tabs>
    {#key $feedsTab}
      {#if $feedsTab === "Topics"}
        <!-- <TopicsFeed followedTopicsList={followedTopicsList}></TopicsFeed> -->
        <FediverseTopicsFeed></FediverseTopicsFeed>
        {:else}
        {#if getUserFollows().length < 5}
          <Feed relays={[{url: 'wss://feeds.nostr.band/popular'}]} filter={{kinds: [1]}} {includesReposts} />
          {:else}
            <Feed {relays} {filter} {includesReposts}/>
        {/if}
      {/if}
      
    {/key}
  </div>
</Content>

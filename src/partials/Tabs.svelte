<script>
  import {fly} from "svelte/transition"
  import {toTitle} from "hurdak/lib/hurdak"
  import Anchor from "src/partials/Anchor.svelte"

  export let tabs
  export let activeTab
  export let setActiveTab
  export let getDisplay = tab => ({title: toTitle(tab), badge: null})
</script>

<div
  class="flex items-center justify-between overflow-auto border-b border-solid border-gray-7 pt-2"
  in:fly={{y: 20}}>
  <div class="flex">
    {#each tabs as tab}
      {@const {title, badge} = getDisplay(tab)}
      <button
        class="flex cursor-pointer gap-2 border-solid active-tab px-8 py-4 hover:border-b"
        class:border-b={activeTab === tab}
        on:click={() => setActiveTab(tab)}>
        <div>{title}</div>
        {#if badge}
          <div class="h-6 rounded-full bg-gray-6 px-2">{badge}</div>
        {/if}
      </button>
    {/each}
    <button
      class="flex cursor-pointer gap-2 border-solid border-gray-6 px-8 py-4 hover:border-b">
      <Anchor type="unstyled" href="/discover">
        <i class="fa" /> Discover
      </Anchor>
    </button>
    <!-- <div class="flex items-center justify-between">
      <Anchor type="unstyled" href="/suggested">
        <i class="fa" /> Suggested
      </Anchor>
    </div> -->
  </div>
  <slot />
</div>

<script>
  import cx from "classnames"
  import {fly} from "svelte/transition"

  export let interactive = false
  export let invertColors = false
</script>

<div
  on:click|stopPropagation
  in:fly={{y: 20}}
  class={cx($$props.class, "note card rounded-2xl p-3 text-gray-2", {
    "border border-solid bg-gray-7": !invertColors,
    "border border-solid bg-gray-8": invertColors,
    "cursor-pointer transition-all": interactive,
    "hover:bg-gray-8": interactive && !invertColors,
    "hover:bg-gray-7": interactive && invertColors,
  })}>
  <slot />
</div>

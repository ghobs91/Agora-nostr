<script>
  import cx from "classnames"
</script>

<h1 {...$$props} class={cx($$props.class, "roboto my-4 text-6xl")}>
  <slot />
</h1>

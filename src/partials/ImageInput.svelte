<script lang="ts">
  import {filter, identity} from "ramda"
  import Input from "src/partials/Input.svelte"
  import Modal from "src/partials/Modal.svelte"
  import Content from "src/partials/Content.svelte"
  import Anchor from "src/partials/Anchor.svelte"
  import {listenForFile, stripExifData, blobToFile} from "src/util/html"
  import {uploadFile, postJson} from "src/util/misc"
  import user from "src/agent/user"

  export let value
  export let icon
  export let maxWidth = null
  export let maxHeight = null
  export let hideInput = false

  let input, file, listener, quote
  let loading = false
  let isOpen = false

  $: {
    if (input) {
      listener = listenForFile(input, async inputFile => {
        if (inputFile) {
          const opts = filter(identity, {maxWidth, maxHeight})
          file = blobToFile(await stripExifData(inputFile, opts))
        //   // quote = await postJson(user.dufflepud("/upload/quote"), {
        //   quote = await postJson(`https://api.imgur.com/3/image`, {
        //     uploads: [{size: file.size}],
        //   })
        // } else {
          // file = null
          quote = {
            termsLine1: `If someone else might own the copyright to it, don't upload it. Don't upload gore, "hate speech" (i.e. demeaning race, gender, age, religious or sexual orientation, etc.), or material that is threatening, harassing, defamatory, or that encourages violence or crime.`,
            termsLine2: `Don't upload illegal content such as child sexual abuse material or nonconsensual ("revenge") porn. Don't hotlink to adult content or to file-sharing, gambling, torrent, warez, or Imgur rip-off sites. Don't impersonate someone else. Also, don't use Imgur to host image libraries you link to from elsewhere, content for your website, advertising, avatars, or anything else that turns us into your content delivery network.`,
            termsLine3: `If you do – and we will be the judge – or if you do anything illegal, in addition to any other legal rights we may have, we will ban you along with the site you're hotlinking from, delete all your images, report you to the authorities if necessary, and prevent you from viewing any images hosted on Imgur.com. We mean it.`

          }
        }
      })
    }
  }

  const accept = async () => {
    loading = true

    try {
      // const {id} = quote.uploads[0]
      // const {url} = await uploadFile(user.dufflepud(`/upload/${id}`), file)
      const url = await uploadFile(`https://api.imgur.com/3/image`, file)

      console.log(`url object: ${url}`);
      value = url.data.link
    } finally {
      loading = false
    }

    file = null
    quote = null
    isOpen = false
  }

  const decline = () => {
    file = null
    quote = null
    isOpen = false
  }
</script>

<div class="flex gap-2">
  {#if !hideInput}
    <Input type="text" wrapperClass="flex-grow" bind:value placeholder="https://">
      <i slot="before" class={`fa fa-${icon}`} />
    </Input>
  {/if}
  <div
    on:click={() => {
      isOpen = true
    }}>
    <slot name="button">
      <div class="flex">
        <Anchor type="button" class="rounded-full">
          <i class="fa fa-upload" />
        </Anchor>
      </div>
    </slot>
  </div>
</div>

{#if quote}
  <Modal onEscape={decline}>
    <Content>
      <h1 class="roboto text-2xl">Confirm File Upload</h1>
      <p>Please accept the following <a href="https://imgur.com/tos">Imgur terms</a>:</p>
      <p>{quote.termsLine1}</p>
      <p>{quote.termsLine2}</p>
      <p>{quote.termsLine3}</p>
      <div class="flex gap-2">
        <Anchor type="button" on:click={decline} {loading}>Decline</Anchor>
        <Anchor type="button-accent" on:click={accept} {loading}>Accept</Anchor>
      </div>
    </Content>
  </Modal>
{:else if isOpen}
  <Modal onEscape={decline}>
    <Content>
      <h1 class="roboto text-2xl">Upload a File</h1>
      <p>Click below to select a file to upload.</p>
      <input type="file" bind:this={input} />
    </Content>
  </Modal>
{/if}

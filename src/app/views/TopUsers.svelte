<script lang="ts">
    import {reject} from "ramda"
    import {displayPerson} from "src/util/nostr"
    import Input from "src/partials/Input.svelte"
    import Anchor from "src/partials/Anchor.svelte"
    import Heading from "src/partials/Heading.svelte"
    import Content from "src/partials/Content.svelte"
    import PersonInfo from "src/app/shared/PersonInfo.svelte"
    import {getPersonWithFallback, searchPeople} from "src/agent/db"
    import {defaultFollows} from "src/agent/social"
    import {sampleRelays, getPubkeyWriteRelays} from "src/agent/relays"
    import {modal} from "src/partials/state"
    import user from "src/agent/user"
  
    export let signup
  
    const skip = () => signup()
  
    const {petnamePubkeys} = user
  
    // if ($petnamePubkeys.length === 0) {
    //   user.updatePetnames(() =>
    //     defaultFollows.map(pubkey => {
    //       const [{url}] = sampleRelays(getPubkeyWriteRelays(pubkey))
    //       const name = displayPerson(getPersonWithFallback(pubkey))
  
    //       return ["p", pubkey, url, name]
    //     })
    //   )
    // }
  
    let q = ""
  
    $: results = reject(p => $petnamePubkeys.includes(p.pubkey), defaultFollows)
  </script>
  
  <Content>
    <Content class="text-center">
      <Heading>Find Your People</Heading>
      <p>
        To get you started, we’ve added some interesting people to your follow list. You can update
        your follows list at any time.
      </p>
      <Anchor
        type="button-accent"
        on:click={skip}>
        Continue
      </Anchor>
    </Content>
    <div class="flex items-center gap-2">
      <i class="fa fa-earth-asia fa-lg" />
      <h2 class="roboto text-2xl">Trending</h2>
    </div>
    <Input bind:value={q} type="text" wrapperClass="flex-grow" placeholder="Type to search">
      <i slot="before" class="fa-solid fa-search" />
    </Input>
    {#each results as person (person.pubkey)}
      <PersonInfo {person} />
    {/each}
  </Content>
  
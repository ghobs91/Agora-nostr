<script lang="ts">
    import {reject} from "ramda"
    import {displayPerson} from "src/util/nostr"
    import Input from "src/partials/Input.svelte"
    import Anchor from "src/partials/Anchor.svelte"
    import Heading from "src/partials/Heading.svelte"
    import Content from "src/partials/Content.svelte"
    import PersonInfo from "src/app/shared/PersonInfo.svelte"
    import {getPersonWithFallback, searchPeople} from "src/agent/db"
    import {sampleRelays, getPubkeyWriteRelays} from "src/agent/relays"
    import {modal} from "src/partials/state"
    import user from "src/agent/user"
    import {onMount} from "svelte"
    import network from "src/agent/network"
    import {shuffle} from "src/util/misc"
    import {uniq} from "ramda"
    import {getFollows, defaultFollows} from "src/agent/social"
  
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
  
    onMount(async () => {
      const relays = sampleRelays(user.getRelays())
      const follows = user.getPetnamePubkeys().unshift(defaultFollows)
      await network.loadPeople(defaultFollows, {relays})
      const others = shuffle(uniq(follows.flatMap(getFollows))).slice(0, 256)
      await network.loadPeople(others, {relays})
    })

    $: results = reject(p => $petnamePubkeys.includes(p.pubkey), $searchPeople(q)).concat(defaultFollows)
    $: results.concat(defaultFollows)
    $: newResults = reject(p => !results.includes(p.pubkey), $searchPeople(q))

  </script>
  
  <Content>
    <Content class="text-center">
      <Heading>Find Interesting People!</Heading>
    </Content>
    <Input bind:value={q} type="text" wrapperClass="flex-grow" placeholder="Type to search">
      <i slot="before" class="fa-solid fa-search" />
    </Input>
    {#each newResults.slice(0, 50) as person (person.pubkey)}
      <PersonInfo {person} />
    {/each}
  </Content>
  
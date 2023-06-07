<script lang="ts">
    import {reject} from "ramda"
    import {displayPerson} from "src/util/nostr"
    import Input from "src/partials/Input.svelte"
    import Anchor from "src/partials/Anchor.svelte"
    import Heading from "src/partials/Heading.svelte"
    import Content from "src/partials/Content.svelte"
    import PersonInfo from "src/app/shared/PersonInfo.svelte"
    import {getPersonWithFallback, searchPeople} from "src/agent/db"
    import {defaultFollows, getSuggestedFollows} from "src/agent/social"
    import {sampleRelays, getPubkeyWriteRelays} from "src/agent/relays"
    import {modal} from "src/partials/state"
    import user from "src/agent/user"
  
    export let signup
  
    const skip = () => signup()
  
    const {petnamePubkeys, profile} = user
    let q = ""

    let suggestedFollowArray = getSuggestedFollows($profile.pubkey);
  
    $: results = reject(p => $petnamePubkeys.includes(p.pubkey),  $searchPeople(q))
    $: curatedResults = reject(p => !defaultFollows.includes(p.pubkey), results);
    $: suggestedFollowList = reject(p => !suggestedFollowArray.includes(p.pubkey), results);
  </script>
  
  <Content class="top-users-container">
    <div class="flex items-center gap-2">
      <i class="fa fa-earth-asia fa-lg" />
      <h2 class="roboto text-2xl">Suggested</h2>
    </div>
    {#each suggestedFollowList.slice(0, 50) as person (person.pubkey)}
      <PersonInfo {person} />
    {/each}
  </Content>
  
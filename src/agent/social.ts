import {uniq, identity, without} from "ramda"
import {Tags} from "src/util/nostr"
import {getPersonWithFallback} from "src/agent/db"
import user from "src/agent/user"

export const defaultFollows = (import.meta.env.VITE_DEFAULT_FOLLOWS || "")
  .split(",")
  .filter(identity)

async function suggestProfilesCall(pubkey: string) {
  const res = await fetch(`https://api.nostr.band/v0/suggested/profiles/${pubkey}`, {method: "get"});
  const suggestedFetchResponse = await res.json();
  return suggestedFetchResponse;
}  

export const getSuggestedFollows = (pubkey: string) => {
  let suggestedProfilesArray = [];
  suggestProfilesCall(pubkey).then((responseArray) => {
    responseArray.profiles.forEach(profile => {
      suggestedProfilesArray.push(profile.pubkey);
    });
  })
  return suggestedProfilesArray;
}


export const getFollows = pubkey =>
  Tags.wrap(getPersonWithFallback(pubkey).petnames).type("p").values().all()

export const getNetwork = pubkey => {
  const follows = getFollows(pubkey)

  return uniq(without(follows, follows.flatMap(getFollows)))
}

export const getUserFollows = (): Array<string> => Tags.wrap(user.getPetnames()).values().all()

export const getUserNetwork = () => {
  const follows = getUserFollows()

  return uniq(without(follows, follows.flatMap(getFollows)))
}

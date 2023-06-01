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
    import {onMount} from "svelte"
    import {fuzzy, tryFunc} from "src/util/misc"
  
    // export let signup
  
    // const skip = () => signup()
  
    const {petnamePubkeys} = user
    let bskyList = [];
    let promise;
    let options = []
    // let bskyHandleList = ['npub17y22rum6xrx5pk8e2ew3fwnhxuexls4qxqzrek86lh5rpq7nf7yspdmzl5']
    let bskyHandleList = ["54m.bsky.social", "actualandyrichter.bsky.social", "adamserwer.bsky.social", "addyosmani.com", "alanova.bsky.social", "alexwinter.com", "alexyoungkwon.bsky.social", "aliafonzy.bsky.social", "alice.bsky.sh", "alispit.tel", "alyankovic.bsky.social", "amazingca.dev", "amir.blue", "anatole.bsky.social", "andrew.bsky.social", "andrewlombardi.com", "andylevy.bsky.social", "angiejones.tech", "anildash.com", "anku.bsky.social", "ansh.bsky.team", "aoc.bsky.social", "april.social", "archive.org", "ashleyfeinberg.bsky.social", "ashleywillis.bsky.social", "askaubry.com", "astrokatie.com", "atproto.com", "atrupar.bsky.social", "b0rk.jvns.ca", "banjoe.bsky.social", "batatownn.bsky.social", "bcharts.com.br", "bellingcat.com", "bencollins.bsky.social", "benjackson.com", "bestofdyingtwit.bsky.social", "bethbourdon.bsky.social", "bicmuller.bsky.social", "billcherman.bsky.social", "birb.baby", "blj.bsky.social", "bloombergnews.bsky.social", "bnewbold.bsky.team", "bradfitz.com", "brandyzadrozny.bsky.social", "brianna.bsky.social", "brooke.vibe.camp", "brooklynmarie.bsky.social", "brufcx.bsky.social", "bs-days.com", "bsky.app", "carnage4life.bsky.social", "casey.nyc", "caseynewton.bsky.social", "cats.bsky.social", "cedok.bsky.social", "chadloder.bsky.social", "chinchillazilla.hellthread.vet", "chris.bsky.social", "chrisbivins.bsky.social", "chrislhayes.bsky.social", "chrissyteigen.bsky.social", "col.bsky.social", "contrapoints.bsky.social", "craignewmark.bsky.social", "cwarzel.bsky.social", "danabramov.bsky.social", "danielvaz.bsky.social", "darthbluesky.bsky.social", "dasharez0ne.bsky.social", "daveweigel.bsky.social", "deepfates.com.deepfates.com.deepfates.com.deepfates.com.deepfates.com", "dell.bsky.social", "depthsofwikipedia.bsky.social", "dholms.xyz", "digitalart.bsky.social", "discovery.bsky.social", "ditzkoff.bsky.social", "divy.zone", "divyaswor.bsky.social", "drewharwell.com", "dril.bsky.social", "drstanton.bsky.social", "dvf.bsky.social", "dystopiabreaker.xyz", "edgarwright.bsky.social", "effinbirds.com", "eigenrobot.bsky.social", "elonjet.net", "emily.bsky.team", "emilyfreeman.bsky.social", "emilyonhere.gay", "engineeringbae.bsky.social", "ericajoy.astrel.la", "erinbiba.bsky.social", "erininthemorning.bsky.social", "esqueer.bsky.social", "eve6.bsky.social", "faineg.bsky.social", "farofa.bsky.social", "felixlepeintre.bsky.social", "filmgirl.bsky.social", "frye.bsky.social", "fuckyouiquit.bsky.social", "funny.bsky.social", "fusco.bsky.social", "georgetakei.bsky.social", "gergely.pragmaticengineer.com", "godpod.bsky.social", "goldengateblond.bsky.social", "gpte.bsky.social", "greatdismal.bsky.social", "grimes.bsky.social", "growingdaniel.bsky.social", "gruber.bsky.social", "hankgreen.bsky.social", "hexcraft.bsky.social", "huntsauce.bsky.social", "ilhanmn.bsky.social", "illumi.me", "invest.bsky.social", "jaboukie.bsky.social", "jack.bsky.social", "jacob.gold", "jairme.bsky.social", "jaketapper.bsky.social", "jamesgunn.bsky.social", "jasonchan.bsky.social", "jasonschreier.bsky.social", "jay.bsky.team", "jaypeters.bsky.social", "jaz.bsky.social", "jbouie.bsky.social", "jem.fm", "jerilryan.bsky.social", "johncusack.bsky.social", "jonbois.bsky.social", "jordanuhl.com", "jortsthecat.bsky.social", "joshuaphill.bsky.social", "jpbrammer.bsky.social", "jsonpreet.xyz", "jtp.bsky.social", "juddlegum.bsky.social", "jules.su", "junlper.bsky.social", "justinpgh.com", "kaimav.bsky.social", "karaswisher.bsky.social", "karpathy.bsky.social", "kateconger.bsky.social", "kattenbarge.bsky.social", "kelseyhightower.com", "kenklippenstein.bsky.social", "kenwhite.bsky.social", "kevinmkruse.bsky.social", "kevinroose.bsky.social", "kfile.bsky.social", "kimkelly.bsky.social", "kry.bsky.social", "kumail.bsky.social", "kvlly.com", "kylierobison.com", "leilagermano.bsky.social", "leticia.meowers.dev", "levarburton.bsky.social", "leyawn.bsky.social", "lillywachowski.bsky.social", "livagar.bsky.social", "livialamblet.com", "loffer.bsky.social", "loloverruled.bsky.social", "lookitup.baby", "lorenzolne.bsky.social", "luca.lanziani.com", "lukerreal.bsky.social", "luy.gay", "m3ta.uk", "malwaretech.com", "mamareza.com", "marlon.bsky.social", "matt-levine.bsky.social", "mattbinder.bsky.social", "maxberger.bsky.social", "mcq.bsky.social", "mcuban.bsky.social", "mediciners.org", "medus4.com", "megumin.bsky.social", "mehdirhasan.bsky.social", "mekka.mekka-tech.com", "merrittk.com", "michaelhobbes.bsky.social", "mikedrucker.bsky.social", "mikeisaac.bsky.social", "milesklee.bsky.social", "mimi10v3.com", "miranda.bsky.social", "mmasnick.bsky.social", "mnateshyamalan.bsky.social", "molly.wiki", "mollyjongfast.bsky.social", "mollyknight.bsky.social", "monicalewinsky.bsky.social", "moreperfectunion.bsky.social", "moryana.bsky.social", "mosesogunsanya.com", "moskov.goodventures.org", "msrodrigo.com", "nature.bsky.social", "neilhimself.neilgaiman.com", "nelsonbeans.com", "nerdjpg.com", "ninaturner.bsky.social", "nopeitslily.bsky.social", "notabigjerk.bsky.social", "notalawyer.bsky.social", "npr.org", "nycsouthpaw.bsky.social", "ocasio-cortez.house.gov", "oof.bsky.social", "oremus.bsky.social", "panic.gay", "paratect.bsky.social", "pariss.blacktechpipeline.com", "parkermolloy.com", "pattonoswalt.bsky.social", "paulio.bsky.social", "paulovieira.bsky.social", "petrh.bsky.social", "pfrazee.com", "phillewis.bsky.social", "pixelatedboat.bsky.social", "pleasebegneiss.bsky.social", "prer.at", "quintabrunson.bsky.social", "rathbone.dev", "reni.bsky.social", "rhemasjoy.bsky.social", "rianjohnson.bsky.social", "riesel.bsky.social", "robdelaney.bsky.social", "robdenbleyker.com", "roque.bsky.social", "rose.bsky.team", "roxanegay.bsky.social", "roxiqt.com", "rui.bsky.social", "run.bsky.social", "sarahedo.bsky.social", "sarahjeong.bsky.social", "scalzi.com", "schatz.bsky.social", "schwarzenegger.bsky.social", "scott.hanselman.com", "scrm.bsky.social", "shinyakato.dev", "sho.bsky.social", "skeptic.bsky.social", "socialistdogmom.bsky.social", "stephenking.bsky.social", "support.bsky.team", "swiftonsecurity.com", "swolecialism.bsky.social", "swordsjew.bsky.social", "taylorlorenz.bsky.social", "techcrunch.bsky.social", "thedevil.bsky.social", "theonion.com", "tho.bsky.social", "timholt.bsky.social", "tolgamert.nl", "tomwarren.social", "tressiemcphd.bsky.social", "trippy.bsky.social", "tszzl.bsky.social", "uraglyphs.bsky.social", "vancityreynolds.bsky.social", "verbuffpink.bsky.social", "visakanv.com", "vishal.bsky.social", "vqv.app", "wapplehouse.bsky.social", "washingtonpost.com", "weisenthal.bsky.social", "weratedogs.bsky.social", "why.bsky.team", "wongmjane.com", "wyden.senate.gov", "xkcd.com", "xychelsea.tv", "yasharali.bsky.social", "yesitscolin.bsky.social", "ymr.bsky.social", "yoyoel.com", "zitron.bsky.social", "zoandbehold.bsky.social", "zoeschiffer.bsky.social", "zoink.bsky.social"]
    function bskyAggregator() {
        let bskyPubList = []
        // let bskyHandleList = ["54m.bsky.social","actualandyrichter.bsky.social","adamserwer.bsky.social","addyosmani.com","alanova.bsky.social","alexwinter.com","alexyoungkwon.bsky.social","aliafonzy.bsky.social","alice.bsky.sh","alispit.tel","alyankovic.bsky.social","amazingca.dev","amir.blue","anatole.bsky.social","andrew.bsky.social","andrewlombardi.com","andylevy.bsky.social","angiejones.tech","anildash.com","anku.bsky.social","ansh.bsky.team","aoc.bsky.social","april.social","archive.org","ashleyfeinberg.bsky.social","ashleywillis.bsky.social","askaubry.com","astrokatie.com","atproto.com","atrupar.bsky.social","b0rk.jvns.ca","banjoe.bsky.social","batatownn.bsky.social","bcharts.com.br","bellingcat.com","bencollins.bsky.social","benjackson.com","bestofdyingtwit.bsky.social","bethbourdon.bsky.social","bicmuller.bsky.social","billcherman.bsky.social","birb.baby","blj.bsky.social","bloombergnews.bsky.social",""]
        // let bskyHandleList = ["54m.bsky.social","actualandyrichter.bsky.social","adamserwer.bsky.social"]
        bskyHandleList.forEach(async (handle) => {
            const res = await fetch(`https://rsslay.nostr.moe/api/feed?url=https://ghobs91-bluestream.deno.dev/${handle}`, {method: "get"});
            const rsslayResponse = await res.json();
            const pubKey = rsslayResponse.PubKey;
            bskyPubList.push(pubKey);
        })
        console.log('bskyPubList: ', bskyPubList)
        return bskyPubList;
    }

    // onMount(async () => {
    //     promise = bskyAggregator();
    // });
  
    let q = ""
    bskyAggregator()

    // bskyAggregator().then((bskyNpubList) =>{
    //     bskyNpubList = bskyNpubList;
    // });

    // $: results = reject(p => $petnamePubkeys.includes(p.pubkey), $searchPeople(q))
    // $: bskyNpubList = bskyAggregator();
    $: search = fuzzy(options, {keys: ["text"]})
  </script>
  
  <Content>
    <Content class="text-center">
      <Heading>Find Your People</Heading>
      <p>
        To get you started, we’ve added some interesting people to your follow list. You can update
        your follows list at any time.
      </p>
    </Content>
    <div class="flex items-center gap-2">
      <i class="fa fa-earth-asia fa-lg" />
      <h2 class="roboto text-2xl">Top Bluesky Users</h2>
    </div>
    <!-- {#await promise then bskyNpubList}
        {#each bskyList as pubkey (pubkey)}
            <PersonInfo person={getPersonWithFallback(pubkey)} />
        {/each}
    {/await} -->
    {#each bskyHandleList as handle}
        {#each search(handle).slice(0, 50) as result (result.type + result.id)}
            <PersonInfo person={result.person} />
        {/each}
    {/each}

  </Content>
  
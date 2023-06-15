<script lang="ts">
    import Content from "src/partials/Content.svelte"
  
    const exploreTopics = [
        "cooking",
        "gaming",
        "worldnews",
        "books",
        "architecture",
        "space",
        "soccer",
        "baking",
        "travel",
        "cordcutters",
        "gadgets",
        "apple",
        "cars",
        "diy",
        "android",
        "gardening",
        "nyc",
        "transit",
        "nature",
        "photography",
        "comicbooks",
    ]

  </script>
  
  <Content class="explore-topic-wrapper">
    <p class="text-center">
        Explore some topics:
    </p>
    <div class="flex flex-col items-center topic-pill-container">
        {#each exploreTopics as topic}
            <a href='/topic/{topic}' class="topic-pill topic-pill-login">#{topic}</a>
        {/each}
    </div>
  </Content>
  
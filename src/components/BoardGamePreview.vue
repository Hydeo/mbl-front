<!-- src/components/BoardGamePreview.vue -->
<script setup lang="ts">
import type { BoardGame } from '~/types/bgg';
import { NuxtLink } from '#components'; // Explicitly import NuxtLink for clarity

// Define props for the component
const props = defineProps<{
  game: BoardGame;
}>();
</script>

<template>
  <!-- Wrap the card in NuxtLink to navigate to the detail page -->
  <NuxtLink :to="`/games/${props.game.id}`" class="board-game-card-link">
    <div class="board-game-card">
      <!-- Add a check before rendering the image -->
      <!-- Always render img tag, use placeholder if no BGG image URL is available -->
      <img
        :src="props.game.imageUrl || props.game.thumbnailUrl || '/assets/placeholder.png'"
        :alt="props.game.name"
        class="game-image"
        loading="lazy"
      />
      <div class="game-info">
        <h3 class="game-name">{{ props.game.name }}</h3>
        <p class="game-year">Published: {{ props.game.yearPublished }}</p>
        <p v-if="props.game.numPlays > 0" class="game-plays">Plays: {{ props.game.numPlays }}</p>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.board-game-card-link {
  text-decoration: none; /* Remove underline from link */
  color: inherit; /* Inherit text color */
  display: block; /* Make the link fill the card area */
  height: 100%; /* Ensure the link takes full height of the card */
}

.board-game-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px; /* This will be overridden by masonry's gutter, but good for standalone */
  break-inside: avoid-column; /* Important for masonry-like behavior in some contexts, though the library handles it */
  display: flex;
  flex-direction: column;
  height: auto; /* Allow height to vary */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Smooth transition for hover effects */
}

.board-game-card:hover {
  transform: translateY(-5px); /* Slight lift effect on hover */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
}

.game-image {
  width: 100%;
  height: auto; /* Maintain aspect ratio */
  display: block;
  object-fit: cover; /* Ensures image covers the area without distortion */
}

.game-info {
  padding: 15px;
  text-align: left;
}

.game-name {
  font-size: 1.1em;
  color: #333;
  margin-top: 0;
  margin-bottom: 5px;
  line-height: 1.3;
}

.game-year, .game-plays {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 3px;
}
</style>

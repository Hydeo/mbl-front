<script setup lang="ts">
import type { BoardGame } from '~/types/bgg'; // Import the BoardGame interface

// Define props for the component
const props = defineProps<{
  game: BoardGame;
}>();
</script>

<template>
  <div class="board-game-card">
    <img :src="props.game.imageUrl || props.game.thumbnailUrl" :alt="props.game.name" class="game-image" loading="lazy" />
    <div class="game-info">
      <h3 class="game-name">{{ props.game.name }}</h3>
      <p class="game-year">Published: {{ props.game.yearPublished }}</p>
      <p v-if="props.game.numPlays > 0" class="game-plays">Plays: {{ props.game.numPlays }}</p>
    </div>
  </div>
</template>

<style scoped>
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

<!-- components/BoardGameCard.vue -->
<script setup lang="ts">
import type { BoardGame } from '~/types/bgg';
// Removed: import { onMounted } from 'vue'; // Removed debugging import

const props = defineProps<{
  game: BoardGame;
}>();

// Removed: onMounted(() => {
// Removed:   console.log(`BoardGameCard mounted: ${props.game.name}`);
// Removed: });
</script>

<template>
  <div class="board-game-card">
    <img :src="game.imageUrl" :alt="game.name" class="game-image" loading="lazy" />
    <div class="game-info">
      <h3 class="game-name">{{ game.name }}</h3>
      <p class="game-year">{{ game.yearPublished }}</p>
    </div>
  </div>
</template>

<style scoped>
.board-game-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  break-inside: avoid-column; /* For column-based masonry */
  margin-bottom: 16px; /* Spacing between cards in masonry */
}

.game-image {
  width: 100%;
  height: auto; /* Maintain aspect ratio */
  display: block;
  object-fit: cover; /* Ensures image covers the area without distortion */
}

.game-info {
  padding: 12px;
}

.game-name {
  font-size: 1.1em;
  margin: 0 0 5px 0;
  color: #333;
}

.game-year {
  font-size: 0.9em;
  color: #666;
}
</style>

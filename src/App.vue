<script setup lang="ts">
import { onMounted } from 'vue';
import { useBoardGamesStore } from './stores/boardGames';
import BoardGameCard from './components/BoardGameCard.vue';

const boardGamesStore = useBoardGamesStore();
const username = 'hideosensei'; // The specified username

onMounted(() => {
  boardGamesStore.loadCollection(username);
});
</script>

<template>
  <div class="container">
    <h1>BoardGameGeek Collection: {{ username }}</h1>

    <div v-if="boardGamesStore.getIsLoading" class="loading-message">
      Loading collection... This might take a moment due to BGG API rate limits and queueing.
    </div>

    <div v-else-if="boardGamesStore.getError" class="error-message">
      Error: {{ boardGamesStore.getError }}
    </div>

    <div v-else-if="boardGamesStore.getBoardGames.length === 0" class="no-data-message">
      No board games found in the collection or collection is empty.
    </div>

    <div v-else class="board-game-grid">
      <BoardGameCard
        v-for="game in boardGamesStore.getBoardGames"
        :key="game.id"
        :game="game"
      />
    </div>
  </div>
</template>

<style>
/* Global styles for the app */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 20px;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.loading-message,
.error-message,
.no-data-message {
  text-align: center;
  padding: 20px;
  border-radius: 5px;
  margin-top: 20px;
}

.loading-message {
  background-color: #e0f7fa;
  color: #00796b;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}

.no-data-message {
  background-color: #fff3e0;
  color: #e65100;
}

/* CSS Grid for Masonry-like layout */
.board-game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Responsive columns */
  gap: 16px; /* Space between grid items */
  align-items: start; /* Align items to the start of their grid area */
}

/* For a true masonry effect, you might need a library or more complex CSS.
   This CSS Grid setup provides a responsive, column-based layout that
   often looks similar to masonry for varying height items.
   If you want items to fill vertical gaps, a JavaScript-based masonry library
   like 'masonry-layout' or 'vue-masonry-css' would be needed.
   For a simple start, CSS Grid is a good, performant choice.
*/
</style>

<script setup lang="ts">
import { fetchGameDetails } from '~/api/bgg';
import type { BoardGameDetails } from '~/types/bgg';
import { computed } from 'vue'; // Import computed

const route = useRoute();
// Use a computed property for gameId to ensure reactivity
const gameId = computed(() => route.params.id as string);

const { data: game, pending, error, refresh } = useAsyncData<BoardGameDetails>(
  // Use a static key or a key that doesn't depend on the potentially initial undefined value
  'gameDetails', // Static key for useAsyncData
  async () => {
    // Only fetch if gameId.value is defined
    if (gameId.value) {
      return fetchGameDetails(gameId.value);
    }
    // Return null if gameId is not defined yet
    return null;
  },
  {
    lazy: true, // Fetch data lazily, will be triggered by watch
    // Transform the data if needed, or handle errors
    transform: (data) => {
      // If data is null or undefined, it means the fetch failed or returned no item
      // Only throw an error if gameId was actually defined when the fetcher ran
      if (!data && gameId.value) {
        throw new Error(`Game with ID ${gameId.value} not found or failed to load.`);
      }
      return data;
    },
    // Watch for changes in the computed gameId ref to trigger the fetch
    watch: [gameId],
  }
);

// Set page title dynamically
useHead({
  title: () => game.value ? `${game.value.name} - BGG Collection` : 'Game Details - BGG Collection'
});

// Function to strip HTML tags from description
const stripHtml = (html: string) => {
  // Ensure html is a string before parsing
  if (typeof html !== 'string') {
    return '';
  }
  // Use DOMParser only on the client side
  if (process.client) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  // On the server, return the raw HTML or an empty string.
  // Returning an empty string prevents rendering potentially unstyled HTML during SSR.
  return '';
};
</script>

<template>
  <div class="game-detail-container">
    <NuxtLink to="/" class="back-button">&larr; Back to Collection</NuxtLink>

    <div v-if="pending" class="loading-message">
      Loading game details...
    </div>

    <div v-else-if="error" class="error-message">
      Error: {{ error.message || 'Failed to load game details.' }}
      <button @click="refresh" class="retry-button">Retry</button>
    </div>

    <div v-else-if="game" class="game-details-card">
      <div class="game-header">
        <img :src="game.imageUrl || game.thumbnailUrl" :alt="game.name" class="game-detail-image" loading="lazy" />
        <div class="game-header-info">
          <h1 class="game-title">{{ game.name }}</h1>
          <p class="game-meta">Published: {{ game.yearPublished }}</p>
          <p class="game-meta">Rating: {{ game.rating.toFixed(2) }} / 10</p>
          <p class="game-meta">Recommended Players: {{ game.recommendedPlayers }}</p>
          <p class="game-meta">Playing Time: {{ game.minPlaytime }} - {{ game.maxPlaytime }} min</p>
          <p class="game-meta">Min Age: {{ game.minAge }}+</p>
        </div>
      </div>

      <div class="game-description">
        <h2>Description</h2>
        <p v-html="stripHtml(game.description)"></p>
      </div>

      <div class="game-attributes">
        <div v-if="game.categories.length">
          <h3>Categories</h3>
          <div class="attribute-list">
            <span v-for="cat in game.categories" :key="cat.id" class="attribute-tag">{{ cat.name }}</span>
          </div>
        </div>
        <div v-if="game.mechanics.length">
          <h3>Mechanics</h3>
          <div class="attribute-list">
            <span v-for="mech in game.mechanics" :key="mech.id" class="attribute-tag">{{ mech.name }}</span>
          </div>
        </div>
        <!-- Removed Designers and Publishers sections -->
      </div>
    </div>

    <div v-else class="no-game-found">
      No game details available.
    </div>
  </div>
</template>

<style scoped>
.game-detail-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.back-button {
  display: inline-block;
  margin-bottom: 20px;
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #369f6e;
}

.loading-message, .error-message, .no-game-found {
  text-align: center;
  font-size: 1.2em;
  color: #555;
  padding: 40px 0;
}

.error-message {
  color: #e74c3c;
  background-color: #fdeded;
  border: 1px solid #e74c3c;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.retry-button {
  padding: 8px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #c0392b;
}

.game-details-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

@media (min-width: 768px) {
  .game-header {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }
}

.game-detail-image {
  max-width: 250px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-header-info {
  flex-grow: 1;
}

.game-title {
  font-size: 2em;
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
}

.game-meta {
  font-size: 1em;
  color: #666;
  margin-bottom: 5px;
}

.game-description h2, .game-attributes h3 {
  color: #333;
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.game-description p {
  line-height: 1.6;
  color: #555;
}

.attribute-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.attribute-tag {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  white-space: nowrap;
}
</style>

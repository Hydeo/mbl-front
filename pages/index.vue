<!-- pages/index.vue -->
<script setup lang="ts">
import { useBoardGamesStore } from '~/stores/boardGames'; // Nuxt auto-imports stores
import BoardGameCard from '~/components/BoardGameCard.vue'; // Nuxt auto-imports components

const boardGamesStore = useBoardGamesStore();
const username = ref(''); // Use ref for reactive input

// Use Nuxt's useAsyncData for SSR-friendly data fetching
// This will run on the server during SSR and on the client during navigation
const { pending, error, refresh } = useAsyncData(
  'userCollection',
  async () => {
    if (username.value) {
      await boardGamesStore.loadCollection(username.value);
    }
  },
  {
    // Do not execute immediately on server if username is empty
    immediate: false,
  }
);

// Function to trigger collection load when button is clicked
const fetchCollection = () => {
  if (username.value) {
    refresh(); // Re-run the useAsyncData function
  }
};
</script>

<template>
  <div class="container">
    <h1>My BoardGameGeek Collection</h1>

    <div class="input-section">
      <input
        type="text"
        v-model="username"
        placeholder="Enter BGG Username"
        @keyup.enter="fetchCollection"
        class="username-input"
      />
      <button @click="fetchCollection" :disabled="pending || !username" class="fetch-button">
        {{ pending ? 'Loading...' : 'Load Collection' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      Error: {{ error.message || 'Failed to load collection.' }}
    </div>

    <div v-if="pending && !boardGamesStore.getBoardGames.length" class="loading-message">
      Loading collection...
    </div>

    <!-- Use the masonry component for the grid layout -->
    <masonry
      v-else-if="boardGamesStore.getBoardGames.length > 0"
      :cols="{ default: 4, 1000: 3, 700: 2, 500: 1 }"
      :gutter="20"
    >
      <BoardGameCard
        v-for="game in boardGamesStore.getBoardGames"
        :key="game.id"
        :game="game"
      />
    </masonry>

    <div v-else-if="!pending && !boardGamesStore.getBoardGames.length && username" class="no-results">
      No games found for "{{ username }}" or collection is empty.
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.input-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.username-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  width: 300px;
  max-width: 80%;
}

.fetch-button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.fetch-button:hover:not(:disabled) {
  background-color: #369f6e;
}

.fetch-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background-color: #fdeded;
  border: 1px solid #e74c3c;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.loading-message, .no-results {
  font-size: 1.2em;
  color: #555;
  margin-top: 30px;
}

/* Removed .game-grid as masonry handles the layout */
</style>

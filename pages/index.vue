<script setup lang="ts">
import { useBoardGamesStore } from '~/stores/boardGames';
import BoardGameCard from '~/components/BoardGameCard.vue';

const boardGamesStore = useBoardGamesStore();
const username = ref('');
const hasSearched = ref(false); // New state to track if a search has been attempted

// Use Nuxt's useAsyncData for SSR-friendly data fetching
const { error, refresh } = useAsyncData(
  'userCollection',
  async () => {
    if (username.value) {
      await boardGamesStore.loadCollection(username.value);
    }
  },
  {
    immediate: false,
    // Propagate store error to useAsyncData error
    transform: (data) => {
      if (boardGamesStore.error) {
        throw new Error(boardGamesStore.error);
      }
      return data;
    },
    // Watch the store's error state to trigger re-evaluation of useAsyncData's error
    watch: [() => boardGamesStore.error],
  }
);

// Function to trigger collection load when button is clicked
const fetchCollection = () => {
  if (username.value) {
    hasSearched.value = true; // Mark that a search has been attempted
    refresh(); // Re-run the useAsyncData function
  }
};
</script>

<template>
  <div class="container">
    <h1>My BoardGameGeek Collection</h1>
    <p>Games in store: {{ boardGamesStore.getBoardGames.length }}</p>       
    <div class="input-section">
      <input
        type="text"
        v-model="username"
        placeholder="Enter BGG Username"
        @keyup.enter="fetchCollection"
        class="username-input"
      >
      <button @click="fetchCollection" :disabled="boardGamesStore.getIsLoading || !username" class="fetch-button">
        {{ boardGamesStore.getIsLoading ? 'Loading...' : 'Load Collection' }}
      </button>
    </div>

    <!-- Display error from useAsyncData or store -->
    <div v-if="error || boardGamesStore.getError" class="error-message">
      Error: {{ error?.message || boardGamesStore.getError || 'Failed to load collection.' }}
    </div>

    <!-- Loading state: Only show if a search has been initiated and data is loading -->
    <div v-else-if="boardGamesStore.getIsLoading && hasSearched" class="loading-message">
      Loading collection...
    </div>

    <!-- This div will always be present in the DOM structure, preventing structural mismatches -->
    <!-- The content inside it will be handled by ClientOnly, ensuring masonry is client-side -->
    <div v-else>
      <ClientOnly>
        <!-- Fallback content for SSR and initial client render before hydration -->
        <template #fallback>
          <!-- On SSR, if no search has happened, show initial prompt -->
          <div v-if="!hasSearched" class="initial-prompt">
            Enter a BoardGameGeek username to view their collection.
          </div>
          <!-- On SSR, if a search happened but no games, show no results (though this state is unlikely on SSR with immediate:false) -->
          <div v-else-if="hasSearched && !boardGamesStore.getBoardGames.length" class="no-results">
            No games found for "{{ username }}" or collection is empty.
          </div>
          <!-- Otherwise, nothing specific for SSR if data is expected but not loaded -->
        </template>

        <!-- Client-side content, replaces fallback after hydration -->
        <!-- This content will be rendered and become interactive on the client -->
        <template v-if="boardGamesStore.getBoardGames.length > 0">
          <masonry
            :cols="{ default: 4, 1000: 3, 700: 2, 500: 1 }"
            :gutter="20"
          >
            <BoardGameCard
              v-for="game in boardGamesStore.getBoardGames"
              :key="game.id"
              :game="game"
            />
          </masonry>
        </template>
        <template v-else-if="hasSearched && !boardGamesStore.getBoardGames.length">
          <div class="no-results">
            No games found for "{{ username }}" or collection is empty.
          </div>
        </template>
        <template v-else>
          <div class="initial-prompt">
            Enter a BoardGameGeek username to view their collection.
          </div>
        </template>
      </ClientOnly>
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

.initial-prompt {
  font-size: 1.2em;
  color: #555;
  margin-top: 30px;
  text-align: center;
}
</style>

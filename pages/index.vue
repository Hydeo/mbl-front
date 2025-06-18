<script setup lang="ts">
import { useBoardGamesStore } from '~/stores/boardGames';
import BoardGamePreview from '~/components/BoardGamePreview.vue'; // Updated import to BoardGamePreview

const boardGamesStore = useBoardGamesStore();
const username = ref('hideosensei');
const hasSearched = ref(false);

const { error, refresh } = useAsyncData(
  'userCollection',
  async () => {
    if (username.value) {
      await boardGamesStore.loadCollection(username.value);
    }
  },
  {
    immediate: false,
    transform: (data) => {
      if (boardGamesStore.error) {
        throw new Error(boardGamesStore.error);
      }
      return data;
    },
    watch: [() => boardGamesStore.error],
  }
);

const fetchCollection = () => {
  if (username.value) {
    hasSearched.value = true;
    refresh();
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

    <div v-if="error || boardGamesStore.getError" class="error-message">
      Error: {{ error?.message || boardGamesStore.getError || 'Failed to load collection.' }}
    </div>

    <div v-else-if="boardGamesStore.getIsLoading && hasSearched" class="loading-message">
      Loading collection...
    </div>

    <div v-else>
      <ClientOnly>
        <template #fallback>
          <div v-if="!hasSearched" class="initial-prompt">
            Enter a BoardGameGeek username to view their collection. (SSR Fallback)
          </div>
          <div v-else-if="hasSearched && !boardGamesStore.getBoardGames.length" class="no-results">
            No games found for "{{ username }}" or collection is empty. (SSR Fallback)
          </div>
        </template>

        <div>
          <!-- Using vue-masonry-wall component -->
          <MasonryWall
            v-if="boardGamesStore.getBoardGames.length > 0"
            :items="boardGamesStore.getBoardGames"
            :column-width="300"
            :gap="20"
          >
            <template #default="{ item }">
              <BoardGamePreview :game="item" /> <!-- Changed to BoardGamePreview -->
            </template>
          </MasonryWall>
          <div v-else class="no-results">
            {{ hasSearched ? `No games found for "${username}" or collection is empty.` : 'Enter a BoardGameGeek username to view their collection.' }}
          </div>
        </div>
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

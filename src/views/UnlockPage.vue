<template>
  <ion-page>
    <ion-content class="ion-text-center">
      <div class="unlock-button" @click="unlockClicked" data-testid="unlock-button">
        <ion-icon :icon="lockOpenOutline"></ion-icon>
        <div>Unlock</div>
      </div>

      <div class="unlock-button" @click="redoClicked" data-testid="redo-button">
        <ion-icon :icon="arrowRedoOutline"></ion-icon>
        <div>Redo Sign In</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowRedoOutline, lockOpenOutline } from 'ionicons/icons';
import useAuth from '@/composables/auth';
import useSessionVault from '@/composables/session-vault';

const router = useRouter();
const { logout } = useAuth();
const { unlock } = useSessionVault();

const redoClicked = async (): Promise<void> => {
  await logout();
  await router.replace('/login');
};

const unlockClicked = async (): Promise<void> => {
  try {
    await unlock();
    await router.replace('/');
  } catch (err) {
    null;
  }
};
</script>

<style scoped>
.unlock-button {
  margin-top: 3em;
  font-size: xx-large;
  cursor: pointer;
}
</style>

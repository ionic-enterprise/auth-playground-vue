<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>About Auth Playground</ion-title>
        <ion-buttons slot="end">
          <ion-button data-testid="logout-button" @click="logoutClicked">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ExploreContainer name="About page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import useAuth from '@/composables/auth';
import useSessionVault from '@/composables/session-vault';
import ExploreContainer from '@/components/ExploreContainer.vue';

const router = useRouter();
const { logout } = useAuth();
const { setUnlockMode } = useSessionVault();

const logoutClicked = async (): Promise<void> => {
  await setUnlockMode('NeverLock');
  await logout();
  router.replace('/login');
};
</script>

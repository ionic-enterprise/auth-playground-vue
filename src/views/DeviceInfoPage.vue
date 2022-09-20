<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Device Information</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/vault-control"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Device Information</ion-title>
        </ion-toolbar>
      </ion-header>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
</script>

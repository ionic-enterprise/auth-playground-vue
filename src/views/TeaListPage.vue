<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Teas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Teas</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-row class="ion-align-items-stretch" v-for="(row, index) in teaRows" :key="index">
          <ion-col v-for="tea of row" size="12" size-md="6" size-xl="3" :key="tea.id">
            <ion-card>
              <ion-img :src="tea.image"></ion-img>
              <ion-card-header>
                <ion-card-title>{{ tea.name }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>{{ tea.description }}</ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonHeader,
  IonImg,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
} from '@ionic/vue';
import { useTea } from '@/composables/tea';
import { Tea } from '@/models';
import { computed } from 'vue';

const { refresh, teas } = useTea();

const teaRows = computed(() => {
  const teaMatrix: Array<Array<Tea>> = [];
  let row: Array<Tea> = [];
  teas.value.forEach((t) => {
    row.push(t);
    if (row.length === 4) {
      teaMatrix.push(row);
      row = [];
    }
  });
  if (row.length) {
    teaMatrix.push(row);
  }
  return teaMatrix;
});

onIonViewDidEnter(refresh);
</script>

<style scoped>
ion-card {
  height: 100%;
}

ion-col {
  margin-bottom: 1em;
}
</style>

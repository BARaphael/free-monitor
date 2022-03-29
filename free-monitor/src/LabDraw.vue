<script setup>
import { computed } from 'vue'
import DisplayPanel from './components/DisplayPanel.vue';

</script>
<script>
export default {
  data() {
      return {
        globalSettings:{//if properties below are not wrapped in an object, v-model will not work after build 
          isDebug_: true,
          allowCookies:true,
        },
        
      }
  },  
  provide(){
    return{
      isDebug: computed(()=>this.globalSettings.isDebug_),
      allowCookies: computed(()=>this.globalSettings.allowCookies)
    }
  },
}
</script>
<template>
  <p>This is the very beginning of LabDraw.vue.</p>
  <div>
    Debug Mode: 
    <input type="checkbox" v-model="globalSettings.isDebug_">
  </div>
  <div v-if="globalSettings.isDebug_"  style="color: gray">
      For DEBUG only:isDebug
  </div>
  <display-panel></display-panel>
</template>
<style>
p {
 color:red
}
</style>

